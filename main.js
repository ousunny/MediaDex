const fs = require('fs');
const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const { Sequelize, Op } = require('sequelize');
const { ipcMain, dialog, protocol, shell, Menu } = require('electron');

const exts = ['.mkv', '.mp4'];

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${app.getPath('userData')}/database.sqlite`,
});

let mainWindow;
let isDev = false;
const isMac = process.platform === 'darwin' ? true : false;

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
        width: isDev ? 1600 : 1250,
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
ipcMain.on('series:load_details', (e, showId) => {
    sendSeriesDetails(showId);
});

ipcMain.on('series:load_recent', async (e, amount) => {
    sendRecentSeries(amount);
});

ipcMain.on('series:load_latest', async (e, amount) => {
    sendLatestSeries(amount);
});

ipcMain.on('series:load_bookmarks', async () => {
    sendBookmarks();
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

        sendLatestSeries(4);
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
        });

        sendSeriesDetails(show.id);
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('series:directory_change', async (event, update) => {
    try {
        if (update.type === 'change')
            await models.SeriesSeasons.update(
                { directory_location: update.directory_location },
                { where: { series_id: update.id } }
            );

        await models.Episodes.destroy({ where: { series_id: update.id } });

        fs.readdir(update.directory_location, async (err, filenames) => {
            const episodes = filenames.reduce((results, filename) => {
                if (exts.indexOf(path.extname(filename)) >= 0) {
                    const splitFilename = filename.split('-');
                    const episodeNumber = parseInt(
                        splitFilename[splitFilename.length - 1].match(/\d+/)[0]
                    );

                    results.push({
                        location: path.join(
                            update.directory_location,
                            filename
                        ),
                        series_id: update.id,
                        number: episodeNumber,
                    });
                }

                return results;
            }, []);

            await models.Episodes.bulkCreate(episodes);
        });

        sendSeriesDetails(update.id);
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('series:search', async (event, term) => {
    if (term === '') {
        sendSeriesBrowse('ALL');
        return;
    }

    try {
        const series = await models.Series.findAll({
            include: [
                models.Episodes,
                models.SeriesAccesses,
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                    required: false,
                },
            ],
            required: false,
            where: {
                [Op.or]: [
                    {
                        '$series_tags.tag.tag_name$': {
                            [Op.like]: `%${term}%`,
                        },
                    },
                    { '$series.title$': { [Op.like]: `%${term}%` } },
                ],
            },
        });

        mainWindow.webContents.send(
            'series:browse_get',
            JSON.stringify(series)
        );
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('series:browse', async (event, letter) => {
    sendSeriesBrowse(letter);
});

ipcMain.on('series:bookmark', async (event, bookmark) => {
    try {
        await models.SeriesSeasons.update(
            { favorite: !bookmark.favorite },
            { where: { series_id: bookmark.seriesId } }
        );

        sendSeriesDetails(bookmark.seriesId);
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('tags:load', async (event) => {
    try {
        const tags = await models.Tags.findAll();
        mainWindow.webContents.send('tags:get', JSON.stringify(tags));
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('tags:delete', async (event, id) => {
    try {
        await models.Tags.destroy({ where: { id } });

        const tags = await models.Tags.findAll();
        mainWindow.webContents.send('tags:get', JSON.stringify(tags));
    } catch (err) {
        console.log(err);
    }
});

ipcMain.on('image:click', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
    });

    mainWindow.webContents.send(
        'image:select',
        JSON.stringify(result.filePaths)
    );
});

ipcMain.on('media:click', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
    });

    mainWindow.webContents.send(
        'media:select',
        JSON.stringify(result.filePaths)
    );
});

ipcMain.on('media:delete', async (event, id) => {
    models.Series.destroy({ where: { id } });
});

ipcMain.on('episode:play', async (event, episode) => {
    shell.openExternal(path.join('file://', episode.location));

    await models.SeriesAccesses.update(
        { last_accessed: new Date(Date.now()) },
        { where: { series_id: episode.seriesId } }
    );

    sendRecentSeries(4);
});

//#endregion

async function sendSeriesDetails(showId) {
    try {
        const show = await models.Series.findOne({
            include: [
                models.Episodes,
                models.SeriesAccesses,
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                },
            ],
            where: { id: showId },
            order: [[models.Episodes, 'number']],
        });

        mainWindow.webContents.send('series:get_details', JSON.stringify(show));
    } catch (err) {
        console.log(err);
    }
}

async function sendRecentSeries(amount) {
    try {
        let series = await models.Series.findAll({
            include: [
                models.Episodes,
                {
                    model: models.SeriesAccesses,
                    required: false,
                },
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                },
            ],
            where: {
                '$series_access.last_accessed$': { [Op.ne]: null },
            },
            subQuery: false,
            required: false,

            order: [[models.SeriesAccesses, 'last_accessed', 'DESC']],
        });

        series = series.slice(0, amount);

        mainWindow.webContents.send(
            'series:get_recent',
            JSON.stringify(series)
        );
    } catch (err) {
        console.log(err);
    }
}

async function sendLatestSeries(amount) {
    try {
        let series = await models.Series.findAll({
            include: [
                models.Episodes,
                { model: models.SeriesAccesses, required: false },
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                },
            ],
            subQuery: false,
            required: false,
            order: [[models.SeriesAccesses, 'updated_at', 'DESC']],
        });

        series = series.slice(0, amount);

        mainWindow.webContents.send(
            'series:get_latest',
            JSON.stringify(series)
        );
    } catch (err) {
        console.log(err);
    }
}

async function sendBookmarks() {
    try {
        let series = await models.Series.findAll({
            include: [
                models.Episodes,
                models.SeriesAccesses,
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                },
            ],
            subQuery: false,
            required: false,
            where: {
                '$series_seasons.favorite$': true,
            },
        });

        mainWindow.webContents.send(
            'series:get_bookmarks',
            JSON.stringify(series)
        );
    } catch (err) {
        console.log(err);
    }
}

async function sendSeriesBrowse(letter) {
    if (letter === 'ALL') {
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

            mainWindow.webContents.send(
                'series:browse_get',
                JSON.stringify(series)
            );
        } catch (err) {
            console.log(err);
        }
        return;
    }

    try {
        const series = await models.Series.findAll({
            include: [
                models.Episodes,
                models.SeriesAccesses,
                models.SeriesSeasons,
                {
                    model: models.SeriesTags,
                    include: [models.Tags],
                    required: false,
                },
            ],
            required: false,
            where: { '$series.title$': { [Op.like]: `${letter}%` } },
        });

        mainWindow.webContents.send(
            'series:browse_get',
            JSON.stringify(series)
        );
    } catch (err) {
        console.log(err);
    }
}

//#region Menu
const menu = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    ...(isDev
        ? [
              {
                  label: 'Developer',
                  submenu: [
                      { role: 'reload' },
                      { role: 'forcereload' },
                      { type: 'separator' },
                      { role: 'toggledevtools' },
                  ],
              },
          ]
        : []),
];
//#endregion

app.on('ready', () => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);
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
