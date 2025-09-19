import React from 'react';
import { useUserContext } from '../../context/UserContext.jsx';

// 定義所有可用的渠道
const ALL_CHANNELS = [
    { id: 'bankcard', name: '銀行卡支付', icon: 'fas fa-credit-card' },
    { id: 'alipay', name: '支付寶', icon: 'fab fa-alipay' },
    { id: 'wechat', name: '微信支付', icon: 'fab fa-weixin' },
];

const PaymentChannelsPage = ({ onBack, amount }) => {
    // 1. 從 UserContext 取得函式和後台設定
    const { handleRecharge, appSettings } = useUserContext();

    // 2. [核心修正] 根據後台設定，過濾出已啟用的支付渠道
    const enabledChannels = ALL_CHANNELS.filter(channel => 
        appSettings?.paymentChannels?.[channel.id] === true
    );

    const buyInRate = appSettings?.buyInRate || 7.5;
    const amountInCNY = amount * buyInRate;

    // 3. 模擬處理支付的函式
    const handlePayment = (channelName) => {
        handleRecharge(amount);
        onBack();
    };

    return (
        <div className="p-4 space-y-6">
            {/* 頁面標頭 */}
            <div className="relative flex items-center justify-center">
                <button onClick={onBack} className="absolute left-0 text-indigo-600 hover:text-indigo-800" aria-label="返回上一頁">
                    <i className="fas fa-arrow-left fa-lg"></i>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">選擇儲值方式</h1>
            </div>

            {/* 待支付金額 */}
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-lg font-medium text-gray-500">儲值金額</p>
                <p className="text-5xl font-bold text-green-600 my-2">
                    ¥ {amountInCNY.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                 <p className="text-sm text-gray-500">
                    (等於 US$ {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                </p>
            </div>
            
            {/* 支付渠道列表 */}
            <div className="bg-white rounded-lg shadow-sm">
                 <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">請選擇儲值渠道</h2>
                 <ul className="divide-y divide-gray-200">
                    {enabledChannels.length > 0 ? (
                        enabledChannels.map((channel) => (
                             <li key={channel.id} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handlePayment(channel.name)}>
                                <div className="flex items-center">
                                    <i className={`${channel.icon} text-3xl mr-4 w-8 text-center`}></i>
                                    <span className="font-medium text-gray-800 text-lg">{channel.name}</span>
                                </div>
                                <i className="fas fa-chevron-right text-gray-400"></i>
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-gray-500">
                            目前沒有可用的儲值渠道。
                        </li>
                    )}
                 </ul>
            </div>
        </div>
    );
};

export default PaymentChannelsPage;

