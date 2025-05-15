// ==UserScript==
// @name        Bible.com iframe specific styles
// @namespace   Violentmonkey Scripts
// @match       https://www.bible.com/*
// @grant       none
// @version     1.6
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
                let currentFontSize = 90; // 初始字體大小
                rightVersionDiv.style.fontSize = currentFontSize + '%';

                // 強制瀏覽器重繪以取得正確个初始高度
                leftVersionDiv.offsetHeight;
                rightVersionDiv.offsetHeight;

                let leftHeight = leftVersionDiv.offsetHeight;
                let rightHeight = rightVersionDiv.offsetHeight; // 獲取初始高度

                console.log(`Initial check at ${currentFontSize}%: Right height ${rightHeight}px, Left height ${leftHeight}px`);

                // 如果初始字體大小就已經讓右邊內容不比左邊長，就不用調整了
                if (rightHeight <= leftHeight) {
                    console.log('Initial font size ' + currentFontSize + '% is sufficient or shorter.');
                    return;
                }

                // 如果初始字體大小讓右邊內容比左邊長，就開始縮小字體
                // 預設使用最小个測試字體 (50%)，假使所有測試過个字體都還係分右邊太長。
                let bestFitFontSize = 50;
                let foundOptimalAdjustment = false;

                for (let testSize = currentFontSize - 1; testSize >= 50; testSize--) { // 從比初始值小1%開始，最細到 50%
                    rightVersionDiv.style.fontSize = testSize + '%';
                    rightHeight = rightVersionDiv.offsetHeight; // 每次改變字體大小後，重新獲取高度 (強制 reflow)

                    if (rightHeight > leftHeight) {
                        // 這隻 testSize 還係分右邊太長，繼續試較細个字體。
                        // 假使這係迴圈最後一次 (testSize == 50) 而且還係太長，
                        // bestFitFontSize 會維持在 50%。
                    } else {
                        // 這隻 testSize 分右邊內容變到毋比左邊長了 (<=)。
                        // 照你个要求，𠊎等愛用前一隻字體大細 (testSize + 1)，
                        // 因為該隻字體大細會分右邊「略略仔長過左邊」。
                        bestFitFontSize = testSize + 1;
                        foundOptimalAdjustment = true;
                        console.log(`Right content became shorter/equal at ${testSize}% (height ${rightHeight}px). Applying previous size ${bestFitFontSize}% which was slightly taller.`);
                        break; // 尋到臨界點了，跳出迴圈
                    }
                }

                if (!foundOptimalAdjustment && currentFontSize > 50) {
                    // 假使迴圈跑完，foundOptimalAdjustment 還係 false，
                    // 表示從 (currentFontSize - 1) 到 50% 所有字體都還係分右邊太長。
                    // 在這情況下，bestFitFontSize 已經係 50%。
                    console.log(`All tested font sizes from ${currentFontSize - 1}% down to 50% still made right content taller. Using smallest tested size: 50%.`);
                }

                // 迴圈結束後，將字體設定為決定好个大小
                rightVersionDiv.style.fontSize = bestFitFontSize + '%';
                // 為著準確記錄最終狀態，重新量一次高度
                const finalRightHeight = rightVersionDiv.offsetHeight;
                console.log('Final adjusted font size for ' + rightDataVidSelector + ' is ' + bestFitFontSize + '%. Final Right content: ' + finalRightHeight + 'px, Left content: ' + leftHeight + 'px');
            });
        } catch (error) {
            console.error('Error during font adjustment:', error);
        }
    }
})();
