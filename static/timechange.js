
/**
 * 將給定的 Date 對象減去指定的時間（小時數），並返回新的 Date 對象。
 * @param {Date} date - 要操作的 Date 對象。
 * @param {number} hoursToSubtract - 要減去的小時數。
 * @returns {Date} - 減去指定小時數後的新的 Date 對象。
 */
export function subtractHours(date, hoursToSubtract) {
    // 複製原始 Date 對象，以免修改原始對象
    const newDate = new Date(date.getTime());

    // 減去小時數
    newDate.setUTCHours(newDate.getUTCHours() - hoursToSubtract);

    return newDate;
}

/**
 * 計算給定日期的下個月的第一天。
 * @param {Date} date - 要操作的 Date 對象。
 * @returns {Date} - 設置為下個月第一天的新的 Date 對象。
 */
export function getFirstDayOfNextMonth(date) {
    // 獲取當前的年份和月份
    const currentYear = date.getFullYear();
    const currentMonth = date.getMonth(); // 0 索引的月份

    // 計算下個月的年份和月份
    const nextMonth = currentMonth + 1;
    const nextYear = currentYear + Math.floor(nextMonth / 12); // 如果月份超過 12，年份加 1

    // 創建一個新的 Date 對象，設置為下個月的第一天
    const firstDayOfNextMonth = new Date(Date.UTC(nextYear, nextMonth % 12, 1, 0, 0, 0));

    return firstDayOfNextMonth;
}



/**
 * 將給定的 Date 對象調整到明年 1 月 1 日。
 * @param {Date} date - 要操作的 Date 對象。
 * @returns {Date} - 設置為明年 1 月 1 日的新的 Date 對象。
 */
export function setToNextYearJanuaryFirst(date) {
    // 獲取當前年份
    const currentYear = date.getUTCFullYear();

    // 計算明年年份
    const nextYear = currentYear + 1;

    // 創建一個新的 Date 對象，設置為明年 1 月 1 日
    const newDate = new Date(Date.UTC(nextYear, 0, 1, 0, 0, 0));

    return newDate;
}

/**
 * 计算给定日期的下一个星期一的日期。
 * @param {Date} date - 要操作的 Date 对象。
 * @returns {Date} - 设置为下一个星期一的新的 Date 对象。
 */
export function getNextMonday(date) {
    // 复制原始 Date 对象，以免修改原始对象
    const newDate = new Date(date.getTime());

    // 计算当前日期是星期几（0: Sunday, 1: Monday, ..., 6: Saturday）
    const dayOfWeek = newDate.getUTCDay();

    // 计算到下一个星期一的天数差
    const daysUntilNextMonday = (1 - dayOfWeek + 7) % 7;

    // 设置为下一个星期一
    newDate.setUTCDate(newDate.getUTCDate() + daysUntilNextMonday);

    return newDate;
}

/**
 * 计算给定日期的明天的日期。
 * @param {Date} date - 要操作的 Date 对象。
 * @returns {Date} - 设置为明天的新的 Date 对象。
 */
export function getTomorrow(date) {
    // 复制原始 Date 对象，以免修改原始对象
    const newDate = new Date(date.getTime());

    // 设置为明天
    newDate.setUTCDate(newDate.getUTCDate() + 1);

    return newDate;
}