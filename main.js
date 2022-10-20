const {app, BrowserWindow, Menu, ipcMain, shell, autoUpdater} = require('electron');
const path = require('path');
const os = require('os');
const resizeImg = require('resize-img');
const fs = require('fs');
const updater = require('./updater');

// use npx electronmon . to start process (in script as dev)

const isMAC = process.platform === 'darwin';
const isDev = !app.isPackaged;

// initialise mainWindow so it is available globally
let mainWindow;

// Create main window
const createMainWindow = () => {
    // create window from BrowserWindow class
    mainWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: isDev ? 1200 : 800,
        height: 600,
        backgroundColor: '#111827',
        icon: '/assets/icons/favicon.ico',
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    // open dev tools if in dev mode
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // load file from renderer
    mainWindow.loadFile(path.join(__dirname, './renderer/html/index.html'));
}

// Create main window
const createAboutWindow = () => {
    // create window from BrowserWindow class
    const aboutWindow = new BrowserWindow({
        title: 'Image Resizer',
        width: 250,
        height: 300,
    })

    // load file from renderer
    aboutWindow.loadFile(path.join(__dirname, './renderer/html/about.html'));
}

// load windows only when app is ready to load files
app.whenReady().then(() => {
    createMainWindow();

    //Implement menu
    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);


    // check for updates every 2 secs
    if (!isDev) {
        setTimeout(updater.check, 2000)
    }

    // Especially for mac, when icon is clicked and there is no window, a new window should pop up
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow()
        }
    })

    mainWindow.on('closed', () =>{
        // clean up initialised main window
        mainWindow = null;
    })
})

// same as above
// app.on('ready', () => {
//     createMainWindow()
// })

// Menu Template
const menu = [
    //shortcut
    // {
    //     role: 'fileMenu'
    // }
    ...(isMAC ? [{
        label: app.name,
        submenu: [
            {
            label: 'About Image Resizer',
            click: createAboutWindow
            }
        ]
    }] : []),
    {
        label: 'File',
        submenu: [
            {
                label: 'Quit',
                click: () => app.quit(),
                accelerator: 'CmdorCtrl+Q'
            }
        ]
    },
    ...(!isMAC ? [{
        label: 'Help',
        submenu: [
            {
            label: 'About Image Resizer'
            }
        ]
    }]: []),
]

// respond to ipcRenderer from imageProcessor.js
ipcMain.on('image:resize', (e, options) => {
    options.dest = path.join(os.homedir(), 'imageresizer')
    resizeImage(options)
})

// Resize the image
const resizeImage = async ({dest, width, height, imgPath}) => {
    try {
        const newPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +width,
            height: +height
        });

        // create filename
        const filename = path.basename(imgPath);

        // check if destination directory exists || create one
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest);
        }

        // write file to dest folder
        fs.writeFileSync(path.join(dest, filename), newPath);

        // send success to renderer
        mainWindow.webContents.send('image:done');

        // open dest folder for users
        shell.openPath(dest);
    
    } catch (error) {
        console.log(error);
    }

}

app.on('window-all-closed', () => {
    // quit all windows completely for all Os when all windows are closed except MAC (native functionality)
    if (!isMAC) {
        app.quit();
    }
})

