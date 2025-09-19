import React, { useState, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

// 定義所有可用的渠道
const ALL_CHANNELS = [
    { id: 'bankcard', name: '銀行卡支付', icon: 'fas fa-credit-card' },
    { id: 'alipay', name: '支付寶', icon: 'fab fa-alipay' },
    { id: 'wechat', name: '微信支付', icon: 'fab fa-weixin' },
];

const RechargeSettingsPage = () => {
    // 1. 從 AdminContext 取得目前的設定值和更新函式
    const { appSettings, handleUpdateSettings } = useAdminContext();

    // 2. 使用 state 來管理表單中的資料
    const [channelSettings, setChannelSettings] = useState({
        bankcard: true,
        alipay: true,
        wechat: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    // 3. 當從資料庫讀取到設定後，更新表單的預設值
    useEffect(() => {
        if (appSettings && appSettings.paymentChannels) {
            setChannelSettings(appSettings.paymentChannels);
        }
    }, [appSettings]);

    // 4. 處理勾選狀態變化的函式
    const handleToggle = (channelId) => {
        setChannelSettings(prev => ({
            ...prev,
            [channelId]: !prev[channelId]
        }));
    };

    // 5. 處理表單提交的函式
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        // 更新整個 appSettings 物件，只修改 paymentChannels 部分
        await handleUpdateSettings({
            ...appSettings,
            paymentChannels: channelSettings
        });
        setIsSaving(false);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">充值渠道設定</h1>

            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">前台顯示選項</h2>
                    <p className="text-sm text-gray-500">勾選的項目，將會顯示在前台的支付渠道選擇頁面。</p>
                    
                    <div className="divide-y divide-gray-200">
                        {ALL_CHANNELS.map(channel => (
                            <div key={channel.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <i className={`${channel.icon} text-2xl mr-4 w-8 text-center`}></i>
                                    <span className="font-medium text-gray-800">{channel.name}</span>
                                </div>
                                <label htmlFor={channel.id} className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        id={channel.id} 
                                        className="sr-only peer"
                                        checked={!!channelSettings[channel.id]}
                                        onChange={() => handleToggle(channel.id)}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-indigo-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 border-t">
                     <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:bg-indigo-400"
                    >
                        {isSaving ? '儲存中...' : '儲存設定'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RechargeSettingsPage;
