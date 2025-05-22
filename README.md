# 6BibleVersions - 多版本聖經閱讀器
這是一個專為比較閱讀多種聖經譯本設計的工具，特別適合需要同時參考臺灣客語、臺灣正體中文（台語漢字）、和合本等不同版本的使用者。本工具透過同步捲動功能，讓您輕鬆對照不同版本的經文。
臺灣客語，䟘起來，像日頭發光！
臺員話，起來，發光！
4 種語言、6 個版本的聖經對照閱讀學習。
https://aiuanyu.github.io/6BibleVersions/

## 功能特色 (Features)
* **多版本聖經同步顯示**：在同一個畫面中並排顯示多個聖經譯本，方便即時比較。
* **同步捲動**：閱讀時，各個譯本的畫面會同步捲動，讓您輕鬆對照經文。
* **書卷章節導覽**：提供方便的書卷和章節選擇功能，快速跳轉至特定經文。
* **自動儲存閱讀進度**：自動記錄您上次閱讀的位置，下次開啟即可繼續。
* **字體大小調整**：針對並排版本，自動調整字體大小以優化閱讀體驗。

## 安裝說明 (Installation)

您需要在瀏覽器上安裝額外的擴充套件（Userscript 和 Userstyle），本工具才能正常運作。

### 瀏覽器擴充套件 (Browser Extensions)
首先，請確認您的瀏覽器已安裝以下兩種擴充套件：
*   **使用者腳本管理器**：例如 [Tampermonkey](https://www.tampermonkey.net/) (適用於 Chrome, Edge, Safari, Opera Next) 或 [Greasemonkey](https://addons.mozilla.org/firefox/addon/greasemonkey/) (適用於 Firefox)。這類擴充套件能讓您執行自訂的使用者腳本。
*   **使用者樣式管理器**：例如 [Stylus](https://add0n.com/stylus.html) (適用於 Chrome, Firefox, Opera)。這類擴充套件能讓您套用自訂的網頁樣式。

### 安裝步驟 (Installation Steps)
1.  **安裝使用者腳本 (Userscript)**：
    *   點擊此連結前往 Greasy Fork 網站：[6BibleVersions Helper](https://greasyfork.org/zh-TW/scripts/536096-6bibleversions-helper)
    *   在 Greasy Fork 的頁面上，點擊綠色的「安裝此腳本」按鈕。
    *   您的使用者腳本管理器將會提示您確認安裝。
2.  **安裝使用者樣式 (Userstyle)**：
    *   點擊此連結前往 Userstyles.world 網站：[6BibleVersions Bible.com iframe style](https://userstyles.world/style/22349/)
    *   在 Userstyles.world 的頁面上，找到並點擊安裝按鈕（通常會標示為 "Install Style" 或類似的文字）。
    *   您的使用者樣式管理器將會提示您確認安裝。

完成以上步驟後，您就可以開始使用「6BibleVersions 閱讀器」了。

## 使用方法 (Usage)

安裝好使用者腳本（Userscript）和使用者樣式（Userstyle）之後，您可以透過以下方式使用本閱讀器：

1.  **開啟閱讀器**：
    *   直接點擊此連結開啟：[https://aiuanyu.github.io/6BibleVersions/](https://aiuanyu.github.io/6BibleVersions/)
    *   瀏覽器將會開啟「6BibleVersions 閱讀器」的主介面。

2.  **操作介面**：
    *   **選擇聖經版本**：閱讀器預設會載入特定的聖經版本。您可以透過修改 `index.html` 檔案中 `iframe` 的 `src` 網址來更換版本（未來可能會提供更方便的介面操作選項）。
    *   **書卷與章節選擇**：使用頁面上方的下拉式選單，選擇您想要閱讀的聖經書卷及章節。
    *   **導覽按鈕**：透過「上一章」和「下一章」按鈕來切換不同章節。
    *   **同步捲動**：當您捲動其中一個聖經版本的畫面時，其他版本的畫面也會同步捲動到相對應的位置。您也可以使用主介面上的主要捲動軸（scrollbar）來控制所有畫面的捲動。

3.  **閱讀與比較**：
    *   不同的聖經譯本會並排顯示，方便您逐句對照。
    *   透過使用者腳本和使用者樣式的作用，嵌入的 bible.com 網頁介面將會被簡化，並且在適用情況下強制以雙欄顯示，以提供最佳的比較閱讀體驗。

請注意：本工具主要是透過修改 bible.com 在內嵌框架（iframe）中的運作方式來達成多版本對照，因此其功能有賴於 bible.com 網站本身的結構。如果 bible.com 網站進行重大改版，可能會影響本工具的正常運作。
