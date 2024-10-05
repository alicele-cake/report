var num = 1;//照片偵測第幾次

let canvas, ctx;

// Replace with your Roboflow publishable key
const publishable_key = "";

// Change these values to set your model name and version
const MODEL_NAME = "-v2";
const MODEL_VERSION = 4;

document.addEventListener('DOMContentLoaded', (event) => {//攝影機啟用操作
    const videoElement = document.getElementById('videoElement');
    const snapshot = document.getElementById('snapshot');
    const captureButton = document.getElementById('captureButton');
    const context = snapshot.getContext('2d');

    // Access the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            videoElement.srcObject = stream;
        })
        .catch((err) => {
            console.error("Error accessing webcam: " + err);
        });

    // Function to capture image and send to model for inference
    captureButton.addEventListener('click', () => {
        snapshot.width = videoElement.videoWidth;
        snapshot.height = videoElement.videoHeight;
        context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

        // Convert canvas to base64 image data
        const imageData = snapshot.toDataURL('image/png');

        // Create an image element to load the captured image
        const img = new Image();
        img.src = imageData;

        // Wait for the image to load before sending to model
        img.onload = function() {
            detectImg(img);
        };
    });
});

function detectImg(img) {//(通過roboflow)預測模型
    // Authenticate and load the Roboflow model
    roboflow.auth({ publishable_key })
        .load({ model: MODEL_NAME, version: MODEL_VERSION })
        .then(function(model) {
            console.log("Model loaded successfully");

            // Perform inference on the loaded model with the captured image
            model.detect(img).then(function(predictions) {
                console.log("Predictions:", predictions);
                console.log(num);

                // Display predictions in the console
                predictions.forEach(function(prediction) {
                    console.log("Class:", prediction.class);
                    console.log("Confidence:", prediction.confidence);
                });

                drawImageWithAnnotations(img, predictions);
                downloadImage(num);
                num++;

                console.log("Number of detected objects:", predictions.length);

            }).catch(function(error) {
                console.error("Error2 performing inference:", error);//!!
            });

        }).catch(function(error) {
            console.error("Error2 loading model:", error);
        });

}


function drawImageWithAnnotations(img, predictions) {//繪圖預測框
    canvas = document.getElementById('imageCanvas');
    ctx = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    predictions.forEach(prediction => {
        const { x, y, width, height } = prediction.bbox;
        const { class: className, confidence, color } = prediction;

        // Convert center coordinates to top-left coordinates
        const topLeftX = x - (width / 2);
        const topLeftY = y - (height / 2);

        // Draw bounding box
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(topLeftX, topLeftY, width, height);

        // Draw text background
        ctx.fillStyle = color;
        ctx.fillRect(topLeftX, topLeftY - 20, ctx.measureText(`${className} (${confidence.toFixed(2)})`).width + 10, 20);

        // Draw text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Arial';
        ctx.fillText(`${className} (${confidence.toFixed(2)})`, topLeftX + 5, topLeftY - 5);
    });

    canvas.style.display = 'block';
}

function downloadImage(num) {//下載圖片
    setInterval(updateDateTime, 60000); // 每分鐘更新一次
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    const date = updateDateTime();
    link.download = date + '{' + num + '}.png';
    link.click();
}

function updateDateTime() {//計算今天時間
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份從0開始
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const formattedTime = `${hours}:${minutes}`;
    const dateTimeString = `${formattedDate}---${formattedTime}`;

    return dateTimeString;
}

document.getElementById('imageUpload').addEventListener('change', handleImageUpload);

function handleImageUpload(event) {//上傳圖片
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            detectImg(img);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}