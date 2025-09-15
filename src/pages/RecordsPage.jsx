import React, { useState, useMemo, useEffect } from 'react';
import { useUserContext } from '../context/UserContext.jsx';

const RecordsPage = () => {
    // 1. 從 Context 取得資料
    const { records } = useUserContext();
    
    // 2. 新增 state 來管理當前的篩選條件和頁碼
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // 3. 定義篩選標籤
    const filters = [
        { id: 'all', label: '全部' },
        { id: 'today', label: '今天' },
        { id: 'yesterday', label: '昨天' },
        { id: 'threeDays', label: '三天內' },
    ];

    const getPlatformIcon = (platform) => {
        if (!platform) return 'fas fa-globe text-gray-500';
        if (platform.includes('Facebook')) return 'fab fa-facebook text-blue-600';
        if (platform.includes('Instagram')) return 'fab fa-instagram text-pink-500';
        if (platform.includes('Twitter')) return 'fab fa-x-twitter text-gray-800';
        if (platform.includes('TikTok')) return 'fab fa-tiktok text-black';
        if (platform.includes('YouTube')) return 'fab fa-youtube text-red-600';
        return 'fas fa-globe text-gray-500';
    };
    
    const getDateCategory = (dateString) => {
        if (!dateString) return '未知日期';
        const recordDate = new Date(dateString.replace(' ', 'T'));
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        recordDate.setHours(0, 0, 0, 0);
        
        if (recordDate.getTime() === today.getTime()) {
            return '今日';
        }
        if (recordDate.getTime() === yesterday.getTime()) {
            return '昨日';
        }
        return recordDate.toLocaleDateString('zh-TW');
    };

    // 4. 使用 useMemo 將篩選、排序、分頁和分組的邏輯包起來
    const { groupedRecords, pageCount } = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);

        const promotionRecords = (records || []).filter(r => r.type === 'commission');

        const filtered = promotionRecords.filter(record => {
            if (activeFilter === 'all') return true;
            
            const recordDate = new Date(record.date.replace(' ', 'T'));
            recordDate.setHours(0,0,0,0);

            switch(activeFilter) {
                case 'today':
                    return recordDate.getTime() === today.getTime();
                case 'yesterday':
                    return recordDate.getTime() === yesterday.getTime();
                case 'threeDays':
                    return recordDate >= threeDaysAgo && recordDate <= today;
                default:
                    return true;
            }
        });
        
        const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 計算總頁數
        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);

        // 取得當前頁面的資料
        const paginatedItems = sorted.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );

        const grouped = paginatedItems.reduce((acc, record) => {
            const category = getDateCategory(record.date);
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(record);
            return acc;
        }, {});
        
        return { groupedRecords: grouped, pageCount: totalPages };
    }, [records, activeFilter, currentPage]);

    // 監聽篩選條件變化，如果改變則重設為第一頁
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold text-gray-800">推播紀錄</h1>
            
            <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">最近的活動</h2>
                
                <div className="p-4 flex flex-wrap gap-2 border-b">
                    {filters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`py-1 px-3 rounded-full text-sm font-semibold transition-colors ${activeFilter === filter.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {Object.keys(groupedRecords).length > 0 ? (
                    <>
                        {Object.keys(groupedRecords).map(dateGroup => (
                            <div key={dateGroup}>
                                <h3 className="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-600 sticky top-0">{dateGroup}</h3>
                                <ul className="divide-y divide-gray-200">
                                    {groupedRecords[dateGroup].map(record => (
                                        <li key={record.id} className="p-4">
                                            <div className="flex items-start justify-between space-x-4">
                                                <div className="flex items-start space-x-4 min-w-0">
                                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${record.status === '成功' ? 'bg-green-100' : 'bg-red-100'}`}>
                                                        <i className={`fas ${record.status === '成功' ? 'fa-check text-green-600' : 'fa-times text-red-600'}`}></i>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-gray-800">
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
                            </div>
                        ))}
                        {/* 5. 新增分頁控制項 */}
                        {pageCount > 1 && (
                            <div className="flex justify-center items-center gap-4 p-4 border-t">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="py-1 px-3 rounded-md font-semibold text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    上一頁
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    第 {currentPage} / {pageCount} 頁
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
                                    disabled={currentPage === pageCount}
                                    className="py-1 px-3 rounded-md font-semibold text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    下一頁
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <i className="fas fa-inbox fa-2x"></i>
                        <p className="mt-2">在此篩選條件下沒有任何記錄。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecordsPage;

