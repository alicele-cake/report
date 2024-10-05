// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit,Timestamp,where } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// sales.js
import { subtractHours, getFirstDayOfNextMonth,setToNextYearJanuaryFirst } from './timechange.js';

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

//生成表單
document.getElementById('formType').addEventListener('change', function() {
    const selectedForm = this.value;
    const formContainer = document.getElementById('formContainer');

    formContainer.innerHTML = ''; // 清空当前表单内容

    if (selectedForm === 'dateFormDay') {
        formContainer.innerHTML = `
            <form id="dateFormDay">
                <label for="year">Select Year:</label>
                <select id="year" name="year" required>
                    <option value="">Year</option>
                    <!-- 动态生成的年份将会插入到这里 -->
                </select>
                <label for="month">Select Month:</label>
                <select id="month" name="month" required>
                    <option value="">Month</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                </select>
                <label for="day">Select Day:</label>
                <select id="day" name="day" required>
                    <option value="">Day</option>
                    <!-- 动态生成的日期将会插入到这里 -->
                </select>
                <button type="submit">Submit</button>
            </form>
        `;
        findBillEarliestYear(); // 动态生成年份选项
        populateDays(); // 动态生成日期选项
    } else if (selectedForm === 'dateFormWeek') {
        formContainer.innerHTML = `
            <form id="dateFormWeek">
                <label for="year">Select Year:</label>
                <select id="year" name="year" required>
                    <option value="">Year</option>
                    <!-- 动态生成的年份将会插入到这里 -->
                </select>
                <label for="month">Select Month:</label>
                <select id="month" name="month" required>
                    <option value="">Month</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8</option>
                    <option value="9">9</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                </select>
                <label for="week">Select Week:</label>
                <select id="week" name="week" required>
                    <option value="">Week</option>
                    <!-- 周次范围选项将会插入到这里 -->
                </select>
                <button type="submit">Submit</button>
            </form>
        `;
        findBillEarliestYear(); // 动态生成年份选项
        populateWeeks(); // 动态生成周数范围选项
    } else if (selectedForm === 'dateForm') {
        formContainer.innerHTML = `
            <form id="dateForm">
                <div class="div-25">
                    <select id="year" name="year" required>
                        <option value="">Year</option>
                        <!-- 动态生成的年份将会插入到这里 -->
                    </select>
                </div>
                <div class="div-25">
                    <select id="month" name="month" required>
                        <option value="">Month</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                    </select>
                </div>
                <div class="div-25">
                </div>
                <div class="div-25">
                    <div class="">
                        <button type="submit">Submit</button>
                    </div>
                </div>

            </form>
        `;
        findBillEarliestYear(); // 动态生成年份选项
    } else if (selectedForm === 'dateFormYear') {
        formContainer.innerHTML = `
            <form id="dateFormYear">
                <div class="div-25">
                    <select id="year" name="year" required>
                        <option value="">Year</option>
                        <!-- 动态生成的年份将会插入到这里 -->
                    </select>
                </div>
                <div class="div-25">
                </div>
                <div class="div-25">
                </div>
                <div class="div-25">
                    <div class="area">
                        <button type="submit">Submit</button>
                    </div>
                </div>
            </form>
        `;
        findBillEarliestYear(); // 动态生成年份选项
    }
});

/**
 * 动态生成日期选项。
 */
