// ==UserScript==
// @name        Bible.com iframe specific styles
// @namespace   Violentmonkey Scripts
// @match       *://www.bible.com/*
// @grant       none
// @version     1.8 // 改善字體大細个調整成功率
// @author      Aiuanyu x Gemini
// @description Adds a class to html if bible.com is in an iframe. Adjusts font size of parallel versions to fit the left column. Accepts parent scrolling messages.
// @description:zh-TW 當 bible.com 在 iframe 裡時，給 <html> 加個 class。調整並列版本个字體大小，讓佇左邊个欄位內看起來較好。接受上層網頁共下捲動个命令。
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) {
        document.documentElement.classList.add('is-in-iframe');
        console.log('Bible.com is in an iframe, added class "is-in-iframe" to <html>');

        // 當 iframe 內容載入完成後，嘗試調整並列版本个字體大小
        window.addEventListener('load', function () {
            // 等待所有字體載入完成 (e.g., web fonts used by bible.com itself)
            document.fonts.ready.then(function () {
                // Add a small delay AFTER fonts are ready and page is loaded,
                // to give bible.com's own scripts more time to render dynamic content
                // before we start measuring heights.
                const initialAdjustmentDelay = 1500; // 1.5 秒鐘
                console.log(`All fonts loaded. Waiting ${initialAdjustmentDelay}ms before attempting font adjustment.`);
                setTimeout(function() {
                    adjustParallelFontSize();
                }, initialAdjustmentDelay);
            }).catch(function (error) {
                console.warn('Font loading error or timeout, proceeding with font adjustment anyway:', error);
                setTimeout(function() { adjustParallelFontSize(); }, 1500); // 若有錯誤，也延遲一息仔再試
            });
        });
        
        // 監聽來自父視窗 (index.html) 的訊息
        window.addEventListener('message', function(event) {
            // 為著安全，可以檢查訊息來源 event.origin
            // 但因為 index.html 可能係 file:// 協定，event.origin 會係 'null'
            // 所以，檢查 event.source 是不是 window.top 會較穩當
            if (event.source !== window.top) {
                // console.log('Userscript: Message ignored, not from top window.');
                return;
            }

            if (event.data && event.data.type === 'SYNC_SCROLL_TO_PERCENTAGE') {
                const percentage = parseFloat(event.data.percentage);
                if (isNaN(percentage) || percentage < 0 || percentage > 1) {
                    console.warn('Userscript: Invalid scroll percentage received:', event.data.percentage);
                    return;
                }

                const de = document.documentElement;
                const scrollableDistance = de.scrollHeight - de.clientHeight;

                if (scrollableDistance <= 0) {
                    // console.log('Userscript: Content is not scrollable.');
                    return; // 內容毋使捲動
                }

                const scrollToY = scrollableDistance * percentage;
                // console.log(`Userscript: Scrolling to ${percentage*100}%, ${scrollToY}px. Scrollable: ${scrollableDistance}, Total: ${de.scrollHeight}, Visible: ${de.clientHeight}`);
                window.scrollTo({ top: scrollToY, behavior: 'auto' }); // 'auto' 表示立即捲動
            }
        });

    } else {
        console.log('Bible.com is top level window.');
    }
    function adjustParallelFontSize(retryAttempt = 0) {
        const MAX_RETRIES = 10; // 增加重試次數
        const RETRY_DELAY = 1200; // 每次重試之間等 1.2 秒鐘
        const MIN_COLUMN_HEIGHT_THRESHOLD = 50; // px, 用來判斷內容敢有顯示出來个基本高度

        try { // try...catch 包住整個函數个內容
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

            // 找出並列閱讀个主要容器 (根據先前个 HTML 結構)
            const parallelContainer = document.querySelector('div.grid.md\\:grid-cols-2, div.grid.grid-cols-1.md\\:grid-cols-2');
            if (!parallelContainer) {
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

            const leftVersionDiv = leftColumnEl.querySelector(leftDataVidSelector);
            const rightVersionDiv = rightColumnEl.querySelector(rightDataVidSelector);

            if (!leftVersionDiv || !rightVersionDiv) {
                console.log(`Content div for left (${leftDataVidSelector}) or right (${rightDataVidSelector}) not found.`);
                if (retryAttempt < MAX_RETRIES -1) { // 為元素搜尋保留一些重試次數
                    console.warn(`Retrying element search in ${RETRY_DELAY}ms (Attempt ${retryAttempt + 1}/${MAX_RETRIES})`);
                    setTimeout(() => adjustParallelFontSize(retryAttempt + 1), RETRY_DELAY);
                } else {
                    console.error('Element search failed after max retries for content divs. Aborting font adjustment.');
                }
                return; // 若元素無尋到，愛 return 避免錯誤
            }

            // At this point, elements are found. Now check if they have rendered content.
            // Force reflow before measurement
            leftVersionDiv.offsetHeight;
            rightVersionDiv.offsetHeight; // Ensure reflow before measurement
            const currentLeftHeight = leftVersionDiv.offsetHeight;

            if (currentLeftHeight < MIN_COLUMN_HEIGHT_THRESHOLD && retryAttempt < MAX_RETRIES) { // 若左欄高度無夠
                console.warn(`Left column height (${currentLeftHeight}px) is less than threshold (${MIN_COLUMN_HEIGHT_THRESHOLD}px). Content might not be fully rendered. Retrying in ${RETRY_DELAY}ms (Attempt ${retryAttempt + 1}/${MAX_RETRIES})`);
                setTimeout(() => adjustParallelFontSize(retryAttempt + 1), RETRY_DELAY);
                return;
            }
            if (currentLeftHeight < MIN_COLUMN_HEIGHT_THRESHOLD && retryAttempt >= MAX_RETRIES) { // 重試了後還係無夠高
                console.error(`Left column height (${currentLeftHeight}px) remains below threshold after ${MAX_RETRIES} retries. Aborting font adjustment.`);
                return; // 放棄調整
            }

            console.log('Found leftVersionDiv:', leftVersionDiv, 'Found rightVersionDiv:', rightVersionDiv);

            // 使用 requestAnimationFrame 來確保 DOM 操作和測量是在瀏覽器準備好繪製下一幀之前進行
            // If we reach here, elements are found and left column has some content.
            requestAnimationFrame(() => {
                // 開始調整字體
                let currentFontSize = 90; // 初始字體大小
                rightVersionDiv.style.fontSize = currentFontSize + '%';

                // The leftHeight from *before* rAF (currentLeftHeight) should be the reference.
                let leftHeight = currentLeftHeight;
                // Ensure right column also reflows with its new font size
                let rightHeight = rightVersionDiv.offsetHeight; // 獲取初始高度

                console.log(`Initial check at ${currentFontSize}%: Right height ${rightHeight}px, Left height ${leftHeight}px (reference)`);

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
