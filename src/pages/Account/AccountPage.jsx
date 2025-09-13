import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import RechargeModal from '../../components/RechargeModal.jsx'; // 引入儲值彈出視窗

const AccountPage = ({ onNavigate }) => {
    // 1. 從 Context 取得全域狀態和函式
    const { records, userId, handleSignOut, handleRecharge } = useData();

    // 2. 管理此頁面自身的 UI 狀態
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    // 3. 計算衍生資料
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalCommissionEarned = (records || [])
        .filter(r => r.type === 'commission' && r.amount > 0)
        .reduce((sum, r) => sum + r.amount, 0);
    const pendingCommission = 150.00; // 假設待處理佣金為固定值
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    const getUserLevel = (commission) => {
        // ... getUserLevel 的邏輯 ...
    };
    const userLevel = getUserLevel(totalCommissionEarned);

    const formatUserId = (id) => {
        // ... formatUserId 的邏輯 ...
    };
    const formattedUserId = formatUserId(userId);
    
    // 4. 定義事件處理函式
    const handleConfirmRecharge = (amount) => {
        handleRecharge(amount);
        setIsRechargeModalOpen(false);
    };

    // 5. 回傳 JSX
    return (
        <>
            <div className="space-y-6 p-4">
                <h1 className="text-3xl font-bold text-gray-800">我的帳號</h1>
                
                {/* 個人資料區塊 */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    {/* ... 個人資料的 JSX ... */}
                </div>

                {/* [修正] 我的交易區塊現在直接顯示餘額和按鈕 */}
                <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">我的交易</h2>
                        <button onClick={() => onNavigate('transactions')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                            查看詳細紀錄 <i className="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
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

                {/* 已連結的社群帳號區塊 */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    {/* ... 社群帳號的 JSX ... */}
                </div>

                {/* 登出按鈕 */}
                <div className="pt-2">
                    <button 
                        onClick={handleSignOut} 
                        className="w-full py-3 rounded-lg font-semibold transition-colors bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300">
                        登出帳號
                    </button>
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

export default AccountPage;

