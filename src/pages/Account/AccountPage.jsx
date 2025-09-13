import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import RechargeModal from '../../components/RechargeModal.jsx';

const AccountPage = ({ onNavigate }) => {
    // 1. 從 Context 取得全域狀態和函式
    const { records, userId, handleSignOut, handleRecharge, showAlert } = useData();

    // 2. 管理此頁面自身的 UI 狀態
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);

    // 3. 計算衍生資料 (Derived Data)
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalCommissionEarned = (records || []).filter(r => r.type === 'commission' && r.amount > 0).reduce((sum, r) => sum + r.amount, 0);
    const pendingCommission = 150.00;
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    // 4. 定義輔助函式 (Helper Functions)
    const getUserLevel = (commission) => {
        if (commission >= 50000) return { name: '首席顧問', color: 'bg-indigo-100 text-indigo-800' };
        if (commission >= 10000) return { name: '資深總監', color: 'bg-purple-100 text-purple-800' };
        if (commission >= 2000) return { name: '推廣經理', color: 'bg-sky-100 text-sky-800' };
        return { name: '行銷專員', color: 'bg-teal-100 text-teal-800' };
    };
    const userLevel = getUserLevel(totalCommissionEarned);

    const formatUserId = (id) => {
        if (!id || id.length < 8) return id || 'N/A';
        const firstLetter = String.fromCharCode(65 + (parseInt(id.substring(0, 2), 16) % 26));
        const secondLetter = String.fromCharCode(65 + (parseInt(id.substring(2, 4), 16) % 26));
        const lastSixDigits = id.slice(-6);
        return `${firstLetter}${secondLetter}${lastSixDigits}`;
    };
    const formattedUserId = formatUserId(userId);
    
    // 5. 定義事件處理函式 (Event Handlers)
    const handleConfirmRecharge = (amount) => {
        handleRecharge(amount);
        setIsRechargeModalOpen(false);
    };

    const handleLinkAccount = (platform) => {
        showAlert(`🎉 ${platform} 帳號連結成功！`);
    };

    // 6. 回傳 JSX 結構來渲染 UI
    return (
        <>
            <div className="space-y-8 p-4">
                <h1 className="text-5xl font-bold text-gray-900">我的帳號</h1>
                
                {/* 個人資料區塊 */}
                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5">個人資料</h2>
                    <div className="flex items-center space-x-5">
                        <img className="h-20 w-20 rounded-full object-cover" src="https://placehold.co/100x100/e2e8f0/475569?text=頭像" alt="使用者頭像" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-x-3 mb-1.5">
                                <p className="font-bold text-2xl text-gray-900">PromoMaster</p>
                                <span className={`${userLevel.color} text-sm font-semibold px-3 py-1 rounded-full`}>{userLevel.name}</span>
                            </div>
                            <p className="text-lg text-gray-600 truncate">UserID: {userId ? formattedUserId : '正在登入...'}</p>
                        </div>
                        <button onClick={() => onNavigate('editProfile')} className="text-lg font-bold text-indigo-600 hover:text-indigo-800 flex-shrink-0">編輯</button>
                    </div>
                </div>

                {/* 我的交易區塊 */}
                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-bold text-gray-800">我的交易</h2>
                        <button onClick={() => onNavigate('transactions')} className="text-lg font-bold text-indigo-600 hover:text-indigo-800">
                            查看詳細紀錄 <i className="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <p className="text-lg font-semibold text-gray-500">目前總餘額</p>
                    <p className="text-6xl font-extrabold text-indigo-600 my-2 tracking-tight">NT$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex justify-center items-center text-lg text-gray-600 divide-x divide-gray-400">
                        <div className="px-5">可提領: <span className="font-bold">NT$ {withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="px-5">待處理: <span className="font-bold">NT$ {pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                        <button className="w-full max-w-xs py-3 rounded-lg font-bold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 text-xl">
                            申請提領
                        </button>
                        <button 
                            onClick={() => setIsRechargeModalOpen(true)}
                            className="w-full max-w-xs py-3 rounded-lg font-bold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-xl">
                            儲值
                        </button>
                    </div>
                </div>

                {/* 已連結的社群帳號區塊 */}
                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">已連結的社群帳號</h2>
                     <ul className="divide-y divide-gray-200">
                        <li className="flex items-center justify-between py-4">
                            <div className="flex items-center">
                                <i className="fab fa-facebook text-3xl text-blue-600 mr-5 w-8 text-center"></i>
                                <span className="font-bold text-gray-800 text-lg">Facebook</span>
                            </div>
                            <button className="text-lg font-bold text-red-600 hover:text-red-800">取消連結</button>
                        </li>
                        <li className="flex items-center justify-between py-4">
                            <div className="flex items-center">
                                <i className="fab fa-twitter text-3xl text-gray-800 mr-5 w-8 text-center"></i>
                                <span className="font-bold text-gray-800 text-lg">X (Twitter)</span>
                            </div>
                             <button className="text-lg font-bold text-red-600 hover:text-red-800">取消連結</button>
                        </li>
                         <li className="flex items-center justify-between py-4">
                            <div className="flex items-center">
                               <i className="fab fa-instagram text-3xl text-pink-500 mr-5 w-8 text-center"></i>
                               <span className="font-bold text-gray-800 text-lg">Instagram</span>
                            </div>
                            <button onClick={() => handleLinkAccount('Instagram')} className="text-lg font-bold text-indigo-600 hover:text-indigo-800">連結帳號</button>
                        </li>
                    </ul>
                </div>

                {/* 登出按鈕 */}
                <div className="pt-2">
                    <button 
                        onClick={handleSignOut} 
                        className="w-full py-4 rounded-lg font-bold transition-colors bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 text-xl">
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

