import React, { useMemo, useCallback } from 'react';
// [修正] 引入新的 UserContext Hook
import { useUserContext } from '../context/UserContext.jsx';

// [修正] onManageClick 和 pushedToday 的邏輯已移入此元件，不再需要透過 props 傳遞
const CatPoolPage = ({ onAddAccountClick }) => {
    // 1. 從 UserContext 取得所需的資料和函式
    const { poolAccounts, records, showAlert } = useUserContext();

    // 2. 計算衍生資料 (Derived Data)
    // 計算今天已推播過的帳號
    const pushedToday = useMemo(() => {
        if (!records) return new Set();
        const todayStr = new Date().toLocaleDateString('sv-SE');
        return new Set(records
            .filter(r => r.type === 'commission' && r.date?.startsWith(todayStr))
            .map(r => r.platformDetails?.account));
    }, [records]);
    
    // 將帳號由新到舊排序
    const sortedAccounts = useMemo(() => 
        [...(poolAccounts || [])].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
            return new Date(dateB) - new Date(dateA);
        }), 
    [poolAccounts]);

    // 3. 定義事件處理函式
    const onManageClick = useCallback((account) => {
        const date = account.createdAt?.toDate ? account.createdAt.toDate() : account.createdAt;
        if (date) {
            const formattedDate = new Date(date).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
            showAlert(`帳號 "${account.name}"\n創建於：\n${formattedDate}`);
        } else {
            showAlert(`帳號 "${account.name}" 的創建日期不明。`);
        }
    }, [showAlert]);

    // 4. 定義輔助函式
    const getPlatformIcon = (platform) => { /* ... */ };
    const getPlatformBgColor = (platform) => { /* ... */ };

    // 5. 回傳 JSX 結構
    return (
        <div className="relative h-full">
            <div className="space-y-4 p-4">
                <h1 className="text-3xl font-bold text-gray-800">貓池</h1>
                <p className="text-gray-600">管理您不同帳號的內容池，快速選用素材與文案。</p>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {sortedAccounts.map(account => {
                            const hasPushedToday = pushedToday.has(account.name);
                            return (
                                <li key={account.id} className={`p-4 flex items-center justify-between transition-colors ${hasPushedToday ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center min-w-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getPlatformBgColor(account.platform)}`}>
                                            <i className={`${getPlatformIcon(account.platform)} text-2xl`}></i>
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
                                        onClick={() => onManageClick(account)}
                                        className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex-shrink-0 ml-4">
                                        <i className="fas fa-tasks mr-2"></i>管理
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

