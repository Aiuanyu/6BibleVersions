// ==UserScript==
// @name        Bible.com iframe specific styles
// @namespace   Violentmonkey Scripts
// @match       https://www.bible.com/*
// @grant       none
// @version     1.0
// @author      Aiuanyu x Gemini
// @description Adds a class to html if bible.com is in an iframe
// ==/UserScript==

(function() {
    'use strict';

    if (window.self !== window.top) {
        document.documentElement.classList.add('is-in-iframe');
        console.log('Bible.com is in an iframe, added class "is-in-iframe" to <html>');
    } else {
        console.log('Bible.com is top level window.');
    }
})();

/*
  底下係 CSS 部分，你做得直接寫在 userstyle 檔案个 CSS 區塊，
  或者在像 Stylus 恁樣个工具裡肚，JS 同 CSS 會分開處理。
*/
