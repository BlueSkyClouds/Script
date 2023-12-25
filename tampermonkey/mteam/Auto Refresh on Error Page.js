// ==UserScript==
// @name     Auto Refresh on Error Page
// @match    https://kp.m-team.cc/details.php?id=*
// @icon         https://kp.m-team.cc/favicon.ico
// @grant    none
// ==/UserScript==

(function() {
    'use strict';

    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('body[style*="display: none"]') && document.querySelector('h1:contains("An error occurred.")')) {
            location.reload(); // 刷新页面
        }
    });
})();