function populateDays() {
    const monthSelect = document.getElementById('month');
    const daySelect = document.getElementById('day');

    const daysInMonth = (year, month) => new Date(year, month, 0).getDate();

    monthSelect.addEventListener('change', function() {
        const selectedYear = document.getElementById('year').value;
        const selectedMonth = parseInt(this.value, 10);

        if (selectedYear && selectedMonth) {
            const days = daysInMonth(selectedYear, selectedMonth);
            daySelect.innerHTML = '<option value="">Day</option>' +
                Array.from({ length: days }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
        } else {
            daySelect.innerHTML = '<option value="">Day</option>';
        }
    });
}
/**
 * 动态生成周次范围选项。
 */
function populateWeeks() {
    const yearSelect = document.getElementById('year');
    const monthSelect = document.getElementById('month');
    const weekSelect = document.getElementById('week');

    /**
     * 计算给定年份、月份和周次的日期范围，并返回包含开始和结束日期的对象数组。
     * @param {number} year - 年份
     * @param {number} month - 月份 (1-12)
     * @param {number} weekNumber - 周次
     * @returns {Object[]} - 周次范围对象数组
     */
    const getWeekRanges = (year, month) => {
        const firstDayOfMonth = new Date(year, month - 1, 1);
        const lastDayOfMonth = new Date(year, month, 0);

        const dayOfWeek = firstDayOfMonth.getDay();
        const dayNames = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

        const addnum = dayOfWeek - 1;
        const DaysLater = new Date(firstDayOfMonth);
        DaysLater.setDate(firstDayOfMonth.getDate() - addnum);

        let weekStart = new Date(DaysLater);
        const result = [];

        while (true) {
            if (weekStart.getDate() > lastDayOfMonth.getDate() || weekStart.getMonth() > lastDayOfMonth.getMonth()) {
                break;
            }

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            result.push({
                start: new Date(weekStart),
                end: new Date(weekEnd),
                display: `${weekStart.getMonth() + 1}/${weekStart.getDate()} ${dayNames[weekStart.getDay()]}~${weekEnd.getMonth() + 1}/${weekEnd.getDate()} ${dayNames[weekEnd.getDay()]}`
            });

            weekStart.setDate(weekStart.getDate() + 7);
        }

        return result;
    };

    /**
     * 更新周次选择框的选项。
     */
    function updateWeeks() {
        const selectedYear = parseInt(yearSelect.value, 10);
        const selectedMonth = parseInt(monthSelect.value, 10);

        if (selectedYear && selectedMonth) {
            weekSelect.innerHTML = '<option value="">Week</option>'; // 初始化下拉菜单
            const weekRanges = getWeekRanges(selectedYear, selectedMonth);

            // 将每周的范围添加为下拉菜单的选项
            weekRanges.forEach((weekRange, index) => {
                // 设置 value 为该周的开始日期（ISO格式）
                const value = weekRange.start.toISOString().split('T')[0];
                weekSelect.innerHTML += `<option value="${value}">${weekRange.display}</option>`;
            });
        } else {
            weekSelect.innerHTML = '<option value="">Week</option>'; // 未选择年份或月份时显示默认选项
        }
    }

    // 监听年份选择框的变更事件
    yearSelect.addEventListener('change', updateWeeks);
    // 监听月份选择框的变更事件
    monthSelect.addEventListener('change', updateWeeks);
}


// 从bill集合中查找时间最早的第一笔数据
async function findBillEarliestYear() {
    // 从bill集合中查找时间最早的第一笔数据
    const earliestBillQuery = query(
        collection(db, "bill"),
        orderBy("date", "asc"), // 按日期升序排序，时间最早的记录排在最前
        limit(1) // 仅获取第一笔记录
    );

    const querySnapshot = await getDocs(earliestBillQuery);

    if (!querySnapshot.empty) {
        const earliestBill = querySnapshot.docs[0].data();

        // 假设date字段是Firestore Timestamp对象，将其转换为JavaScript Date对象
        const earliestDate = earliestBill.date.toDate();

        // 提取最早的年份
        const earliestYear = earliestDate.getFullYear();
        // console.log("Earliest Year:", earliestYear);

        // 获取当前年份
        const currentYear = new Date().getFullYear();

        // 动态生成年份选项并插入到<select>元素中
        const yearSelect = document.getElementById('year');

        // 清空<select>元素的现有选项，保留默认的“Year”选项
        yearSelect.innerHTML = '<option value="">Year</option>';

        // 生成从最早年份到当前年份的所有选项
        for (let year = earliestYear; year <= currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            // console.log("add Year:", year);
            yearSelect.appendChild(option);
        }
    } else {
        console.log("No bills found.");
    }
}

//處理模式下的按鈕回應與生成圖表
document.getElementById('formContainer').addEventListener('submit', function(event) {
    event.preventDefault();

    const form = event.target;

    if (form.id === 'dateForm') {
        const year = form.querySelector('#year').value;
        const month = form.querySelector('#month').value;

        if (year && month) {

            // 将用户输入的日期用于进一步处理，比如过滤数据
            const selectedDate = new Date(Date.UTC(year, month - 1, 1));

            // 打印 selectedDate 变量的详细信息
            console.log("Selected Date (after reducing 8 hours):", selectedDate);
            console.log("Selected Date (toISOString):", selectedDate.toISOString());
            console.log("Selected Date (toString):", selectedDate.toString());




        calculateTotalFruitCountAndCreateBarChart(selectedDate,form.id);


            // 启动定时器以每分钟更新图表
            startUpdatingChart(selectedDate,form.id);
        } else {
            console.error('Year or month is missing.');
        }
    } else if (form.id === 'dateFormYear') {
        const year = form.querySelector('#year').value;

        if (year) {
            // 将用户输入的日期用于进一步处理，比如过滤数据
            const selectedDate = new Date(Date.UTC(year, 0, 1));

            console.log("Selected Date (toISOString):", selectedDate.toISOString());
            console.log("Selected Date (toString):", selectedDate.toString());

            calculateTotalFruitCountAndCreateBarChart(selectedDate,form.id);


            // 启动定时器以每分钟更新图表
            startUpdatingChart(selectedDate,form.id);

        } else {
            console.error('Year or mode is missing.');
        }
    }
});

let chartInstance = null; // 全局变量用于存储 Chart 实例
let updateIntervalId = null; // 存储定时器 ID
let dataPoints = []; // 水果数量，初始化为空数组以防止使用未定义的值  

function startUpdatingChart(selectedDate,form_id) {
    // 如果定时器已经启动，清除它
    if (updateIntervalId) {
        clearInterval(updateIntervalId);
    }

    // 启动新的定时器，并记录其 ID
    updateIntervalId = setInterval(async () => {
        console.log("Updating chart...");
        await calculateTotalFruitCountAndCreateBarChart(selectedDate,form_id);
    }, 60000); // 60000 毫秒 = 1 分钟
}


function updateLastUpdateTime() {
    const lastUpdateElement = document.getElementById('lastUpdate');
    const now = new Date();
    lastUpdateElement.textContent = `最近更新: ${now.toLocaleString()}`;
}

function getDailyCounts(dailyCounts) {
    // 获取所有日期
    const dates = Array.from(new Set(Object.values(dailyCounts).flatMap(item => Object.keys(item))));
    dates.sort(); // 确保日期按升序排列

    // 获取水果种类
    const fruitTypes = Object.keys(dailyCounts);

    // 创建结果数组
    let result = [];

    // 遍历每个日期
    dates.forEach(date => {
        // 收集每个日期的数量
        let quantities = fruitTypes.map(fruitId => dailyCounts[fruitId][date] || 0);
        // 将日期和数量合并成对象
        let entry = { date: date };
        fruitTypes.forEach((fruitId, index) => {
            entry[`${fruitId}`] = quantities[index];
        });
        result.push(entry);
    });

    return result;
}

//產生表格
function generateDataTable(labels, dailyCounts) {
    const tableContainer = document.getElementById('dataTableContainer');

    // 获取格式化的 dailyCounts 数据
    const formattedData = getDailyCounts(dailyCounts);
    // 打印结果
    console.log(formattedData);

    // 获取所有日期和水果种类
    const dates = Array.from(new Set(Object.values(dailyCounts).flatMap(item => Object.keys(item))));
    // const fruitTypes = Object.keys(dailyCounts);

    console.log("labels:", labels);
    // console.log("dailyCounts:", fruitTypes);

    console.log("dates:", dates);

    // 创建表格
    let table = `
        <table class="table table-bordered border-white" >
            <thead>
                <tr>
                <th>日期</th>
    `;




    // 遍历每种水果，创建每一行
    // fruitTypes.forEach(fruitId => {
    //     const fruitData = dailyCounts[fruitId];
    //     let totalQuantity = 0;

    //     table += `
    //             <th>${labels[fruitId-1]}</th>
    //     `;
    //     // table += `
    //     //         <th>${labels[fruitId-1]}</th>
    //     //         <th>數量</th>
    //     // `;
    // });

    table += `
                    <th scope="col">總共</th>
                </tr>
            </thead>
            <tbody>
    `;


    const class_name = ["odd", "even"];
    dates.forEach((date, index) => {
        let sum=0;
        table += `
            <tr>
                <td class="${class_name[(index%2)]}">${date}</td>
        `;

        // 查找并打印指定日期的数据
        const entry = formattedData.find(item => item.date === date);

        if (entry) {
            Object.keys(entry).forEach(key => {
                if (key !== 'date') {
                    // table += `<td>${entry[key]}</td>`;
                    // table += `<td>某個數量</td>`;
                    sum=sum+entry[key];

                }
            });
        } else {
            console.log(`没有找到日期为 ${date} 的数据。`);
        }

        //數量
        table += `<td class="${class_name[(index%2)]}">${sum}</td>`;

    });

    table += `
            </tbody>
        </table>
    `;
    tableContainer.innerHTML = table;

    // 添加事件监听器，计算总和
    tableContainer.addEventListener('input', function(event) {
        if (event.target.classList.contains('price')) {
            const fruitId = event.target.getAttribute('data-fruit');
            const price = parseFloat(event.target.value) || 0;
            const quantityCells = tableContainer.querySelectorAll(`td[data-fruit="${fruitId}"]`);
            let totalQuantity = 0;
            quantityCells.forEach(cell => {
                totalQuantity += parseFloat(cell.innerText) || 0;
            });
            const totalInput = document.querySelector(`.total[data-fruit="${fruitId}"]`);
            totalInput.value = (price * totalQuantity).toFixed(2);
        }
    });
}


// 计算每种水果的总数量
function calculateTotalCounts(dailyCounts) {
    const totalCounts = {};
    for (const classId in dailyCounts) {
        if (dailyCounts.hasOwnProperty(classId)) {
            totalCounts[classId] = Object.values(dailyCounts[classId]).reduce((sum, quantity) => sum + quantity, 0);
        }
    }
    return totalCounts;
}

// 计算所有水果的总数并创建条形图
async function calculateTotalFruitCountAndCreateBarChart(selectedDate, form_id) {
    const FruitClass = await findFruitClass(selectedDate); // 找水果类别与ID
    const { dailyCounts, totalCounts } = await findAllFruitCounts(FruitClass, selectedDate, form_id); // 找每种水果个别的数量

    if (!totalCounts) {
        throw new Error('totalCounts is null or undefined');
    }

    // 计算每种水果的总营业额
    const totalRevenueCounts = {};
    for (const classId in dailyCounts) {
        totalRevenueCounts[classId] = 0;
        for (const month in dailyCounts[classId]) {
            totalRevenueCounts[classId] += dailyCounts[classId][month];
        }
    }

    // 创建条形图所需的数据
    const labels = Object.keys(FruitClass); // 水果名称
    const dataPoints = Object.values(totalRevenueCounts); // 营业额数据

    console.log("Labels:", labels);
    console.log("DataPoints:", dataPoints);

    // 生成数据表格
    generateDataTable(labels, dailyCounts);

    // 获取画布元素和上下文
    const canvas = document.getElementById('myBarChart'); // 你可以改成更合适的ID名称
    const ctx = canvas.getContext('2d');

    // 如果存在已有图表实例，销毁它
    if (chartInstance) {
        chartInstance.destroy();
    }

    // 清除 canvas 内容
    canvas.width = canvas.width;

    // 创建新的条形图
    chartInstance = new Chart(ctx, {
        type: 'bar', // 设置图表类型为条形图
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Fruit Revenue',
                data: dataPoints, // 设置数据的地方
                backgroundColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    // 可以添加更多颜色
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                    // 可以添加更多颜色
                ],
                borderWidth: 1
            }]
        },
        options: {
            esponsive: false, // 启用响应式
            maintainAspectRatio: false, // 可选，允许改变宽高比
            scales: {
                x: {
                    beginAtZero: true, // X轴从0开始
                },
                y: {
                    beginAtZero: true, // Y轴从0开始
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const total = tooltipItem.dataset.data.reduce((acc, val) => acc + val, 0);
                            console.log("tooltipItem.dataset.data=",tooltipItem.dataset.data);
                            const value = tooltipItem.raw;
                            const percentage = ((value / total) * 100).toFixed(2); // 计算百分比并保留两位小数
                            return `${tooltipItem.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    // 更新最近更新时间
    updateLastUpdateTime();
}



// 获取水果类别函数
async function findFruitClass() {
    const snapshot = await getDocs(collection(db, "classes"));
    if (!snapshot.empty) {
        const classIdMap = {};
        snapshot.forEach(doc => {
            classIdMap[doc.data().class_name] = doc.data().class_id;
        });
        console.log("水果类别:", classIdMap);
        return classIdMap;
    } else {
        const classIdMap = {};
        // throw new Error("‘classes’集合中没有数据");
        console.log("‘classes’集合中没有数据");
        return classIdMap;
    }
}


// 改寫時間格式year-month
function getYearMonth(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始，需要加1
    return `${year}-${month}`;
}

// 根据class_id和日期计算所有水果的总数
async function findAllFruitCounts(FruitClass, selectedDate, form_id) {

    // 计算起始日期
    const startDate = subtractHours(selectedDate, 8);

    // 打印结果
    console.log("Original Date (UTC):", selectedDate.toISOString());
    console.log("New Date (UTC):", startDate.toISOString());

    let firstDayNextMonth, endDate;

    // 根据 form_id 设置不同的日期范围
    if (form_id === 'dateForm') {
        firstDayNextMonth = getFirstDayOfNextMonth(selectedDate);
        endDate = subtractHours(firstDayNextMonth, 8);
        console.log("First Day of Next Month (UTC):", firstDayNextMonth.toISOString());
        console.log("End Date (UTC):", endDate.toISOString());
    } else if (form_id === 'dateFormYear') {
        const nextYearDate = setToNextYearJanuaryFirst(selectedDate);
        endDate = subtractHours(nextYearDate, 8);
        console.log("Next Year January 1st Date (UTC):", nextYearDate.toISOString());
    }

    const dailyCounts = {};
    let totalCounts = {};

    // 初始化 totalCounts
    for (const classId of Object.values(FruitClass)) {
        totalCounts[classId] = 0;
    }

    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
        const startD = new Date(currentDate);
        const endD = new Date(startD);

        // 根据 form_id 设置 endD
        if (form_id === 'dateForm') {
            endD.setDate(startD.getDate() + 1);
        } else if (form_id === 'dateFormYear') {
            endD.setMonth(startD.getMonth() + 1);
        }

        const billQuery = query(
            collection(db, "bill"),
            where("date", ">=", startD),
            where("date", "<", endD)
        );
        const billSnapshot = await getDocs(billQuery);
        const billIds = billSnapshot.docs.map(doc => doc.data().bill_id);

        if (billIds.length > 0) {
            for (const classId of Object.values(FruitClass)) {
                dailyCounts[classId] = dailyCounts[classId] || {};

                //重製時間，讓顯示日期回歸當地時間
                let PutDate = subtractHours(currentDate, -8);

                console.log("PutDate");
                console.log(PutDate);


                // 根据 form_id 设置 dailyCounts
                if (form_id === 'dateForm') {
                    PutDate=PutDate.toISOString().split('T')[0];
                    dailyCounts[classId][PutDate] = 0;
                } else if (form_id === 'dateFormYear') {
                    const yearMonth = getYearMonth(PutDate);
                    dailyCounts[classId][yearMonth] = 0;
                }

                const fruitQuery = query(
                    collection(db, "transactions"),
                    where("class_id", "==", classId),
                    where("bill_id", "in", billIds)
                );

                    const querySnapshot = await getDocs(fruitQuery);

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        console.log("data=",data);//selling price



                        // 根据 form_id 更新 dailyCounts
                        if (form_id === 'dateForm') {
                            dailyCounts[classId][PutDate] += data.count*data.selling_price;
                            totalCounts[classId] += dailyCounts[classId][PutDate];
                            console.log("currentDate.toISOString()");
                            console.log(currentDate.toISOString());

                        } else if (form_id === 'dateFormYear') {
                            console.log("currentDate");
                            console.log(currentDate);
                            const yearMonth = getYearMonth(PutDate);
                            dailyCounts[classId][yearMonth] += data.count*data.selling_price;
                            totalCounts[classId] += dailyCounts[classId][yearMonth];

                            // console.log("dailyCounts[",classId,"][",yearMonth,"]==",dailyCounts[classId][yearMonth]);
                            
                        }

                        // totalCounts[classId] +=data.count;//計算總和
                    });


            }
        }

        // 根据 form_id 更新 currentDate
        if (form_id === 'dateForm') {
            currentDate.setDate(currentDate.getDate() + 1);
        } else if (form_id === 'dateFormYear') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    }

    console.log("dailyCounts=", dailyCounts);//時間錯誤，少8小時
    console.log("totalCounts=", totalCounts);
    return { dailyCounts, totalCounts };
}
