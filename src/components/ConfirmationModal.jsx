import React from 'react';

// 通用的確認 Modal 元件
// 提供標題、內容和「取消」、「確認」兩個操作按鈕
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="modal-overlay-transition absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="modal-content-transition bg-white w-11/12 max-w-sm mx-auto rounded-lg shadow-xl z-10">
                 <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                    <div className="text-gray-600 mt-4">
                        {children}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                        取消
                    </button>
                    <button onClick={onConfirm} className="py-2 px-4 rounded-md font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700">
                        確認支付
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;