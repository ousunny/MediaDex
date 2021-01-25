const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const { Sequelize, Op } = require('sequelize');
const { ipcMain, dialog } = require('electron');
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
models.Series.belongsToMany(models.Tags, { through: models.SeriesTags });
models.Tags.belongsToMany(models.Series, { through: models.SeriesTags });
//#endregion

//#region MainWindow
async function createMainWindow() {
    try {
        await sequelize.authenticate();
        await sequelize.query('PRAGMA foreign_keys=false;');
        await sequelize.sync({ force: true });
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
            sendLatestSeries(4);
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
            await models.SeriesAccesses.create({
                series_id: series.id,
            });
            await models.SeriesSeasons.create({
                series_id: series.id,
                summary: show.summary,
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
//#endregion

async function sendAllSeries() {
    try {
        const series = await models.Series.findAll();
        console.log(series);
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

app.on('activate', () => {
    if (mainWindow === null) createMainWindow();
});

app.allowRendererProcessReuse = true;
