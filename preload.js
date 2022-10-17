const { channel } = require('diagnostics_channel');
const {contextBridge, ipcRenderer} = require('electron');
const os = require('os');
const path = require('path');
const Toastify = require('toastify-js');


contextBridge.exposeInMainWorld('os', {
    homedir: () => os.homedir()
})

contextBridge.exposeInMainWorld('path', {
    join: (...args) => path.join(...args)
})

contextBridge.exposeInMainWorld('Toastify', {
    toast: (options) => Toastify(options).showToast()
})

contextBridge.exposeInMainWorld('ipcRenderer', {
    send: (channel, data) => ipcRenderer.send(channel, data),
    // event is always first for form and iputs event handlers so spread it out and take only args
    on: (channel, func) => ipcRenderer.on(channel, (e, ...args) => func(...args))
})

