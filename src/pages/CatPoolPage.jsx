import React, { useMemo, useCallback } from 'react';
import { useUserContext } from '../context/UserContext.jsx';

const CatPoolPage = ({ onAddAccountClick }) => {
    // 1. 從 UserContext 取得所需的資料和函式
    const { poolAccounts, records, showAlert } = useUserContext();

    // 2. 計算衍生資料 (Derived Data)
    const pushedToday = useMemo(() => {
        if (!records) return new Set();
        const todayStr = new Date().toLocaleDateString('sv-SE');
        return new Set(records
            .filter(r => r.type === 'commission' && r.date?.startsWith(todayStr))
            .map(r => r.platformDetails?.account));
    }, [records]);
    
    const totalAccounts = (poolAccounts || []).length;
    const pushedTodayCount = pushedToday.size;
    const notPushedTodayCount = totalAccounts - pushedTodayCount;

    const sortedAccounts = useMemo(() => 
        [...(poolAccounts || [])].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
            return new Date(dateB) - new Date(dateA);
        }), 
    [poolAccounts]);

    // 3. 定義事件處理函式
    const onDetailsClick = useCallback((account) => {
        const date = account.createdAt?.toDate ? account.createdAt.toDate() : account.createdAt;
        const formattedDate = date ? new Date(date).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) : '不明';
        const relevantRecords = (records || []).filter(r => r.platformDetails?.account === account.name);
        const successCount = relevantRecords.filter(r => r.status === '成功').length;
        const failCount = relevantRecords.length - successCount;
        const message = `帳號詳情： ${account.name}\n\n` +
                      `創建時間：\n${formattedDate}\n\n` +
                      `成功推播次數： ${successCount} 次\n` +
                      `失敗推播次數： ${failCount} 次`;
        showAlert(message);
    }, [records, showAlert]);

    // 4. 定義輔助函式
    const formatCreationDate = (createdAt) => {
        if (!createdAt) return { month: '??', day: '??' };
        let dateObj;
        if (createdAt.toDate) {
            dateObj = createdAt.toDate();
        } else {
            dateObj = new Date(createdAt);
        }
        const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = dateObj.getDate();
        return { month, day };
    };

    // 5. 回傳 JSX 結構
    return (
        <div className="relative h-full">
            <div className="space-y-4 p-4">
                <h1 className="text-3xl font-bold text-gray-800">貓池</h1>
                <p className="text-gray-600">管理您不同帳號的內容池，快速選用素材與文案。</p>

                {/* [核心修正] 將三個統計數據合併到一個橫列中 */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">總帳號數</h3>
                            <p className="mt-1 text-3xl font-semibold text-gray-900">{totalAccounts}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">今日已推播</h3>
                            <p className="mt-1 text-3xl font-semibold text-green-600">{pushedTodayCount}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">今日未推播</h3>
                            <p className="mt-1 text-3xl font-semibold text-yellow-600">{notPushedTodayCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {sortedAccounts.map(account => {
                            const hasPushedToday = pushedToday.has(account.name);
                            const { month, day } = formatCreationDate(account.createdAt);
                            return (
                                <li key={account.id} className={`p-4 flex items-center justify-between transition-colors ${hasPushedToday ? 'bg-gray-100 opacity-70' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center min-w-0">
                                        <div className="w-12 h-12 rounded-lg flex-shrink-0 flex flex-col items-center justify-center mr-4 bg-gray-100 border border-gray-200">
                                            <span className="text-xs font-bold text-indigo-600">{month}</span>
                                            <span className="text-lg font-bold text-gray-800 leading-tight">{day}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{account.name}</h3>
                                            <div className="flex items-center text-sm mt-1">
                                                <p className="text-gray-500">{account.platform}</p>
                                                {hasPushedToday && (
                                                    <span className="ml-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center">
                                                        <i className="fas fa-check-circle mr-1"></i>
                                                        今日已推播
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDetailsClick(account)}
                                        className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex-shrink-0 ml-4">
                                        <i className="fas fa-info-circle mr-2"></i>詳情
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            <button 
                onClick={onAddAccountClick}
                className="fixed bottom-20 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-30"
                aria-label="新增帳號"
            >
                <i className="fas fa-plus fa-lg"></i>
            </button>
        </div>
    );
};

export default CatPoolPage;

