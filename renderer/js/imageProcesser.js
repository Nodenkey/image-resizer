const selectedImage = document.querySelector('#selected-image');
const selectedImageError = document.querySelector('#selected-image-error');
const imageSelectionPage = document.querySelector('#image-selection-page');

const form = document.querySelector('#size-form');
const formImage = document.querySelector('#size-image');
const imageName = document.querySelector('#filename');
const originalSize = document.querySelector('#original-size');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const backIcon = document.querySelector('#back-icon');
const widthInput = document.querySelector('#width-input');
const heightInput = document.querySelector('#height-input');



const loadImage = (e) => {
    const file = e.target.files[0];

    if (!isImage(file)) {
        selectedImage.value = null;
        toast(false, 'Please select an image')
        return;
    }

    imageSelectionPage.style.display = 'none';
    form.style.display = 'block';

    formImage.src = URL.createObjectURL(file);
    filename.innerHTML = 'File name: ' + file.name;
    

    // Get image dimensions
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = function () {
        originalSize.innerHTML = 'Original size: ' + this.width + ' x ' + this.height;
    }

    //add output path
    outputPath.innerHTML = 'Output path: ' + path.join(os.homedir(), 'imageresizer');
}


// make sure file is an image
const isImage = (file) => {
    const acceptedFileFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gifs'];
    return file && acceptedFileFormats.includes(file.type);
}

const handleReturn = () => {
    imageSelectionPage.style.display = 'block';
    form.style.display = 'none';
    selectedImage.value = null;
}

const sendImage = (e) => {
    e.preventDefault();


    const width = widthInput.value;
    const height = heightInput.value;
    const imgPath = selectedImage.files[0].path;

    // handle validation
    if (width === '' || height === '') {
        toast(false, 'Please enter width and height values')
        return;
    }

    // send params to main using ipcRenderer injected in preload
    ipcRenderer.send('image:resize', {
        imgPath, width, height
    })

}

// catch the image:done event from the main window in main.js using the ipcRenderer from preload
ipcRenderer.on('image:done', () => {
    toast(true, `Image resized to ${widthInput.value} x ${heightInput.value}`)
})

// toastify 
const toast = (success, message) => {
    Toastify.toast({
        text: message,
        duration: 5000,
        close: false,
        style: {
            background: success ? 'rgb(34 197 94)' : 'rgb(239 68 68)',
            color: 'white',
            textAlign: 'center',
            position: 'fixed',
            zIndex: '2',
            width: '100%',
            top: '0',
            marginTop: '-15px',
            padding: '20px'
        }
    })
}

selectedImage.addEventListener('change', loadImage);
backIcon.addEventListener('click', handleReturn);
form.addEventListener('submit', sendImage);