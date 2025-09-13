import React, { useState } from 'react';

const RechargeModal = ({ isOpen, onClose, onConfirm }) => {
    const [amount, setAmount] = useState('');
    const presetAmounts = [500, 1000, 2000];

    if (!isOpen) return null;

    const handleConfirm = () => {
        const numAmount = parseFloat(amount);
        if (numAmount > 0) {
            onConfirm(numAmount);
        }
    };

    const handleAmountChange = (e) => {
        // 只允許輸入數字和小數點
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmount(value);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="modal-overlay-transition absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="modal-content-transition bg-white w-11/12 max-w-sm mx-auto rounded-lg shadow-xl z-10">
                 <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">帳戶儲值</h3>
                    <p className="text-sm text-gray-500 mt-1">請輸入您希望儲值的金額。</p>
                    <div className="mt-6">
                        <label htmlFor="recharge-amount" className="block text-sm font-medium text-gray-700">儲值金額 (NT$)</label>
                        <input
                            type="text"
                            id="recharge-amount"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="例如：500"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg text-center font-bold"
                            pattern="[0-9.]*"
                            inputMode="decimal"
                        />
                    </div>
                    <div className="mt-4 flex justify-center gap-3">
                        {presetAmounts.map(preset => (
                            <button
                                key={preset}
                                onClick={() => setAmount(String(preset))}
                                className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                                {preset}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!amount || parseFloat(amount) <= 0}
                        className="py-2 px-4 rounded-md font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        確認儲值
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RechargeModal;
