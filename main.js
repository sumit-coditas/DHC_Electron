
const { app, BrowserWindow, session, protocol, ipcMain } = require('electron');
const path = require('path');
const {shell} = require('electron');
const url = require('url');
const { localStorage } = require('electron-browser-storage');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");
let win; // this wills store the window object


autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


function createDefaultWindow() {
    win = new BrowserWindow({width: 900, height: 680});
    win.loadURL(`file://${__dirname}/version.html`);
    win.on('closed', () => app.quit());
//   return win;
}

// when the update is ready, notify the BrowserWindow
autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updateReady')
});

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

// autoUpdater.on('update-downloaded', (info) => {
//     win.webContents.send('updateReady')
// });

// app.on('ready', function() {
//   createDefaultWindow();
//   autoUpdater.checkForUpdates();
// });
// ipcMain.on("quitAndInstall", (event, arg) => {
//     autoUpdater.quitAndInstall();
// })



// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...');
// })
// autoUpdater.on('update-available', (info) => {
//   sendStatusToWindow('Update available.');
// })
// autoUpdater.on('update-not-available', (info) => {
//   sendStatusToWindow('Update not available.');
// })
// autoUpdater.on('error', (err) => {
//   sendStatusToWindow('Error in auto-updater. ' + err);
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   sendStatusToWindow(log_message);
// })
// autoUpdater.on('update-downloaded', (info) => {
//   sendStatusToWindow('Update downloaded');
// });

let mainWindow;
// Keep a reference for dev mode
let dev = false;


ipcMain.on('Open default directory', (event, folderPath) => {
    shell.openItem(folderPath);
    // shell.showItemInFolder(folderPath);
});


// app.commandLine.appendSwitch('inspect', '5858')
if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
    dev = true;
}

// Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// info: https://github.com/electron/electron/issues/9691
if (process.platform === 'win32') {
    app.commandLine.appendSwitch('high-dpi-support', 'true');
    app.commandLine.appendSwitch('force-device-scale-factor', '1');
}

// my application redirect uri
const redirectUri = 'http://localhost:3000/';

// Prepare to filter only the callbacks for my redirectUri
const filter = {
    urls: [redirectUri + '*']
};


function createWindow() {

    autoUpdater.checkForUpdatesAndNotify();
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        show: false
    });

    // and load the index.html of the app.
    let indexPath;
    if (dev && process.argv.indexOf('--noDevServer') === -1) {
        console.log('true');
        indexPath = url.format({
            protocol: 'http:',
            host: 'localhost:3000',
            slashes: true
        });
    } else {
        indexPath = url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, 'dist/index.html'),
            protocol: 'file:',
            slashes: true
        });
    }
    mainWindow.loadURL(indexPath);

    // Don't show until we are ready and loaded
    mainWindow.once('ready-to-show', async () => {

        //clearing office redirect token
        await localStorage.removeItem('OFFICE_REDIRECT_CODE')

        mainWindow.show();

        // Open the DevTools automatically if developing
        if (dev) {
            mainWindow.webContents.openDevTools();
        }

    });

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    mainWindow.webContents.on('will-navigate', function (event, newUrl) {
        console.log('will-navigate', newUrl);
        if (newUrl.includes('https://login.microsoftonline.com/common/oauth2')) {
            let child = new BrowserWindow({ parent: mainWindow });
            child.setAlwaysOnTop(true);
            child.loadURL(newUrl);
            event.preventDefault();
            child.once('ready-to-show', () => {
                child.show();
                child.webContents.openDevTools();
            });

            child.webContents.on('will-navigate', function (event, newUrl1) {
                console.log('inside child will-navigate', newUrl1);
            });

            child.webContents.on('will-redirect', async (event, newUrl) => {
                console.log('will-redirect', newUrl);
                if (newUrl.includes('?code=')) {
                    console.log('url found', newUrl.split('/?code=').pop());
                    await localStorage.setItem('OFFICE_REDIRECT_CODE', newUrl.split('/?code=').pop().split('&session_state=')[0])
                    // mainWindow.loadURL(indexPath)
                    event.preventDefault();
                    child.close()
                    mainWindow.reload()
                }
            });
        }
    });
    mainWindow.webContents.openDevTools();
}


// app.on('ready', createWindow);
app.on('ready', function() {
  createDefaultWindow();
  createWindow();
  autoUpdater.checkForUpdates();
});

ipcMain.on("quitAndInstall", (event, arg) => {
    autoUpdater.quitAndInstall();
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});







// 'use strict';

// // Import parts of electron to use
// const { app, BrowserWindow, session } = require('electron');
// const path = require('path');
// const {shell} = require('electron');
// // var remote = require('electron').remote;
// // var shell = remote.shell;
// const {ipcMain} = require('electron');
// const url = require('url');
// const axios = require('axios');
// const { localStorage } = require('electron-browser-storage');
// const log = require('electron-log');
// const {autoUpdater} = require("electron-updater");


// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// log.info('App starting...');



