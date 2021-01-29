const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const { Sequelize, Op } = require('sequelize');
const { ipcMain, dialog, protocol, shell } = require('electron');
const Series = require('./src/database/models/Series');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${app.getPath('userData')}/database.sqlite`,
});

let mainWindow;
let isDev = false;

process.env.NODE_ENV === 'development' ? (isDev = true) : (isDev = false);

//#region Sequelize
const models = {
    Series: require('./src/database/models/Series')(
        sequelize,
        Sequelize.DataTypes
    ),
    Episodes: require('./src/database/models/Episodes')(
        sequelize,
        Sequelize.DataTypes
    ),
    Tags: require('./src/database/models/Tags')(sequelize, Sequelize.DataTypes),
    SeriesAccesses: require('./src/database/models/SeriesAccesses')(
        sequelize,
        Sequelize.DataTypes
    ),
    SeriesSeasons: require('./src/database/models/SeriesSeasons')(
        sequelize,
        Sequelize.DataTypes
    ),
    SeriesTags: require('./src/database/models/SeriesTags')(
        sequelize,
        Sequelize.DataTypes
    ),
};

models.Series.hasOne(models.SeriesAccesses, { foreignKey: 'series_id' });
models.Series.hasMany(models.Episodes, { foreignKey: 'series_id' });
models.Series.hasMany(models.SeriesSeasons, { foreignKey: 'series_id' });
models.Series.belongsToMany(models.Tags, {
    through: models.SeriesTags,
    foreignKey: 'series_id',
});
models.Tags.belongsToMany(models.Series, {
    through: models.SeriesTags,
    foreignKey: 'tag_id',
});
models.Series.hasMany(models.SeriesTags, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
});
models.SeriesTags.belongsTo(models.Series);
models.Tags.hasMany(models.SeriesTags, {
    foreignKey: { allowNull: false },
    onDelete: 'CASCADE',
});
models.SeriesTags.belongsTo(models.Tags);
//#endregion

//#region MainWindow
async function createMainWindow() {
    try {
        await sequelize.authenticate();
        await sequelize.query('PRAGMA foreign_keys=false;');
        await sequelize.sync();
        await sequelize.query('PRAGMA foreign_keys=true;');
    } catch (err) {
        console.error('Cannot connect to db');
        console.log(err);
    }

    mainWindow = new BrowserWindow({
        width: isDev ? 1600 : 1100,
        height: 800,
        show: false,
        opacity: 0.98,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
        },
    });

    let indexPath;
    if (isDev && process.argv.indexOf('--noDevServer') === -1) {
        indexPath = url.format({
            protocol: 'http:',
            host: 'localhost:8080',
            pathname: 'index.html',
            slashes: true,
        });
    } else {
        indexPath = url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, 'dist', 'index.html'),
            slashes: true,
        });
    }

    mainWindow.loadURL(indexPath);

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();

        if (isDev) mainWindow.webContents.openDevTools();
    });

    mainWindow.on('closed', () => (mainWindow = null));
}
//#endregion

//#region ipcMain
ipcMain.on('series:load', (e, nav) => {
    switch (nav) {
        case 0:
            sendAllSeries();
            break;
    }
});

ipcMain.on('series:add', async (e, show) => {
    try {
        await models.Series.create({
            title: show.title,
            airing_season: show.airing_season,
            airing_year: show.airing_year,
        }).then(async (series) => {
            const episodes = show.episodes.map((episode) => {
                return {
                    number: episode.episodeNumber,
                    series_id: series.id,
                    location: episode.filePath,
                };
            });
            await models.Episodes.bulkCreate(episodes);

            await models.SeriesAccesses.create({
                series_id: series.id,
            });
            await models.SeriesSeasons.create({
                series_id: series.id,
                summary: show.summary,
                directory_location: show.directory_location,
                image_location: show.image_location,
                current_season: show.current_season,
            });

            if (show.tags.length > 0) {
                const tags = show.tags.map((tag) => ({ tag_name: tag }));
                await models.Tags.bulkCreate(tags, {
                    fields: ['tag_name'],
                    updateOnDuplicate: ['tag_name'],
                }).then(async () => {
                    const foundTags = await models.Tags.findAll({
                        where: { tag_name: show.tags },
                        attributes: ['id'],
                    });

                    const tagIds = foundTags.map((foundTag) => ({
                        series_id: series.id,
                        tag_id: foundTag.id,
                    }));

                    await models.SeriesTags.bulkCreate(tagIds, {
                        updateOnDuplicate: ['tag_id'],
                    });
                });
            }
        });

        sendAllSeries();
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('series:edit', async (event, show) => {
    try {
        await models.Series.update(
            {
                title: show.title,
                airing_season: show.airing_season,
                airing_year: show.airing_year,
            },
            { where: { id: show.id } }
        ).then(async () => {
            await models.SeriesSeasons.update(
                {
                    summary: show.summary,
                    directory_location: show.directory_location,
                    image_location: show.image_location,
                    current_season: show.current_season,
                },
                { where: { series_id: show.id } }
            );

            const allTags = await models.SeriesTags.findAll({
                where: { series_id: show.id },
                include: [{ model: models.Tags, attributes: ['tag_name'] }],
                raw: true,
                attributes: ['tag_id'],
            });
            let remainingTags = show.tags;

            const tagsToDelete = allTags.reduce((result, singleTag) => {
                const tagsIndex = remainingTags.indexOf(
                    singleTag['tag.tag_name']
                );
                tagsIndex >= 0
                    ? remainingTags.splice(tagsIndex, 1)
                    : result.push(singleTag);

                return result;
            }, []);

            console.log(tagsToDelete);
            console.log(remainingTags);

            const remainingTagsObj = remainingTags.map((tag) => ({
                tag_name: tag,
            }));

            await models.Tags.bulkCreate(remainingTagsObj, {
                fields: ['tag_name'],
                updateOnDuplicate: ['tag_name'],
            }).then(async () => {
                const foundTags = await models.Tags.findAll({
                    where: { tag_name: remainingTags },
                    attributes: ['id'],
                });

                const remainingTagsWithIds = foundTags.map((foundTag) => ({
                    series_id: show.id,
                    tag_id: foundTag.id,
                }));

                await models.SeriesTags.bulkCreate(remainingTagsWithIds, {
                    updateOnDuplicate: ['tag_id'],
                });
            });

            tagsToDelete.map((tagToDelete) => {
                models.SeriesTags.destroy({
                    where: {
                        tag_id: tagToDelete.tag_id,
                    },
                });
            });

            // if (show.tags.length > 0) {
            //     const tags = show.tags.map((tag) => ({ tag_name: tag }));
            //     await models.Tags.bulkCreate(tags, {
            //         fields: ['tag_name'],
            //         updateOnDuplicate: ['tag_name'],
            //     }).then(async () => {
            //         const foundTags = await models.Tags.findAll({
            //             where: { tag_name: show.tags },
            //             attributes: ['id'],
            //         });

            //         const tagIds = foundTags.map((foundTag) => ({
            //             series_id: show.id,
            //             tag_id: foundTag.id,
            //         }));

            //         await models.SeriesTags.bulkCreate(tagIds, {
            //             updateOnDuplicate: ['tag_id'],
            //         });
            //     });
            // }
        });

        sendAllSeries();
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('image:click', async (event, arg) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
    });

    mainWindow.webContents.send(
        'image:select',
        JSON.stringify(result.filePaths)
    );
});

ipcMain.on('media:click', async (event, arg) => {
    let properties;
    arg === 'series'
        ? (properties = ['openDirectory'])
        : (properties = ['openFile']);

    const result = await dialog.showOpenDialog(mainWindow, {
        properties,
    });

    mainWindow.webContents.send(
        'media:select',
        JSON.stringify(result.filePaths)
    );
});

ipcMain.on('media:delete', async (event, id) => {
    models.Series.destroy({ where: { id } });
    sendAllSeries();
});

ipcMain.on('episode:play', async (event, filePath) => {
    shell.openExternal(path.join('file://', filePath));
});

//#endregion

async function sendAllSeries() {
    try {
        const series = await models.Series.findAll({
            include: [
                models.Episodes,
                models.SeriesAccesses,
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                },
            ],
        });

        mainWindow.webContents.send('series:get', JSON.stringify(series));
    } catch (err) {
        console.log(err);
    }
}

async function sendLatestSeries(amount) {
    try {
        const series = await models.Series.findAll({
            limit: amount,
            include: [
                {
                    model: models.SeriesAccesses,
                    required: true,
                },
            ],
            order: [[models.SeriesAccesses, 'updated_at', 'DESC']],
        });

        mainWindow.webContents.send(
            'series:get_latest',
            JSON.stringify(series)
        );
    } catch (err) {
        console.log(err);
    }
}

app.on('ready', () => {
    createMainWindow();
});

app.whenReady().then(() => {
    protocol.registerFileProtocol('file', (request, callback) => {
        const pathname = decodeURI(request.url.replace('file:///', ''));
        callback(pathname);
    });
});

app.on('activate', () => {
    if (mainWindow === null) createMainWindow();
});

app.allowRendererProcessReuse = true;
