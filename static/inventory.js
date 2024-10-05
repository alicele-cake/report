// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs,getDoc, doc, updateDoc, deleteDoc, query, orderBy, limit,Timestamp,where } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";


// Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: ""
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

//得到Restock 的ID
async function getNextRestockID() {
    const billQuery = query(collection(db, "Restock"), orderBy("Restock_id", "desc"), limit(1));
    const snapshot = await getDocs(billQuery);
    if (!snapshot.empty) {
        const maxKey = snapshot.docs[0].data().Restock_id;
        return maxKey + 1;
    } else {
        return 0;
    }
}

//得到現在的商品價格與水果類別
async function getClassIdMap() {
    const snapshot = await getDocs(collection(db, "classes"));
    if (!snapshot.empty) {
        const classIdMap = {};
        snapshot.forEach(doc => {
            const data = doc.data();
            classIdMap[data.class_name] = { 
                id: data.class_id, 
                price: data['unit price'] 
            };
        });
        return classIdMap;
    } else {
        throw new Error("No data available in 'classes'");
    }
}

// 更新库存函数
async function updateInventory(classId, quantity, currentDate) {
    // Firestore 中 inventory 集合的文档引用
    const inventoryQuery = query(collection(db, 'inventory'), where('class_id', '==', classId));

    const querySnapshot = await getDocs(inventoryQuery);

    if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnapshot) => {
            const currentInventory = docSnapshot.data().total_inventory;

            // 更新后的库存数量
            const updatedInventory = currentInventory + quantity;

            // 更新 Firestore 中的 inventory 文档
            await updateDoc(docSnapshot.ref, {
                total_inventory: updatedInventory,
                update_time: currentDate
            });

            console.log(`库存更新成功: class_id ${classId}, 更新数量: ${quantity}, 当前库存: ${updatedInventory}`);
        });
    } else {
        console.log(`未找到对应的库存记录: class_id ${classId}`);
    }
}



// 获取表单元素
const form = document.getElementById('inventoryForm');

// 表单提交事件监听
form.addEventListener('submit', async (e) => {
    e.preventDefault(); // 防止页面刷新

    // 获取表单数据
    const appleQty = parseInt(document.getElementById('apple').value);
    const bananaQty = parseInt(document.getElementById('banana').value);
    const orangeQty = parseInt(document.getElementById('orange').value);

    // 当前时间
    const currentDate = Timestamp.now();

    //取得最新的ID
    const Restock_id = await getNextRestockID();

    // 从 Firestore 中获取 class 数据
    const classIdMap = await getClassIdMap();
  
    // 准备要插入的数据
    const restockData = [
        { Restock_id: Number(Restock_id), class_id: 0, quantity: appleQty, date: currentDate },
        { Restock_id: Number(Restock_id) + 1, class_id: 1, quantity: bananaQty, date: currentDate },
        { Restock_id: Number(Restock_id) + 2, class_id: 2, quantity: orangeQty, date: currentDate }
    ];

    //更新inventory
    // 更新库存
    updateInventory(0, appleQty,currentDate);
    updateInventory(1, bananaQty,currentDate);
    updateInventory(2, orangeQty,currentDate);
    

    try {
        // 插入数据到 Firestore
        for (const item of restockData) {
            await addDoc(collection(db, 'Restock'), item);
        }
        startAutoRefresh();//刷新表格
        alert('庫存更新成功!');
    } catch (error) {
        console.error('添加数据时出错:', error);
        alert('添加数据时出错，请重试。');
    }
});



async function populateInventoryTable() {
    const tableBody = document.querySelector('#inventoryTable tbody');  // 获取表格主体
    tableBody.innerHTML = '';  // 清空表格内容

    try {
        // 获取 classes 集合中的所有水果类信息
        const classIdMap = await getClassIdMap();
        console.log("classIdMap==",classIdMap);

        // 遍历 classIdMap，获取每个 class_id 的水果详情
        for (const classId in classIdMap) {
            const className = classId;//classIdMap為名字引索
            
            const Fruit_Id =classIdMap[classId].id;
            
            console.log("className=",className);
            console.log("Fruit_Id=",Fruit_Id);

            // 获取该类水果的 Restock（进货量）
            const restockQuery = query(collection(db, 'Restock'), where('class_id', '==', Number(Fruit_Id)));
            const restockSnapshot = await getDocs(restockQuery);

            let totalRestock = 0;
            restockSnapshot.forEach(doc => {
                totalRestock += doc.data().quantity;  // 计算总进货量
            });

            // 获取该类水果的 inventory（库存量）
            const inventoryQuery = query(collection(db, 'inventory'), where('class_id', '==', Number(Fruit_Id)));
            const inventorySnapshot = await getDocs(inventoryQuery);

            let currentInventory = 0;
            if (!inventorySnapshot.empty) {
                inventorySnapshot.forEach(doc => {
                    currentInventory = doc.data().total_inventory;  // 获取当前库存量
                });
            }

            // 计算售出数量
            const soldQuantity = currentInventory - totalRestock;

            // 创建表格行
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${className}</td>
                <td>${totalRestock}</td>
                <td>${soldQuantity}</td>
                <td>${currentInventory}</td>
            `;
            tableBody.appendChild(row);  // 添加行到表格
        }
    } catch (error) {
        console.error('获取数据失败: ', error);
    }
}

// 開始時使用，调用函数填充表格
startAutoRefresh();

let refreshTimer = null; // 定义一个全局变量，用来存储计时器ID

async function startAutoRefresh() {
    // 刚进入页面时调用 populateInventoryTable 函数
    await populateInventoryTable();  // 等待表格填充完成
    await updateLastRefreshTime();   // 调用更新最后刷新时间

    // 检查是否已有计时器在运行
    if (refreshTimer) {
        clearInterval(refreshTimer); // 如果已有计时器，先清除它
    }

    // 设置每1分钟刷新一次表格，并将定时器 ID 存储在 `refreshTimer`
    refreshTimer = setInterval(async () => {
        await populateInventoryTable();  // 等待表格填充完成
        await updateLastRefreshTime();   // 调用更新最后刷新时间
    }, 60000); // 60000 毫秒 = 1 分钟
}

// 更新最后刷新时间的函数
async function updateLastRefreshTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    const currentTime = new Date();

    // 格式化时间，显示年月日 小时:分钟:秒，并显示上下午
    const formattedTime = currentTime.toLocaleString('zh-CN', { 
        year: 'numeric', 
        month: 'numeric', // 无前导零
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true // 24 小时制设置为 false，12 小时制设置为 true
    });

    // 更新 `lastUpdate` div 的内容
    lastUpdateElement.innerText = `最近更新: ${formattedTime}`;
}

