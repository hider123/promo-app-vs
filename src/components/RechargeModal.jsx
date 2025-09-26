import React, { useState, useEffect } from 'react';

const RechargeModal = ({ isOpen, onClose, onConfirm, appSettings }) => {
    const catPoolPrice = appSettings?.catPoolPrice || 0;
    const buyInRate = appSettings?.buyInRate || 7.5;
    
    const [quantity, setQuantity] = useState(10);

    const totalAmountUSD = quantity * catPoolPrice;
    const totalAmountCNY = totalAmountUSD * buyInRate;

    useEffect(() => {
        if (isOpen) {
            setQuantity(10);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-sm mx-auto rounded-lg shadow-xl z-10">
                 <div className="p-6">
                    {/* [核心修改] 放大标题字型 */}
                    <h3 className="text-2xl font-semibold text-gray-800">购买猫池帐号</h3>
                    <p className="text-base text-gray-500 mt-2">
                        请输入您希望购买的帐号数量。
                    </p>
                    <div className="mt-6">
                        <label htmlFor="recharge-quantity" className="block text-base font-medium text-gray-700">购买数量</label>
                        <div className="mt-2 relative flex items-center justify-center">
                            <button 
                                onClick={() => adjustQuantity(-1)} 
                                className="w-14 h-14 text-3xl font-bold border-2 border-gray-300 rounded-l-lg bg-gray-100 hover:bg-gray-200 flex-shrink-0"
                                aria-label="减少数量"
                            >
                                -
                            </button>
                            <input
                                type="number"
                                id="recharge-quantity"
                                value={quantity}
                                onChange={handleQuantityChange}
                                // [核心修改] 放大输入框字型
                                className="w-24 h-14 border-t-2 border-b-2 border-gray-300 text-xl font-bold text-center focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                min="1"
                            />
                            <button 
                                onClick={() => adjustQuantity(1)} 
                                className="w-14 h-14 text-3xl font-bold border-2 border-gray-300 rounded-r-lg bg-gray-100 hover:bg-gray-200 flex-shrink-0"
                                aria-label="增加数量"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 text-center bg-gray-50 p-4 rounded-lg">
                        <p className="text-lg text-gray-600">总计需储值：</p>
                        <p className="text-4xl font-bold text-indigo-600">US$ {totalAmountUSD.toFixed(2)}</p>
                        <p className="text-base text-gray-500 mt-1">
                            (约等于 <span className="font-semibold text-green-700">¥ {totalAmountCNY.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>)
                        </p>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-3 px-5 rounded-lg font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 text-lg">
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!quantity || quantity <= 0}
                        className="py-3 px-5 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg"
                    >
                        确认储值
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RechargeModal;