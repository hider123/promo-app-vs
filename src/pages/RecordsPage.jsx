import React from 'react';
// [修正] 引入新的 UserContext Hook
import { useUserContext } from '../context/UserContext.jsx';

const RecordsPage = () => {
    // [修正] 從 UserContext 取得 records 資料
    const { records } = useUserContext();

    // 根據平台名稱回傳對應的 Font Awesome 圖示 class
    const getPlatformIcon = (platform) => {
        if (!platform) return 'fas fa-globe text-gray-500';
        if (platform.includes('Facebook')) return 'fab fa-facebook text-blue-600';
        if (platform.includes('Instagram')) return 'fab fa-instagram text-pink-500';
        if (platform.includes('Twitter')) return 'fab fa-x-twitter text-gray-800';
        if (platform.includes('TikTok')) return 'fab fa-tiktok text-black';
        if (platform.includes('YouTube')) return 'fab fa-youtube text-red-600';
        return 'fas fa-globe text-gray-500';
    };
    
    // 過濾出佣金類型的紀錄
    const promotionRecords = (records || []).filter(r => r.type === 'commission');

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold text-gray-800">推播紀錄</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">最近的活動</h2>
                {promotionRecords.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {promotionRecords.map(record => (
                            <li key={record.id} className="py-4">
                                <div className="flex items-start justify-between space-x-4">
                                    <div className="flex items-start space-x-4 min-w-0">
                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${record.status === '成功' ? 'bg-green-100' : 'bg-red-100'}`}>
                                            <i className={`fas ${record.status === '成功' ? 'fa-check text-green-600' : 'fa-times text-red-600'}`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-800 truncate">
                                                <span className="font-semibold text-indigo-600">{record.platformDetails?.account}</span> 將 <span className="font-semibold text-indigo-600">{record.platformDetails?.product}</span> 推播至 <span className="font-semibold text-indigo-600">{record.platformDetails?.targetPlatform}</span>
                                            </p>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <i className={`${getPlatformIcon(record.platformDetails?.platform)} mr-2`}></i>
                                                <span>{record.platformDetails?.platform}</span>
                                                <span className="mx-2">•</span>
                                                <span>{record.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className={`text-sm font-semibold ${record.status === '成功' ? 'text-green-600' : 'text-red-600'}`}>{record.status}</span>
                                        <div className="text-sm text-gray-700 mt-1">
                                            <span className="font-medium">獎勵佣金: </span>
                                            <span className={`font-bold ml-1 ${record.status === '成功' ? 'text-green-700' : 'text-gray-500'}`}>{`US$${(record.amount || 0).toFixed(2)}`}</span>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-8">
                        <i className="fas fa-file-alt fa-3x text-gray-300"></i>
                        <p className="mt-4 text-gray-500">目前沒有任何推播紀錄。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordsPage;

