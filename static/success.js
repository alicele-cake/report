// 获取按钮元素
const goHomeButton = document.getElementById('goHomeButton');

// 给按钮添加点击事件
goHomeButton.addEventListener('click', function() {
    // 点击按钮时跳转到 home.html
    window.location.href = '/';
});

// 设置1分钟（60秒）后自动跳转到首页
setTimeout(function() {
    window.location.href = '/';
}, 20000);
