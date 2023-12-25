// ==UserScript==
// @name     自动刷新error
// @match    https://kp.m-team.cc/details.php?id=*
// @match    https://ticket.m-team.io/
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
