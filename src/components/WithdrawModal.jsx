import React, { useState, useEffect, useMemo } from 'react';

// 提領彈窗元件
const WithdrawModal = ({ isOpen, onClose, onConfirm, withdrawableBalance, appSettings, paymentInfo }) => {
    // 1. 從後台設定取得賣出匯率，並提供預設值
    const sellOutRate = appSettings?.sellOutRate || 7.0;
    
    // 2. 篩選出用戶已設定的、有效的收款方式
    const availableMethods = useMemo(() => {
        const methods = [];
        if (paymentInfo?.alipay?.account) methods.push('alipay');
        if (paymentInfo?.wechat?.account) methods.push('wechat');
        if (paymentInfo?.bankcard?.number && paymentInfo?.bankcard?.name) methods.push('bankcard');
        return methods;
    }, [paymentInfo]);

    // 3. 管理 UI 狀態
    const [selectedMethod, setSelectedMethod] = useState(availableMethods[0] || null);
    const [amountUSD, setAmountUSD] = useState('');
    const [error, setError] = useState('');

    const amountCNY = (parseFloat(amountUSD) || 0) * sellOutRate;

    // 4. 副作用 Hooks
    useEffect(() => {
        // 當 Modal 開啟時，自動選擇第一個可用的方式
        if (isOpen) {
            setSelectedMethod(availableMethods[0] || null);
        } else {
            // 當 Modal 關閉時，清空表單
            setAmountUSD('');
            setError('');
        }
    }, [isOpen, availableMethods]);

    useEffect(() => {
        const usd = parseFloat(amountUSD);
        if (usd > withdrawableBalance) {
            setError(`提領金額不能超過可提領餘額 US$${withdrawableBalance.toFixed(2)}`);
        } else {
            setError('');
        }
    }, [amountUSD, withdrawableBalance]);

    if (!isOpen) return null;

    // 5. 事件處理函式
    const handleConfirm = () => {
        if (error || !amountUSD || !selectedMethod) return;
        const usd = parseFloat(amountUSD);
        // 將選中的收款方式的完整資料物件傳遞出去
        const selectedPaymentData = paymentInfo[selectedMethod];
        if (usd > 0) {
            onConfirm({ amount: usd, paymentInfo: selectedPaymentData });
        }
    };

    const handleAmountChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setAmountUSD(value);
        }
    };

    // 頁籤按鈕元件
    const TabButton = ({ method, label, icon }) => {
        const isDisabled = !availableMethods.includes(method);
        return (
            <button
                type="button"
                disabled={isDisabled}
                onClick={() => setSelectedMethod(method)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors ${selectedMethod === method ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-600'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <i className={icon}></i>
                {label}
            </button>
        );
    };
    
    // 顯示選中方式的詳細資訊
    const renderSelectedMethodDetails = () => {
        if (!selectedMethod) return null;
        const data = paymentInfo[selectedMethod];
        
        switch(selectedMethod) {
            case 'alipay':
                return <p className="text-sm text-gray-700">帳號: <span className="font-semibold">{data.account}</span></p>;
            case 'wechat':
                return <p className="text-sm text-gray-700">帳號: <span className="font-semibold">{data.account}</span></p>;
            case 'bankcard':
                return (
                    <div className="text-sm text-gray-700 text-left">
                        <p>戶名: <span className="font-semibold">{data.name}</span></p>
                        <p>銀行: <span className="font-semibold">{data.bankName}</span></p>
                        <p>卡號: <span className="font-semibold">{data.number}</span></p>
                    </div>
                );
            default: return null;
        }
    }

    // 6. 回傳 JSX
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/alias/md mx-auto rounded-lg shadow-xl z-10">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">申請提領</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        您的可提領餘額為 <span className="font-bold text-indigo-600">US${withdrawableBalance.toFixed(2)}</span>
                    </p>
                    
                    {availableMethods.length > 0 ? (
                        <>
                            <div className="mt-4 border-b border-gray-200">
                                <nav className="flex" aria-label="Tabs">
                                    <TabButton method="alipay" label="支付寶" icon="fab fa-alipay" />
                                    <TabButton method="wechat" label="微信" icon="fab fa-weixin" />
                                    <TabButton method="bankcard" label="銀行卡" icon="fas fa-credit-card" />
                                </nav>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded-lg min-h-[60px] flex items-center justify-center">
                                {renderSelectedMethodDetails()}
                            </div>

                            <div className="mt-4">
                                <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700">提領金額 (美元)</label>
                                <input
                                    type="text"
                                    id="withdraw-amount"
                                    value={amountUSD}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-lg text-center font-bold ${error ? 'border-red-500 ring-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                    inputMode="decimal"
                                />
                                {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                            </div>
                            <div className="mt-4 text-center bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-600">預計到帳人民幣：</p>
                                <p className="text-3xl font-bold text-green-600">¥ {amountCNY.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 px-4">
                            <i className="fas fa-wallet fa-2x text-gray-400"></i>
                            <h4 className="font-semibold mt-4">您尚未設定任何收款方式</h4>
                            <p className="text-sm text-gray-500 mt-2">請先前往「我的帳戶」頁面新增收款方式，才能申請提領。</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                        {availableMethods.length > 0 ? '取消' : '關閉'}
                    </button>
                    {availableMethods.length > 0 && (
                        <button
                            onClick={handleConfirm}
                            disabled={!!error || !amountUSD || parseFloat(amountUSD) <= 0 || !selectedMethod}
                            className="py-2 px-4 rounded-md font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                        >
                            確認送出申請
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;