import React from 'react';

// 通用的提示 Modal 元件
// 用於顯示簡單訊息，並提供一個確認按鈕
const AlertModal = ({ isOpen, onClose, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="modal-overlay-transition absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="modal-content-transition bg-white w-11/12 max-w-sm mx-auto rounded-lg shadow-xl z-10 p-6 text-center">
                <p className="text-lg text-gray-800 mb-6 whitespace-pre-line">{message}</p>
                <button onClick={onClose} className="w-full py-2 px-4 rounded-md font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700">
                    確認
                </button>
            </div>
        </div>
    );
};

export default AlertModal;

