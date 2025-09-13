import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext.jsx';
import RechargeModal from '../../components/RechargeModal.jsx'; // 引入儲值彈出視窗元件

const TransactionsPage = ({ onBack }) => {
    // 1. 從 Context 取得全域狀態和函式
    const { records, handleRecharge } = useData();
    
    // 2. 管理此頁面自身的 UI 狀態
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    // 3. 計算衍生資料 (Derived Data)
    // 使用 useMemo 進行排序，只有在 records 改變時才會重新計算，以優化效能
    const sortedRecords = useMemo(() => {
        // 建立一個 records 陣列的副本來排序，避免直接修改原始資料
        return [...(records || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [records]);
    
    // 計算總餘額、待處理佣金和可提領餘額
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const pendingCommission = 150.00; // 假設待處理佣金為固定值
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    // 4. 定義事件處理函式 (Event Handlers)
    const handleConfirmRecharge = (amount) => {
        handleRecharge(amount); // 呼叫來自 Context 的儲值函式
        setIsRechargeModalOpen(false); // 關閉彈出視窗
    };

    // 5. 回傳 JSX 結構來渲染 UI
    return (
        <>
            <div className="p-4 space-y-6">
                {/* 頁面標頭 */}
                <div className="relative flex items-center justify-center">
                    <button onClick={onBack} className="absolute left-0 text-indigo-600 hover:text-indigo-800" aria-label="返回上一頁">
                        <i className="fas fa-arrow-left fa-lg"></i>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">我的交易</h1>
                </div>
                
                {/* 餘額總覽與操作按鈕 */}
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <p className="text-sm font-medium text-gray-500">目前總餘額</p>
                    <p className="text-4xl font-bold text-indigo-600 my-2">NT$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex justify-center items-center text-sm text-gray-600 divide-x divide-gray-300">
                        <div className="px-4">可提領: <span className="font-semibold">NT$ {withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="px-4">待處理: <span className="font-semibold">NT$ {pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
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

                {/* 交易紀錄列表 */}
                <div className="bg-white rounded-lg shadow-sm">
                     <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">交易紀錄</h2>
                     <ul className="divide-y divide-gray-200">
                        {sortedRecords.map((record) => {
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
                                        {`${record.amount > 0 ? '+' : ''} NT$${Math.abs(record.amount || 0).toFixed(2)}`}
                                    </div>
                                </li>
                            )
                        })}
                     </ul>
                </div>
            </div>

            {/* 渲染儲值彈出視窗 */}
            <RechargeModal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                onConfirm={handleConfirmRecharge}
            />
        </>
    );
};

export default TransactionsPage;

