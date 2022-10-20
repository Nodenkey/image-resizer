// Modules
const {dialog, BrowserWindow} = require('electron');
const path = require('path');
const {autoUpdater} = require('electron-updater');

// Enable logging
const log = require('electron-log');
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Disable auto downloading
autoUpdater.autoDownload = false

// Check for updates
exports.check = () => {

    let progressWindow;

    autoUpdater.checkForUpdates()
    // track download progress percent
    let downloadPercent = 0;

    // Listen for updates found
    autoUpdater.on('update-available', () => {

        // prompt user to download update
        dialog.showMessageBox({
            type: 'info',
            title: 'Update available',
            message: 'A new version of Image-resizer is available. Do you want to update now?',
            buttons:  ['Update', 'No'],
            UpdateId: 0, // bound to buttons array
            NoId: 1 // bound to buttons array
        }).then(result => {
             // if not update button, return
             if (result.response !== 0) {
                autoUpdater.logger.info('Clicked No');
                return;
            }

            // else show download and show user download progress in a new window

            autoUpdater.logger.info('Clicked Update');

            // start download
            autoUpdater.downloadUpdate();

            // create progress window
            progressWindow = new BrowserWindow({
                width: 450,
                height: 40,
                useContentSize: true,
                autoHideMenuBar: true,
                maximizable: false,
                fullscreen: false,
                fullscreenable: false,
                resizable: false,
                backgroundColor: '#111827',
                webPreferences: {
                    contextIsolation: true,
                    nodeIntegration: true,
                    preload: path.join(__dirname, 'preload.js')
                }
            })

            // load progress html
            progressWindow.loadFile(path.join(__dirname, './renderer/html/updateProgress.html'));

            // handle close progress window
            progressWindow.on('closed', () => {progressWindow = null})
        })
    })

      // track download progress
      autoUpdater.on('download-progress', (d) => {
        downloadPercent = d.percent;

        // log progress in logger
        autoUpdater.logger.info(`percent: ${downloadPercent}`);

        // send percent to progress window
        if (progressWindow) {
            progressWindow.webContents.send('progress:percent', downloadPercent);
        }
    })

    // close progress window on download complete
    autoUpdater.on('update-downloaded', () => {
        if (progressWindow) {
            progressWindow.close();
            progressWindow = null;
        }

        // prompt user to quit and install
        dialog.showMessageBox({
            type: 'info',
            title: 'Update Ready',
            message: 'A new version of Image-resizer is ready. Quit and Install now?',
            buttons: ['Yes', 'Later'],
            yesId: 0,
            noId: 1,
        }).then(result => {
            // update if yes
            if (result.response === 0) {
                autoUpdater.quitAndInstall();
            }
        })
    })
}