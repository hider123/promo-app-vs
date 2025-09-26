import React, { useState, useEffect, useMemo } from 'react';

const WithdrawModal = ({ isOpen, onClose, onConfirm, withdrawableBalance, appSettings, paymentInfo }) => {
    const sellOutRate = appSettings?.sellOutRate || 7.0;
    
    const availableMethods = useMemo(() => {
        const methods = [];
        if (paymentInfo?.alipay?.account) methods.push('alipay');
        if (paymentInfo?.wechat?.account) methods.push('wechat');
        if (paymentInfo?.bankcard?.number && paymentInfo?.bankcard?.name) methods.push('bankcard');
        return methods;
    }, [paymentInfo]);

    const [selectedMethod, setSelectedMethod] = useState(availableMethods[0] || null);
    const [amountUSD, setAmountUSD] = useState('');
    const [error, setError] = useState('');

    const amountCNY = (parseFloat(amountUSD) || 0) * sellOutRate;

    useEffect(() => {
        if (isOpen) {
            setSelectedMethod(availableMethods[0] || null);
        } else {
            setAmountUSD('');
            setError('');
        }
    }, [isOpen, availableMethods]);

    useEffect(() => {
        const usd = parseFloat(amountUSD);
        if (usd > withdrawableBalance) {
            setError(`提领金额不能超过可提领馀额 US$${withdrawableBalance.toFixed(2)}`);
        } else {
            setError('');
        }
    }, [amountUSD, withdrawableBalance]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (error || !amountUSD || !selectedMethod) return;
        const usd = parseFloat(amountUSD);
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

    const TabButton = ({ method, label, icon }) => {
        const isDisabled = !availableMethods.includes(method);
        return (
            <button
                type="button"
                disabled={isDisabled}
                onClick={() => setSelectedMethod(method)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-base font-semibold border-b-2 transition-colors ${selectedMethod === method ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-600'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <i className={icon}></i>
                {label}
            </button>
        );
    };
    
    const renderSelectedMethodDetails = () => {
        if (!selectedMethod) return null;
        const data = paymentInfo[selectedMethod];
        
        switch(selectedMethod) {
            case 'alipay':
                return <p className="text-base text-gray-700">帐号: <span className="font-semibold">{data.account}</span></p>;
            case 'wechat':
                return <p className="text-base text-gray-700">帐号: <span className="font-semibold">{data.account}</span></p>;
            case 'bankcard':
                return (
                    <div className="text-base text-gray-700 text-left">
                        <p>户名: <span className="font-semibold">{data.name}</span></p>
                        <p>银行: <span className="font-semibold">{data.bankName}</span></p>
                        <p>卡号: <span className="font-semibold">{data.number}</span></p>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-md mx-auto rounded-lg shadow-xl z-10">
                <div className="p-6">
                    {/* [核心修改] 放大标题和内文字型 */}
                    <h3 className="text-2xl font-semibold text-gray-800">申请提领</h3>
                    <p className="text-base text-gray-500 mt-2">
                        您的可提领馀额为 <span className="font-bold text-indigo-600">US${withdrawableBalance.toFixed(2)}</span>
                    </p>
                    
                    {availableMethods.length > 0 ? (
                        <>
                            <div className="mt-4 border-b border-gray-200">
                                <nav className="flex" aria-label="Tabs">
                                    <TabButton method="alipay" label="支付宝" icon="fab fa-alipay" />
                                    <TabButton method="wechat" label="微信" icon="fab fa-weixin" />
                                    <TabButton method="bankcard" label="银行卡" icon="fas fa-credit-card" />
                                </nav>
                            </div>

                            <div className="mt-4 p-3 bg-gray-50 rounded-lg min-h-[80px] flex items-center justify-center">
                                {renderSelectedMethodDetails()}
                            </div>

                            <div className="mt-4">
                                <label htmlFor="withdraw-amount" className="block text-base font-medium text-gray-700">提领金额 (美元)</label>
                                <input
                                    type="text"
                                    id="withdraw-amount"
                                    value={amountUSD}
                                    onChange={handleAmountChange}
                                    placeholder="0.00"
                                    className={`mt-2 block w-full border-gray-300 rounded-md shadow-sm text-xl text-center font-bold ${error ? 'border-red-500 ring-red-500' : 'focus:ring-indigo-500 focus:border-indigo-500'}`}
                                    inputMode="decimal"
                                />
                                {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
                            </div>
                            <div className="mt-4 text-center bg-gray-50 p-4 rounded-lg">
                                <p className="text-lg text-gray-600">预计到帐人民币：</p>
                                <p className="text-4xl font-bold text-green-600">¥ {amountCNY.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-10 px-4">
                            <i className="fas fa-wallet fa-2x text-gray-400"></i>
                            <h4 className="font-semibold text-xl mt-4">您尚未设定任何收款方式</h4>
                            <p className="text-base text-gray-500 mt-2">请先前往“我的帐户”页面新增收款方式，才能申请提领。</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                    <button onClick={onClose} className="py-3 px-5 rounded-lg font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 text-lg">
                        {availableMethods.length > 0 ? '取消' : '关闭'}
                    </button>
                    {availableMethods.length > 0 && (
                        <button
                            onClick={handleConfirm}
                            disabled={!!error || !amountUSD || parseFloat(amountUSD) <= 0 || !selectedMethod}
                            className="py-3 px-5 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-lg"
                        >
                            确认送出申请
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WithdrawModal;