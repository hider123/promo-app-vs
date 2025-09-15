import React, { useState, useMemo, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext.jsx';
import RechargeModal from '../../components/RechargeModal.jsx';

const TransactionsPage = ({ onBack }) => {
    // 1. 從 Context 取得資料和函式
    const { records, handleRecharge } = useUserContext();
    
    // 2. 管理此頁面的 UI 狀態
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // 3. 計算衍生資料
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const pendingCommission = 5.00; 
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    // 定義篩選標籤
    const filters = [
        { id: 'all', label: '全部' },
        { id: 'today', label: '今天' },
        { id: 'yesterday', label: '昨天' },
        { id: 'threeDays', label: '三天內' },
    ];

    // 增加一個函式來為日期分組
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

    // 使用 useMemo 將篩選、排序、分頁和分組的邏輯包起來
    const { groupedRecords, pageCount } = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 2);

        const filtered = (records || []).filter(record => {
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
        
        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
        const paginatedItems = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter]);

    // 4. 定義事件處理函式
    const handleConfirmRecharge = (amount) => {
        handleRecharge(amount);
        setIsRechargeModalOpen(false);
    };

    // 5. 回傳 JSX 結構
    return (
        <>
            <div className="p-4 space-y-6">
                <div className="relative flex items-center justify-center">
                    <button onClick={onBack} className="absolute left-0 text-indigo-600 hover:text-indigo-800" aria-label="返回上一頁">
                        <i className="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">我的交易</h1>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-sm font-medium text-gray-500">目前總餘額</p>
                    <p className="text-4xl font-bold text-indigo-600 my-2">US$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex justify-center items-center text-sm text-gray-600 divide-x divide-gray-300">
                        <div className="px-4">可提領: <span className="font-semibold">US$ {withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="px-4">待處理: <span className="font-semibold">US$ {pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
                        <button className="w-full max-w-xs py-3 rounded-lg font-semibold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                            申請提領
                        </button>
                        <button 
                            onClick={() => setIsRechargeModalOpen(true)}
                            className="w-full max-w-xs py-3 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300">
                            儲值
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                     <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">交易記錄</h2>
                     
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
                                        {groupedRecords[dateGroup].map((record) => {
                                            const isExpense = record.amount < 0;
                                            return (
                                                <li key={record.id} className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center min-w-0">
                                                        <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${record.type === 'deposit' ? 'bg-blue-100' : (isExpense ? 'bg-red-100' : 'bg-green-100')}`}>
                                                            {record.type === 'deposit' ? <i className="fas fa-wallet text-blue-600"></i> : (isExpense ? <i className="fas fa-arrow-down text-red-600"></i> : <i className="fas fa-dollar-sign text-green-600"></i>)}
                                                        </div>
                                                        <div className="ml-4 flex-1 min-w-0">
                                                            <p className="font-medium text-gray-800 truncate">{record.description}</p>
                                                            <p className="text-sm text-gray-500">{record.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`font-semibold ${record.type === 'deposit' ? 'text-blue-600' : (isExpense ? 'text-red-600' : 'text-green-600')}`}>
                                                        {`${record.amount > 0 ? '+' : ''} US$${Math.abs(record.amount || 0).toFixed(2)}`}
                                                    </div>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </div>
                            ))}
                             {pageCount > 1 && (
                                <div className="flex justify-center items-center gap-4 p-4 border-t">
                                    <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="py-1 px-3 rounded-md font-semibold text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50">上一頁</button>
                                    <span className="text-sm font-medium text-gray-600">第 {currentPage} / {pageCount} 頁</span>
                                    <button onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))} disabled={currentPage === pageCount} className="py-1 px-3 rounded-md font-semibold text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50">下一頁</button>
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

            <RechargeModal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                onConfirm={handleConfirmRecharge}
            />
        </>
    );
};

export default TransactionsPage;

