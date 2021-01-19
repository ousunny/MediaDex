const path = require('path');
const url = require('url');
const { app, BrowserWindow } = require('electron');
const { Sequelize } = require('sequelize');
const { ipcMain, dialog } = require('electron');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: `${app.getPath('userData')}/database.sqlite`,
});

let mainWindow;
let isDev = false;

process.env.NODE_ENV === 'development' ? (isDev = true) : (isDev = false);

const models = {
    Series: require('./src/database/models/Series')(
        sequelize,
        Sequelize.DataTypes
    ),
};

//#region MainWindow
async function createMainWindow() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (err) {
        console.error('Cannot connect to db');
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

app.on('ready', () => {
    createMainWindow();
});

app.on('activate', () => {
    if (mainWindow === null) createMainWindow();
});

app.allowRendererProcessReuse = true;
