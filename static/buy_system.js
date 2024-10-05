// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL:
        "",
    projectId: "",
    storageBucket: "project-debdb.appspot.com",
    messagingSenderId: "301439890163",
    appId: "1:301439890163:web:0fd9c306b05ff96a93bd86",
    measurementId: "G-TYP8TQENW9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

var num = 1; // 照片偵測第幾次
let canvas, ctx;

// Replace with your Roboflow publishable key
const publishable_key = "";

// Change these values to set your model name and version
const MODEL_NAME = "-v2";
const MODEL_VERSION = 4;

let predictions = [];
let predictionListeners = []; // 用于存储所有的回调函数

export function detectImg(img) {
    roboflow
        .auth({ publishable_key })
        .load({ model: MODEL_NAME, version: MODEL_VERSION })
        .then(function (model) {
            console.log("Model loaded successfully");

            model.detect(img).then(function (results) {
                predictions = results;
                console.log("Predictions:", predictions);


                //初始化localStorage
                localStorage.removeItem('predictions');

                // 存储预测数据到 localStorage
                localStorage.setItem('predictions', JSON.stringify(predictions));

                // 通知所有的监听器
                predictionListeners.forEach(callback => callback(predictions));

                drawImageWithAnnotations(img, predictions);//測試用!!
                downloadImage(num);//測試用!!
                num++;

                // 在此处调用跳转函数
                redirectToCheckPage();
            }).catch(function (error) {
                console.error("Error performing inference:", error);
            });
        })
        .catch(function (error) {
            console.error("Error loading model:", error);
        });
}

// 注册一个监听器
export function onPredictionsUpdated(callback) {
    predictionListeners.push(callback);
}

// 跳轉到check.html
function redirectToCheckPage() {
    window.location.href = '/check';
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


// Function to get the current date and time
function getCurrentDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to insert data into bill
async function insertBillData() {
    const nextBillID = await getNextBillID();
    const currentTimestamp = Timestamp.now();
    const newData = {
        bill_id: nextBillID,
        date: currentTimestamp,
    };
    try {
        await addDoc(collection(db, "bill"), newData);
        console.log("Bill Data inserted successfully");
    } catch (error) {
        console.error("Error inserting Bill data:", error);
    }
}

// 加載動畫
function showLoading() {
    // 隐藏按钮
    document.getElementById("captureButton").style.display = "none";
    // 显示加载动画
    document.getElementById("loadingSpinner").style.display = "block";
}




//測試用區域Test
// document
//     .getElementById("imageUpload")
//     .addEventListener("change", handleImageUpload);

// function handleImageUpload(event) {
//     const file = event.target.files[0];
//     const reader = new FileReader();
//     reader.onload = function (e) {
//         const img = new Image();
//         img.onload = function () {
//             detectImg(img);
//         };
//         img.src = e.target.result;
//     };
//     reader.readAsDataURL(file);
// }

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

// Roboflow related functions
document.addEventListener("DOMContentLoaded", (event) => {
    const videoElement = document.getElementById("videoElement");
    const snapshot = document.getElementById("snapshot");
    const captureButton = document.getElementById("captureButton");
    const context = snapshot.getContext("2d");

    // Access the webcam
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
            videoElement.srcObject = stream;
        })
        .catch((err) => {
            console.error("Error accessing webcam: " + err);
        });

    // Function to capture image and send to model for inference
    captureButton.addEventListener("click", () => {
        snapshot.width = videoElement.videoWidth;
        snapshot.height = videoElement.videoHeight;
        context.drawImage(
            videoElement,
            0,
            0,
            videoElement.videoWidth,
            videoElement.videoHeight,
        );

        // Convert canvas to base64 image data
        const imageData = snapshot.toDataURL("image/png");

        // Create an image element to load the captured image
        const img = new Image();
        img.src = imageData;

        // Wait for the image to load before sending to model
        img.onload = function () {
            detectImg(img);
        };
    });
});


