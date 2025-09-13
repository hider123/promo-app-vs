import React from 'react';

// 這個元件的作用是將一些全域的 CSS 樣式注入到應用程式中。
// 這樣可以保持主 CSS 檔案的整潔，並將特定於元件庫或佈局的樣式放在一起。
const StyleInjector = () => (
  <style>{`
    :root {
        --tab-bar-height: 60px; /* 定義底部導覽列高度 */
    }
    html {
        font-size: 17px; /* [修正] 將基礎字體大小從預設的 16px 放大，影響整個 APP */
    }
    html, body, #root {
        height: 100%;
        margin: 0;
        padding: 0;
        overflow: hidden; /* 防止 body 滾動 */
    }
    body {
        font-family: 'Inter', 'Noto Sans TC', sans-serif;
        background-color: #f8fafc; /* cool-gray-50 */
    }
    /* Modal 動畫效果 */
    .modal-overlay-transition {
        transition: opacity 0.3s ease-in-out;
    }
    .modal-content-transition {
        transition: transform 0.3s ease-in-out;
    }
    /* 自定義捲軸樣式 */
    textarea::-webkit-scrollbar, .main-content::-webkit-scrollbar, .account-list-scroll::-webkit-scrollbar {
        width: 8px;
    }
    textarea::-webkit-scrollbar-track, .main-content::-webkit-scrollbar-track, .account-list-scroll::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 10px;
    }
    textarea::-webkit-scrollbar-thumb, .main-content::-webkit-scrollbar-thumb, .account-list-scroll::-webkit-scrollbar-thumb {
        background: #d1d5db; /* cool-gray-300 */
        border-radius: 10px;
    }
    textarea::-webkit-scrollbar-thumb:hover, .main-content::-webkit-scrollbar-thumb:hover, .account-list-scroll::-webkit-scrollbar-thumb:hover {
        background: #9ca3af; /* cool-gray-400 */
    }
  `}</style>
);

export default StyleInjector;
