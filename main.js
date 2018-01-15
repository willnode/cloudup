var cloudName = '';
var uploadPreset = '';
var apiKey = '';
var apiSecret = '';

window.onload = function () {

    dropbox = document.getElementById("dropbox");
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);

    handle('cloudName', { setValue: (val) => {cloudName = val}});
    handle('uploadPreset', { setValue: (val) => {uploadPreset = val}});
    handle('apiKey', { setValue: (val) => {apiKey = val}});
    handle('apiSecret', { setValue: (val) => {apiSecret = val}});

}

function handle (value, callback)
{
    callback.setValue(localStorage.getItem(value));
    var ui = document.getElementById(value);
    ui.value = localStorage.getItem(value);
    ui.oninput = () => {
        callback.setValue(ui.value);
        localStorage.setItem(value, ui.value);
    }
}


/* ************************ Drag and drop ***************** */
function dragenter(e) {
    e.stopPropagation();
    e.preventDefault();
}

function dragover(e) {
    e.stopPropagation();
    e.preventDefault();
}

function drop(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    for (var i = 0; i < files.length; i++) {
        uploadFile(files[i]); // call the function to upload the file
    }
}


/* *********** Upload file to Cloudinary ******************** */
// http://cloudinary.com/documentation/upload_images#creating_api_authentication_signatures
function uploadFile(file) {
    var url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    var _url = document.getElementById('url');
    var _gallery = document.getElementById('gallery');
    xhr.open('POST', url, true);
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    // Reset the upload progress bar
    document.getElementById('progress').style.width = 0;

    // Update progress (can be used to show progress indicator)
    xhr.upload.addEventListener("progress", function (e) {
        var progress = ((e.loaded * 100.0) / e.total);
        document.getElementById('progress').style.width = progress + "%";

        console.log(`fileuploadprogress data.loaded: ${e.loaded},
  data.total: ${e.total}`);
    });

    xhr.onreadystatechange = function (e) {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                // File uploaded successfully
                var response = JSON.parse(xhr.responseText);
                // https://res.cloudinary.com/cloudName/image/upload/v1483481128/public_id.jpg
                var url = response.secure_url;
                // Create a thumbnail of the uploaded image, with 300px width
                var tokens = url.split('/');
                tokens.splice(-3, 0, 'c_limit,w_300');
                var img = new Image(); // HTML5 Constructor
                img.src = tokens.join('/');
                img.title = response.public_id;
                _gallery.appendChild(img);
                _url.innerHTML = url;
                _url.className = '';
            } else {
                _url.innerHTML = `Upload Fail (${xhr.status}). See console.`;
                _url.className = 'error';
            }
        }

    };

    fd.append('timestamp', Date.now() / 1000 | 0);
    fd.append('upload_preset', uploadPreset);
    fd.append('signature', sha1(`timestamp=${Date.now() / 1000 | 0}&upload_preset=${uploadPreset}` + apiSecret))
    fd.append('file', file);
    fd.append('api_key', apiKey);
    xhr.send(fd);
}