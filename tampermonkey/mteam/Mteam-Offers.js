// ==UserScript==
// @name         Mteam-Offers
// @namespace    https://kp.m-team.cc/
// @version      0.0.2
// @description  Offers
// @author       BlueSkyClouds
// @match        https://kp.m-team.cc/details.php?id=*
// @icon         https://kp.m-team.cc/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    if (document.querySelector('#pass_offer')) {
        // 获取URL中的id参数
        var id = location.search.split('id=')[1];

        // 创建按钮函数
        function createButton(text, status, bgColor) {
            var button = document.createElement('button');
            button.textContent = text;
            button.style.backgroundColor = bgColor; // 设置按钮背景颜色
            button.style.border = 'none'; // 去除按钮边框
            button.style.padding = '10px 20px'; // 设置按钮内边距和填充，以调整按钮大小和字体大小
            button.style.color = 'white'; // 设置字体颜色为白色
            button.style.fontSize = '16px'; // 设置字体大小
            button.style.top = '20px'; // 设置顶部距离
            button.style.left = '20px'; // 设置左侧距离

            button.style.position = 'fixed';

            button.addEventListener('click', function () {
                var tid = id; // 使用获取到的id值
                var url = 'https://kp.m-team.cc/examine.php'; // POST请求的URL
                var data = {
                    tid: tid, // 将种子id作为POST数据的一部分
                    status: status, // 设置status的值
                    examine_save: '保存状态' // 设置examine_save的值
                };
                var statusInput = document.querySelector('input[name="status"]');
                var currentStatus = statusInput ? statusInput.value : null;

                if (text === '冻结') {
                    status = 3;
                }

                if (currentStatus !== status) {
                    // 构建POST请求
                    fetch(url, { // 使用fetch API发送POST请求
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: Object.keys(data).map(function (key) {
                            return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
                        }).join('&')
                    })
                        .then(response => response.json()) // 将响应解析为JSON格式
                        .then(data => console.log(data)) // 在控制台打印响应数据，你可以根据需要处理数据
                        .catch(error => console.error('Error:', error)); // 处理错误情况

                    // 刷新页面
                    location.reload();
                }
            });
            return button;
        }

        // 在网页左上角按顺序添加按钮
        var container = document.querySelector('body'); // 获取body元素作为容器
        var buttons = [createButton('冻结', 3, '#FF0000')]; // 创建按钮并设置相应的背景颜色和状态值
        buttons.forEach(function (button) {
            container.insertBefore(button, container.firstChild); // 在容器的第一个子节点之前插入按钮
        });
    }
}) ();
