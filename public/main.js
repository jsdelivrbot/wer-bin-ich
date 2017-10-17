/**
 * Created by sebschwa on 17.10.17.
 */
function loadImageFileAsURL() {
    console.log('load image file');
    let filesSelected = document.getElementById("inputFileToLoad").files;
    if (filesSelected.length > 0) {
        let fileToLoad = filesSelected[0];

        let fileReader = new FileReader();

        fileReader.onload = function (fileLoadedEvent) {
            let file = fileLoadedEvent.target.result;
            console.info("sending file...");
            sendImage(file);
        }
        fileReader.readAsDataURL(fileToLoad);
    }
}

function sendImage(fileBase64){
    console.log("call me");
    let img = makeblob(fileBase64);
    let params = {
        // Request parameters
    };
    $('#output_success').addClass('hidden');
    $('#output_error').addClass('hidden');
    $.ajax({
        url: "https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize?" + $.param(params),
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");

            // NOTE: Replace the "Ocp-Apim-Subscription-Key" value with a valid subscription key.
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "69f18f512ee542a099897c13dc255245");
        },
        type: "POST",
        cache: false,
        processData: false,
        data: img,
    })
        .done(function (data) {
            console.log(data[0].scores);
            let score = data[0].scores;

            let anger = parseFloat((score.anger * 100).toFixed(2));
            let fear = parseFloat((score.fear * 100).toFixed(2));
            let neutral = parseFloat((score.neutral * 100).toFixed(2));
            let sadness = parseFloat((score.sadness * 100).toFixed(2));
            let contempt = parseFloat((score.contempt * 100).toFixed(2));
            let disgust = parseFloat((score.disgust * 100).toFixed(2));
            let happiness = parseFloat((score.happiness * 100).toFixed(2));
            let surprise = parseFloat((score.surprise * 100).toFixed(2));
            if (anger > 50 || disgust > 20 || contempt > 20 || sadness > 30) {
                $('#output_success').removeClass('hidden');
            } else {
                $('#output_error').removeClass('hidden');
            }

            let a = [['anger', anger], ['fear', fear], ['neutral', neutral], ['sadness', sadness],
                ['contempt', contempt], ['disgust', disgust], ['happiness', happiness], ['surprise', surprise]];

            a.sort(compareSecondColumn);


            console.log(a);


            $('#txt_top1').text(a[7][0]);
            $('#txt_top2').text(a[6][0]);
            $('#txt_top3').text(a[5][0]);
            $('#txt_top4').text(a[4][0]);

            $('#val_top1').text(a[7][1]);
            $('#val_top2').text(a[6][1]);
            $('#val_top3').text(a[5][1]);
            $('#val_top4').text(a[4][1]);

        })
        .fail(function () {
            //alert("error");
        });

}


console.log("ready!");

/** FUNCTIONS ** /
 *
 * @type {Element}
 */
function handleVideo(stream) {
    video.src = window.URL.createObjectURL(stream);
}

function videoError(e) {
    // do something
}




function myclick() {
    console.log("check");
    $('#output_error').addClass('hidden');
    $('#output_success').addClass('hidden');

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    //convert to desired file format
    let dataURI = canvas.toDataURL('image/jpeg');
    sendImage(dataURI);

}

function makeblob(dataURL) {
    let BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
        let parts = dataURL.split(',');
        let contentType = parts[0].split(':')[1];
        let raw = decodeURIComponent(parts[1]);
        return new Blob([raw], {type: contentType});
    }
    let parts = dataURL.split(BASE64_MARKER);
    let contentType = parts[0].split(':')[1];
    let raw = window.atob(parts[1]);
    let rawLength = raw.length;

    let uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
}


function compareSecondColumn(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

function getBase64(file) {
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        console.log(reader.result);
    };
    reader.onerror = function (error) {
        console.log('Error: ', error);
    };
}




let video = document.querySelector("#videoElement");

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, handleVideo, videoError);
}

let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
//draw image to canvas. scale to target dimensions
