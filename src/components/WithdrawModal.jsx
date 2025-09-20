import React, { useState, useEffect } from 'react';

const WithdrawModal = ({ isOpen, onClose, onConfirm, withdrawableBalance, appSettings }) => {
    // 1. 從後台設定取得賣出匯率，並提供預設值
    const sellOutRate = appSettings?.sellOutRate || 7.0;
    
    // 2. 使用 state 來管理提領金額
    const [amountUSD, setAmountUSD] = useState('');
    const [amountCNY, setAmountCNY] = useState(0);
    const [error, setError] = useState('');

    // 3. 當使用者輸入美金時，即時換算
    useEffect(() => {
        const usd = parseFloat(amountUSD);
        if (!isNaN(usd) && usd > 0) {
            setAmountCNY(usd * sellOutRate);
            if (usd > withdrawableBalance) {
                setError(`提領金額不能超過可提領餘額 US$${withdrawableBalance.toFixed(2)}`);
            } else {
                setError('');
            }
        } else {
            setAmountCNY(0);
            setError('');
        }
    }, [amountUSD, withdrawableBalance, sellOutRate]);

    if (!isOpen) return null;

    // 4. 定義事件處理函式
    const handleConfirm = () => {
        const usd = parseFloat(amountUSD);
        if (usd > 0 && usd <= withdrawableBalance) {
            onConfirm(usd);
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setAmountUSD(value);
        }
    };

    // 5. 回傳 JSX 結構
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-sm mx-auto rounded-lg shadow-xl z-10">
                 <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">申請提領</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        您的可提領餘額為 <span className="font-bold text-indigo-600">US${withdrawableBalance.toFixed(2)}</span>
                    </p>
                    <div className="mt-6">
                        <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700">提領金額 (美元)</label>
                        <input
                            type="text"
                            id="withdraw-amount"
                            value={amountUSD}
                            onChange={handleAmountChange}
                            placeholder="請輸入您希望提領的金額"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg text-center font-bold"
                            pattern="[0-9.]*"
                            inputMode="decimal"
                        />
                    </div>
                    {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
                    <div className="mt-4 text-center bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">預計到帳人民幣：</p>
                        <p className="text-3xl font-bold text-green-600">¥ {amountCNY.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!!error || !amountUSD || parseFloat(amountUSD) <= 0}
                        className="py-2 px-4 rounded-md font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        確認提領
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;
