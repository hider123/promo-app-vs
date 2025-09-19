import React, { useState, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

const SettingsPage = () => {
    // 1. 從 AdminContext 取得目前的設定值和更新函式
    const { appSettings, handleUpdateSettings } = useAdminContext();

    // 2. 使用 state 來管理表單中的資料
    const [settings, setSettings] = useState({
        catPoolPrice: 5.00,
        commissionRate: 0.05,
        copyPushCommission: 1.50,
        copyPushLimit: 3,
        midTierThreshold: 20,
        highTierThreshold: 100,
        buyInRate: 7.5,
        sellOutRate: 7.0,
    });
    const [isSaving, setIsSaving] = useState(false);

    // 3. 當從資料庫讀取到設定後，更新表單的預設值
    useEffect(() => {
        if (appSettings) {
            setSettings(appSettings);
        }
    }, [appSettings]);

    // 4. 處理表單欄位變化的函式
    const handleChange = (e) => {
        const { name, value } = e.target;
        // 將輸入值轉換為數字
        setSettings(prev => ({ ...prev, [name]: parseFloat(value) }));
    };

    // 5. 處理表單提交的函式
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await handleUpdateSettings(settings);
        setIsSaving(false);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">系統設定</h1>

            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-sm space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">貓池設定</h2>
                    <div className="mt-4">
                        <label htmlFor="catPoolPrice" className="block text-sm font-medium text-gray-700">新帳號購買價格 (美元)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="catPoolPrice"
                                id="catPoolPrice"
                                value={settings.catPoolPrice || ''}
                                onChange={handleChange}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-800">佣金與推播設定</h2>
                    <div className="mt-4">
                        <label htmlFor="commissionRate" className="block text-sm font-medium text-gray-700">推播成功佣金率 (%)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <input
                                type="number"
                                name="commissionRate"
                                id="commissionRate"
                                value={(settings.commissionRate || 0) * 100}
                                onChange={(e) => setSettings(prev => ({ ...prev, commissionRate: parseFloat(e.target.value) / 100 }))}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="5"
                                step="0.1"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">%</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="copyPushCommission" className="block text-sm font-medium text-gray-700">文案推播固定佣金 (美元)</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                name="copyPushCommission"
                                id="copyPushCommission"
                                value={settings.copyPushCommission || ''}
                                onChange={handleChange}
                                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                                placeholder="0.00"
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor="copyPushLimit" className="block text-sm font-medium text-gray-700">每日文案推播上限 (次數)</label>
                        <input
                            type="number"
                            name="copyPushLimit"
                            id="copyPushLimit"
                            value={settings.copyPushLimit || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="例如：3"
                            step="1"
                        />
                    </div>
                </div>
                
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">會員階級設定</h2>
                    <div className="mt-4">
                        <label htmlFor="midTierThreshold" className="block text-sm font-medium text-gray-700">中階升級條件 (貓池購買數量)</label>
                        <input
                            type="number"
                            name="midTierThreshold"
                            id="midTierThreshold"
                            value={settings.midTierThreshold || ''}
                            onChange={handleChange}
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="例如：20"
                            step="1"
                        />
                    </div>
                     <div className="mt-4">
                        <label htmlFor="highTierThreshold" className="block text-sm font-medium text-gray-700">高階升級條件 (貓池購買數量)</label>
                        <input
                            type="number"
                            name="highTierThreshold"
                            id="highTierThreshold"
                            value={settings.highTierThreshold || ''}
                            onChange={handleChange}
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="例如：100"
                            step="1"
                        />
                    </div>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-gray-800">匯率設定</h2>
                    <div className="mt-4">
                        <label htmlFor="buyInRate" className="block text-sm font-medium text-gray-700">買進匯率</label>
                        <input
                            type="number"
                            name="buyInRate"
                            id="buyInRate"
                            value={settings.buyInRate || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="例如：7.5"
                            step="0.01"
                        />
                    </div>
                     <div className="mt-4">
                        <label htmlFor="sellOutRate" className="block text-sm font-medium text-gray-700">賣出匯率</label>
                        <input
                            type="number"
                            name="sellOutRate"
                            id="sellOutRate"
                            value={settings.sellOutRate || ''}
                            onChange={handleChange}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="例如：7.0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="pt-2 border-t">
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

export default SettingsPage;

