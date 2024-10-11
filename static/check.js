// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit,Timestamp,writeBatch,where   } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', async () => {
    // 从 localStorage 中读取预测数据
    const predictions = JSON.parse(localStorage.getItem('predictions') || '[]');

    // 在控制台输出每个类别的数据（可选）
    console.log('predictions Data:', predictions);

    // 从 Firestore 中获取 class 数据
    const classIdMap = await getClassIdMap();

    // 创建一个对象来存储每个类别的出现次数和单价
    const categoryData = {};

    // 遍历预测数据并统计每个类别出现的次数
    predictions.forEach(prediction => {
        const category = prediction.class;
        const count = categoryData[category] ? categoryData[category].count + 1 : 1;

        if (classIdMap[category]) {
            const price = classIdMap[category].price;
            categoryData[category] = { count, price };
        }
    });

    // 在控制台输出每个类别的数据（可选）
    console.log('Category Data:', categoryData);

    // 获取 table_area div
    const tableArea = document.querySelector('.table_area');

    // 动态生成表格并插入到 table_area 中
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'border-white');

    // 创建表头
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    const headers = ['種類', '商品數量', '單價', '金額'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.scope = 'col';
        th.innerText = headerText;
        headerRow.appendChild(th);
    });

    // 创建表体
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    let totalAmount = 0;
    let rowIndex = 0; // 用于检测行号

    for (const [category, data] of Object.entries(categoryData)) {
        const row = tbody.insertRow();

        // 为每个 td 插入内容并根据行号为基数行或偶数行的 td 元素添加 .odd 或 .even 类
        const categoryCell = row.insertCell();
        categoryCell.innerText = category;

        const countCell = row.insertCell();
        countCell.innerText = data.count;

        const priceCell = row.insertCell();
        priceCell.innerText = data.price;

        const total = data.count * data.price;
        totalAmount += total;

        const totalCell = row.insertCell();
        totalCell.innerText = total;

        // 根据行号添加样式
        if (rowIndex % 2 === 0) {
            categoryCell.classList.add('even');
            countCell.classList.add('even');
            priceCell.classList.add('even');
            totalCell.classList.add('even');
            countCell.classList.add('right-align');
            priceCell.classList.add('right-align');
            totalCell.classList.add('right-align');
        } else {
            categoryCell.classList.add('odd');
            countCell.classList.add('odd');
            priceCell.classList.add('odd');
            totalCell.classList.add('odd');
            countCell.classList.add('right-align');
            priceCell.classList.add('right-align');
            totalCell.classList.add('right-align');
            
        }
        rowIndex++;
    }

    // 显示总金额
    const totalRow = tbody.insertRow();
    const totalCell = totalRow.insertCell();
    totalCell.colSpan = 4;
    // 使用模板字符串将 '总金额=' 和 totalAmount 显示在同一行
    totalCell.innerText = `總金额  =  ${totalAmount}`;  // 这里使用模板字符串

    totalCell.classList.add('right-align', 'total-amount');

    // 将生成的表格插入到 table_area 中
    tableArea.appendChild(table);

    // 添加按钮点击事件监听器
    document.getElementById('confirmButton').addEventListener('click', async () => {
        try {
            // 处理确认按钮点击后的逻辑
            await insertData(predictions, categoryData); // 暂时取消正常插入数据

            // 在插入数据后跳转到 success.html 页面
            redirectToCheckPage();
        } catch (error) {
            console.error("Error inserting data or redirecting:", error);
            // 可以添加一些错误处理逻辑，如弹出提示框等
        }
    });
});



