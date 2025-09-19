import React, { useState, useEffect } from 'react';

const RechargeModal = ({ isOpen, onClose, onConfirm, appSettings }) => {
    // 1. 從後台設定取得價格和匯率，並提供預設值
    const catPoolPrice = appSettings?.catPoolPrice || 30.00;
    const buyInRate = appSettings?.buyInRate || 7.5;
    
    // 2. 使用 state 來管理要購買的「數量」，預設為 10
    const [quantity, setQuantity] = useState(10);

    // 3. 根據數量和單價，即時計算總金額
    const totalAmountUSD = quantity * catPoolPrice;
    const totalAmountCNY = totalAmountUSD * buyInRate;

    // 4. 當彈出視窗開啟時，重設為預設數量
    useEffect(() => {
        if (isOpen) {
            setQuantity(10);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // 5. 定義事件處理函式
    const handleConfirm = () => {
        // 確認時，將計算出的「總金額」傳遞出去
        if (totalAmountUSD > 0) {
            onConfirm(totalAmountUSD);
        }
    };

    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        setQuantity(isNaN(value) || value < 1 ? 1 : value);
    };
    
    const adjustQuantity = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    // 6. 回傳 JSX 結構
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-sm mx-auto rounded-lg shadow-xl z-10">
                 <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">購買貓池帳號</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        請輸入您希望購買的帳號數量。
                    </p>
                    <div className="mt-6">
                        <label htmlFor="recharge-quantity" className="block text-sm font-medium text-gray-700">購買數量</label>
                        {/* [核心修正] 重新設計數量選擇器的佈局和樣式 */}
                        <div className="mt-1 relative flex items-center justify-center">
                            <button 
                                onClick={() => adjustQuantity(-1)} 
                                className="w-12 h-12 text-2xl font-bold border-2 border-gray-300 rounded-l-lg bg-gray-100 hover:bg-gray-200 flex-shrink-0"
                                aria-label="減少數量"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                id="recharge-quantity"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="w-20 h-12 border-t-2 border-b-2 border-gray-300 text-lg font-bold text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                min="1"
                            />
                            <button 
                                onClick={() => adjustQuantity(1)} 
                                className="w-12 h-12 text-2xl font-bold border-2 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200 flex-shrink-0"
                                aria-label="增加數量"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 text-center bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-600">總計需儲值：</p>
                        <p className="text-3xl font-bold text-indigo-600">US$ {totalAmountUSD.toFixed(2)}</p>
                        <p className="text-gray-500 text-sm mt-1">
                            (約等於 <span className="font-semibold text-green-700">¥ {totalAmountCNY.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>)
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!quantity || quantity <= 0}
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

