const progressBar = document.querySelector('#progress-bar');

ipcRenderer.on('progress:percent', (args) => {
    progressBar.value = Math.round(args);
})