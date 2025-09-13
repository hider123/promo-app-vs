import React from 'react';
import { useData } from '../../context/DataContext.jsx';

// 支付渠道的選項設定
const channels = [
    { id: 'bankcard', name: '銀行卡支付', icon: 'fas fa-credit-card' },
    { id: 'alipay', name: '支付寶', icon: 'fab fa-alipay' },
    { id: 'wechat', name: '微信支付', icon: 'fab fa-weixin' },
];

const PaymentChannelsPage = ({ onBack, amount }) => {
    // 從 Context 取得儲值函式和顯示提示的函式
    const { handleRecharge, showAlert } = useData();

    // 模擬處理支付的函式
    const handlePayment = (channelName) => {
        // 呼叫核心的儲值邏輯
        handleRecharge(amount);
        // 關閉此頁面，返回「我的帳號」主頁面
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
                <p className="text-5xl font-bold text-indigo-600 my-2">
                    NT$ {amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            
            {/* 支付渠道列表 */}
            <div className="bg-white rounded-lg shadow-sm">
                 <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">請選擇儲值渠道</h2>
                 <ul className="divide-y divide-gray-200">
                    {channels.map((channel) => (
                         <li key={channel.id} className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handlePayment(channel.name)}>
                            <div className="flex items-center">
                                <i className={`${channel.icon} text-3xl mr-4 w-8 text-center`}></i>
                                <span className="font-medium text-gray-800 text-lg">{channel.name}</span>
                            </div>
                            <i className="fas fa-chevron-right text-gray-400"></i>
                        </li>
                    ))}
                 </ul>
            </div>
        </div>
    );
};

export default PaymentChannelsPage;