// 跳轉到success.html
function redirectToCheckPage() {
    // 从 localStorage 中删除 'predictions' 键对应的数据
    localStorage.removeItem('predictions');
    window.location.href = '/success';
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


// Function to get the next key value for detectData
async function getNextDetectKey() {
    const detectDataQuery = query(collection(db, "detectData"), orderBy("id", "desc"), limit(1));
    const snapshot = await getDocs(detectDataQuery);
    if (!snapshot.empty) {
        const maxKey = snapshot.docs[0].data().id;
        console.log("De maxKey=",maxKey);
        return maxKey + 1;
    } else {
        console.log("De maxKey=0");
        return 0;
    }
}

// Function to get the next key value for transactions
async function getNextTKey() {
    const transactionsQuery = query(collection(db, "transactions"), orderBy("id", "desc"), limit(1));
    const snapshot = await getDocs(transactionsQuery);
    if (!snapshot.empty) {
        const maxKey = snapshot.docs[0].data().id;
        return maxKey + 1;
    } else {
        return 0;
    }
}

async function getNextBillID() {
    const billQuery = query(collection(db, "bill"), orderBy("bill_id", "desc"), limit(1));
    const snapshot = await getDocs(billQuery);
    if (!snapshot.empty) {
        const maxKey = snapshot.docs[0].data().bill_id;
        return maxKey + 1;
    } else {
        return 0;
    }
}

// Function to convert data??
async function convertData123(predictions, nextTKey, categoryData) {
    const bill_id = await getNextBillID();
    const classIdMap = await getClassIdMap();

    // 创建一个空数组来存储转换后的数据
    const convertedData2 = [];

    // 遍历 categoryData，确保每个类别的数据都被处理
    for (const [categoryName, data] of Object.entries(categoryData)) {
        // 从 classIdMap 中获取对应的 class_id
        const class_id = classIdMap[categoryName] ? classIdMap[categoryName].id : null;

        // 只有当 class_id 存在时才添加数据
        if (class_id !== null) {
            convertedData2.push({
                id: nextTKey++, // 更新 nextTKey
                bill_id: bill_id,
                class_id: class_id, // 从 classIdMap 获取的 class_id
                count: data.count, // 从 categoryData 获取数量
                selling_price: data.price // 从 categoryData 获取价格
            });
            console.log("class_id",class_id);
            addInventoryUpdate(class_id, -(data.count));//!!
        }
        updateInventory(0, appleQty,currentDate)
        
    }

    console.log("convertedData2=",convertedData2);
    return convertedData2;
}





// Function to insert data
async function insertDatatest(predictions,categoryData) {
    const nextTKey = await getNextTKey();
    const convertedData2 = await convertData123(predictions, nextTKey,categoryData);
    for (const newData of convertedData2) {
        try {
            const nextTKey = await getNextTKey();
            await addDoc(collection(db, "transactions"), newData);
            console.log(`Data inserted successfully:`, newData);
        } catch (error) {
            console.error(`Error inserting data:`, error);
        }
    }
}

// Function to insert data
async function insertData(predictions, categoryData) {
    await insertDatatest(predictions, categoryData);
    await insertBillData(categoryData);
    const currentDate = Timestamp.now();
    executeInventoryUpdates(currentDate);
}



// // 更新库存函数
// 初始化一个全局的更新队列
const inventoryUpdates = {};

// 添加更新到队列中
function addInventoryUpdate(classId, quantity) {
    // 如果该 classId 已经存在，则累加数量；否则，初始化该 classId 的数量
    if (inventoryUpdates[classId]) {
        inventoryUpdates[classId] += quantity;
    } else {
        inventoryUpdates[classId] = quantity;
    }
}

// 执行所有累积的库存更新
async function executeInventoryUpdates(currentDate) {
    const batch = writeBatch(db); // Firestore 批处理实例

    for (const classId in inventoryUpdates) {
        const quantity = inventoryUpdates[classId];
        
        // 将 classId 转换为数字类型
        const inventoryQuery = query(collection(db, 'inventory'), where('class_id', '==', Number(classId)));

        console.log("class_id2",classId);
        
        const querySnapshot = await getDocs(inventoryQuery);

        if (!querySnapshot.empty) {
            querySnapshot.forEach((docSnapshot) => {
                const docData = docSnapshot.data();
                console.log("查询到的文档数据:", docData);
                
                const currentInventory = docSnapshot.data().total_inventory;

                // 更新后的库存数量
                const updatedInventory = currentInventory + quantity;

                // 使用批处理将更新操作添加到批次中
                batch.update(docSnapshot.ref, {
                    total_inventory: updatedInventory,
                    update_time: currentDate
                });

                console.log(`库存已加入批处理: class_id ${classId}, 更新数量: ${quantity}, 新库存: ${updatedInventory}`);
            });
        } else {
            console.log(`未找到对应的库存记录: class_id ${classId}`);
        }
    }

    // 执行所有批处理操作
    await batch.commit();
    console.log('所有库存更新已成功提交');

    // 清空更新队列
    Object.keys(inventoryUpdates).forEach(classId => delete inventoryUpdates[classId]);
}


//改寫庫存
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

// Function to calculate total price based on categoryData
function calculateTotalPrice(categoryData) {
    let totalPrice = 0;
    for (const data of Object.values(categoryData)) {
        totalPrice += data.count * data.price;
    }
    return totalPrice;
}

// Function to insert data into bill
async function insertBillData(categoryData) {
    const nextBillID = await getNextBillID();
    const currentTimestamp = Timestamp.now();

    // Calculate the total price using the categoryData
    const totalPrice = calculateTotalPrice(categoryData);

    const newData = {
        bill_id: nextBillID,
        date: currentTimestamp,
        total_price: totalPrice // Insert calculated total price
    };

    try {
        await addDoc(collection(db, "bill"), newData);
        console.log("Bill Data inserted successfully");
    } catch (error) {
        console.error("Error inserting Bill data:", error);
    }
}