// // require('update-electron-app')
// // ({
// //     repo: 'https://github.com/sumit-coditas/DHC_Electron',
// //     updateInterval: '5 minute',
// //     logger: require('electron-log')
// //   })

// let win;

// // function sendStatusToWindow(text) {
// //   log.info(text);
// //   win.webContents.send('message', text);
// // }
// // function createDefaultWindow() {
// //   win = new BrowserWindow();
// //   win.webContents.openDevTools();
// //   win.on('closed', () => {
// //     win = null;
// //   });
// //   win.loadURL(`file://${__dirname}/version.html`);
// //   return win;
// // }
// autoUpdater.on('checking-for-update', () => {
//     logger.info('checkForUpdateAndNotify');
//   sendStatusToWindow('Checking for update...');
// })
// autoUpdater.on('update-available', (info) => {
//     logger.info('update-availble');
//   sendStatusToWindow('Update available.');
// })
// autoUpdater.on('update-not-available', (info) => {
//     logger.info('update-not-available');
//   sendStatusToWindow('Update not available.');
// })
// autoUpdater.on('error', (err) => {
//     logger.info('error');
//   sendStatusToWindow('Error in auto-updater. ' + err);
// })
// autoUpdater.on('download-progress', (progressObj) => {
//   let log_message = "Download speed: " + progressObj.bytesPerSecond;
//   log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
//   log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
//   sendStatusToWindow(log_message);
// })
// autoUpdater.on('update-downloaded', (info) => {
//   sendStatusToWindow('Update downloaded');
// });

// let mainWindow;
// // mainWindow.webContents.openDevTools();
// // Keep a reference for dev mode
// let dev = false;


// ipcMain.on('Open default directory', (event, folderPath) => {
//     shell.openItem(folderPath);
//     // shell.showItemInFolder(folderPath);
// });


// // app.commandLine.appendSwitch('inspect', '5858')
// if (process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath)) {
//     dev = true;
// }

// // Temporary fix broken high-dpi scale factor on Windows (125% scaling)
// // info: https://github.com/electron/electron/issues/9691
// if (process.platform === 'win32') {
//     app.commandLine.appendSwitch('high-dpi-support', 'true');
//     app.commandLine.appendSwitch('force-device-scale-factor', '1');
// }

// // my application redirect uri
// const redirectUri = 'http://localhost:3000/';

// // Prepare to filter only the callbacks for my redirectUri
// const filter = {
//     urls: [redirectUri + '*']
// };


// function createWindow() {

//     autoUpdater.checkForUpdatesAndNotify();
//     // Create the browser window.
//     mainWindow = new BrowserWindow({
//         width: 1024,
//         height: 768,
//         show: false,
//         webPreferences: {
//             webSecurity: false
//           }
//     });

//     // and load the index.html of the app.
//     let indexPath;
//     if (dev && process.argv.indexOf('--noDevServer') === -1) {
//         console.log('true');
//         indexPath = url.format({
//             protocol: 'http:',
//             host: 'localhost:3000',
//             slashes: true
//         });
//     } else {
//         indexPath = url.format({
//             protocol: 'file:',
//             pathname: path.join(__dirname, 'dist/index.html'),
//             protocol: 'file:',
//             slashes: true
//         });
//     }
//     mainWindow.loadURL(indexPath);

//     // Don't show until we are ready and loaded
//     mainWindow.once('ready-to-show', async () => {

//         //clearing office redirect token
//         await localStorage.removeItem('OFFICE_REDIRECT_CODE')

//         mainWindow.show();

//         // Open the DevTools automatically if developing
//         if (dev) {
//             mainWindow.webContents.openDevTools();
//         }

//     });

//     // Emitted when the window is closed.
//     mainWindow.on('closed', function () {
//         mainWindow = null;
//     });

//     mainWindow.webContents.on('will-navigate', function (event, newUrl) {
//         console.log('will-navigate', newUrl);
//         if (newUrl.includes('https://login.microsoftonline.com/common/oauth2')) {
//             let child = new BrowserWindow({ parent: mainWindow });
//             child.setAlwaysOnTop(true);
//             child.loadURL(newUrl);
//             event.preventDefault();
//             child.once('ready-to-show', () => {
//                 child.show();
//                 child.webContents.openDevTools();
//             });

//             child.webContents.on('will-navigate', function (event, newUrl1) {
//                 console.log('inside child will-navigate', newUrl1);
//             });

//             child.webContents.on('will-redirect', async (event, newUrl) => {
//                 console.log('will-redirect', newUrl);
//                 if (newUrl.includes('?code=')) {
//                     console.log('url found', newUrl.split('/?code=').pop());
//                     await localStorage.setItem('OFFICE_REDIRECT_CODE', newUrl.split('/?code=').pop().split('&session_state=')[0])
//                     // mainWindow.loadURL(indexPath)
//                     event.preventDefault();
//                     child.close()
//                     mainWindow.reload()
//                 }
//             });
//         }
//     });
//     mainWindow.webContents.openDevTools();

// }


// app.on('ready', createWindow);

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('activate', () => {
//     if (mainWindow === null) {
//         createWindow();
//     }
// });
