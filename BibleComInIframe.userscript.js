// ==UserScript==
// @name        Bible.com iframe specific styles
// @namespace   Violentmonkey Scripts
// @match       https://www.bible.com/*
// @grant       none
// @version     1.5
// @author      Aiuanyu x Gemini
// @description Adds a class to html if bible.com is in an iframe. Adjusts font size of parallel versions to fit the left column.
// @description:zh-TW 當 bible.com 在 iframe 裡時，給 <html> 加個 class。調整並列版本个字體大小，讓佇左邊个欄位內看起來較好。
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) {
        document.documentElement.classList.add('is-in-iframe');
        console.log('Bible.com is in an iframe, added class "is-in-iframe" to <html>');

        // 當 iframe 內容載入完成後，嘗試調整並列版本个字體大小
        window.addEventListener('load', function () {
            // 等待所有字體載入完成
            document.fonts.ready.then(function () {
                console.log('All fonts loaded, attempting to adjust font size.');
                adjustParallelFontSize();
            }).catch(function (error) {
                console.warn('Font loading error or timeout, proceeding with font adjustment anyway:', error);
                adjustParallelFontSize(); // 若字體載入失敗或超時，還是嘗試執行
            });
        });

    } else {
        console.log('Bible.com is top level window.');
    }

    function adjustParallelFontSize() {
        try {
            const params = new URLSearchParams(window.location.search);
            const parallelVersionId = params.get('parallel');

            if (!parallelVersionId) {
                console.log('No parallel version ID found in URL, skipping font adjustment.');
                return;
            }

            // 取得左欄主要版本个 ID
            const pathSegments = window.location.pathname.match(/\/bible\/(\d+)\//);
            if (!pathSegments || !pathSegments[1]) {
                console.log('Could not extract main version ID from path, skipping font adjustment.');
                return;
            }
            const mainVersionId = pathSegments[1];

            const leftDataVidSelector = `[data-vid="${mainVersionId}"]`;
            const rightDataVidSelector = `[data-vid="${parallelVersionId}"]`;

            console.log('Attempting to adjust font for right column selector:', rightDataVidSelector, 'against left column selector:', leftDataVidSelector);

            // 找出並列閱讀个主要容器 (根據先前个 HTML 結構)
            // 這選擇器可能愛根據 bible.com 實際个 HTML 結構微調
            // 你个 CSS userstyle 用 div.grid.grid-cols-1.md\:grid-cols-2，所以𠊎等也用共樣个
            const parallelContainer = document.querySelector('div.grid.md\\:grid-cols-2, div.grid.grid-cols-1.md\\:grid-cols-2');
            if (!parallelContainer) {
                // 嘗試一個較通用个選擇器，假使上面該隻無效
                // parallelContainer = document.querySelector('div[class*="md:grid-cols-2"]'); // 這較闊，可能愛小心
                // if (!parallelContainer) {
                console.log('Parallel container (e.g., div.grid.md:grid-cols-2) not found.');
                return;
            }

            const columns = Array.from(parallelContainer.children).filter(el => getComputedStyle(el).display !== 'none');
            if (columns.length < 2) {
                console.log('Less than two visible columns found in parallel container.');
                return;
            }

            const leftColumnEl = columns[0];
            const rightColumnEl = columns[1];

            // 在左欄裡肚尋找主要版本个內容元素 (使用 data-vid)
            const leftVersionDiv = leftColumnEl.querySelector(leftDataVidSelector);
            if (!leftVersionDiv) {
                console.log(`Content div for left version (${leftDataVidSelector}) not found in the left column.`);
                return;
            }

            // 在右欄裡肚尋找並列版本个內容元素 (使用 data-vid)
            // 這也是等一下要調整字體大小的目標元素
            const rightVersionDiv = rightColumnEl.querySelector(rightDataVidSelector);
            if (!rightVersionDiv) {
                console.log(`Content div for right version (${rightDataVidSelector}) not found in the right column.`);
                return;
            }

            console.log('Found leftVersionDiv:', leftVersionDiv, 'Found rightVersionDiv:', rightVersionDiv);

            // 使用 requestAnimationFrame 來確保 DOM 操作和測量是在瀏覽器準備好繪製下一幀之前進行
            requestAnimationFrame(() => {
                // 開始調整字體
                rightVersionDiv.style.fontSize = '90%'; // 初始字體大小

                // 強制瀏覽器重繪以取得正確个初始高度
                leftVersionDiv.offsetHeight;
                rightVersionDiv.offsetHeight;

                let leftHeight = leftVersionDiv.offsetHeight;
                let rightHeight = rightVersionDiv.offsetHeight;

                if (rightHeight <= leftHeight) {
                    console.log(rightDataVidSelector + ' content in right column is fine at 90% (or already shorter/equal). Right content: ' + rightHeight + 'px, Left content: ' + leftHeight + 'px');
                    return;
                }

                let lastKnownTallerFontSize = 90;

                for (let testSize = 89; testSize >= 50; testSize--) { // 最細到 50%
                    rightVersionDiv.style.fontSize = testSize + '%';
                    // 每次改變字體大小後，重新獲取高度
                    // 這裡的 rightVersionDiv.offsetHeight 會強制 reflow
                    rightHeight = rightVersionDiv.offsetHeight;
                    // leftHeight 在這個循環中假定不變，因為我們只調整右邊的字體

                    if (rightHeight > leftHeight) {
                        lastKnownTallerFontSize = testSize;
                    } else {
                        // 右邊內容開始比左邊短，或者一樣高了，就用上一個較大的字體大小
                        rightVersionDiv.style.fontSize = lastKnownTallerFontSize + '%';
                        console.log('Adjusted ' + rightDataVidSelector + ' font size to ' + lastKnownTallerFontSize + '%. Right content: ' + rightVersionDiv.offsetHeight + 'px, Left content: ' + leftHeight + 'px');
                        return;
                    }
                }

                // 如果循環結束（字體縮到最小還是右邊較長），就用最後記錄的大小
                rightVersionDiv.style.fontSize = lastKnownTallerFontSize + '%';
                console.log('Adjusted ' + rightDataVidSelector + ' font size to ' + lastKnownTallerFontSize + '% (min reached or still taller). Right content: ' + rightVersionDiv.offsetHeight + 'px, Left content: ' + leftHeight + 'px');
            });
        } catch (error) {
            console.error('Error during font adjustment:', error);
        }
    }
})();
