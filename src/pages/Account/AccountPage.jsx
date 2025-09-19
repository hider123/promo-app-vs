import React, { useState, useMemo, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import RechargeModal from '../../components/RechargeModal.jsx';

const AccountPage = ({ onNavigate, setRechargeAmount }) => {
    // 1. 從 Context 取得所需的資料和函式
    const { handleSignOut, userId } = useAuthContext();
    const { records, showAlert, appSettings } = useUserContext();
    
    // 2. 管理此頁面自身的 UI 狀態
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    // [核心修正] 新增 state 來管理社群帳號的連結狀態
    const [linkedAccounts, setLinkedAccounts] = useState({
        facebook: true,
        twitter: true,
        instagram: false,
        tiktok: false, // 新增 TikTok 的初始狀態
    });

    // 3. 計算衍生資料 (Derived Data)
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const catPoolPurchaseCount = useMemo(() => 
        (records || []).filter(r => r.type === 'expense' && r.description.startsWith('費用: 購買貓池帳號')).length,
    [records]);
    const pendingCommission = 5.00;
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    // 4. 定義輔助函式 (Helper Functions)
    const getUserLevel = (purchaseCount) => {
        const highTier = appSettings?.highTierThreshold ?? 100;
        const midTier = appSettings?.midTierThreshold ?? 20;

        if (purchaseCount >= highTier) return { name: '品牌大使(高階)', color: 'bg-indigo-100 text-indigo-800' };
        if (purchaseCount >= midTier) return { name: '行銷達人(中階)', color: 'bg-purple-100 text-purple-800' };
        return { name: '推廣新星(初階)', color: 'bg-sky-100 text-sky-800' };
    };
    const userLevel = getUserLevel(catPoolPurchaseCount);
    
    // 5. 定義事件處理函式 (Event Handlers)
    const handleConfirmRecharge = (amount) => {
        setIsRechargeModalOpen(false);
        setRechargeAmount(amount);
        onNavigate('paymentChannels');
    };
    
    // [核心修正] 新增一個函式來處理連結/取消連結的邏輯
    const handleToggleLink = (platform, platformName) => {
        const isCurrentlyLinked = linkedAccounts[platform];
        // 在這裡可以加入呼叫後端 API 的邏輯
        console.log(`正在 ${isCurrentlyLinked ? '取消連結' : '連結'} ${platformName}...`);
        
        // 更新前端的 UI 狀態
        setLinkedAccounts(prev => ({
            ...prev,
            [platform]: !isCurrentlyLinked
        }));

        // 顯示成功提示
        showAlert(`🎉 ${platformName} 帳號${isCurrentlyLinked ? '已取消連結' : '連結成功'}！`);
    };

    const socialPlatforms = [
        { key: 'facebook', name: 'Facebook', icon: 'fab fa-facebook text-3xl text-blue-600 mr-5 w-8 text-center' },
        { key: 'twitter', name: 'X (Twitter)', icon: 'fab fa-twitter text-3xl text-gray-800 mr-5 w-8 text-center' },
        { key: 'instagram', name: 'Instagram', icon: 'fab fa-instagram text-3xl text-pink-500 mr-5 w-8 text-center' },
        // [核心修正] 新增 TikTok 到平台列表
        { key: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok text-3xl text-black mr-5 w-8 text-center' }
    ];

    // 6. 回傳 JSX 結構來渲染 UI
    return (
        <>
            <div className="space-y-8 p-4">
                <h1 className="text-5xl font-bold text-gray-900">我的帳戶</h1>
                
                <div className="bg-white p-5 rounded-xl shadow-sm relative">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5">個人資料</h2>
                    <div className="flex items-center space-x-5">
                        <img className="h-20 w-20 rounded-full object-cover" src="https://placehold.co/100x100/e2e8f0/475569?text=頭像" alt="使用者頭像" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-x-3 mb-1.5">
                                <p className="font-bold text-2xl text-gray-900">PromoMaster</p>
                                <span className={`${userLevel.color} text-sm font-semibold px-3 py-1 rounded-full`}>{userLevel.name}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => onNavigate('editProfile')} className="absolute top-5 right-5 text-lg font-bold text-indigo-600 hover:text-indigo-800 flex-shrink-0">編輯</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-bold text-gray-800">我的交易</h2>
                        <button onClick={() => onNavigate('transactions')} className="text-lg font-bold text-indigo-600 hover:text-indigo-800">
                            查看詳細記錄 <i className="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <p className="text-lg font-semibold text-gray-500">目前總餘額</p>
                    <p className="text-6xl font-extrabold text-indigo-600 my-2 tracking-tight">US$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex justify-center items-center text-lg text-gray-600 divide-x divide-gray-400">
                        <div className="px-5">可提領: <span className="font-bold">US$ {withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="px-5">待處理: <span className="font-bold">US$ {pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                        <button className="w-full max-w-xs py-3 rounded-lg font-bold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 text-xl">申請提領</button>
                        <button onClick={() => setIsRechargeModalOpen(true)} className="w-full max-w-xs py-3 rounded-lg font-bold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-xl">儲值</button>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">已連結的社群帳號</h2>
                     <ul className="divide-y divide-gray-200">
                        {socialPlatforms.map(platform => (
                            <li key={platform.key} className="flex items-center justify-between py-4">
                                <div className="flex items-center">
                                    <i className={platform.icon}></i>
                                    <span className="font-bold text-gray-800 text-lg">{platform.name}</span>
                                </div>
                                {linkedAccounts[platform.key] ? (
                                    <button 
                                        onClick={() => handleToggleLink(platform.key, platform.name)}
                                        className="text-lg font-bold text-red-600 hover:text-red-800">
                                        取消連結
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleToggleLink(platform.key, platform.name)}
                                        className="text-lg font-bold text-indigo-600 hover:text-indigo-800">
                                        連結帳號
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={handleSignOut} 
                        className="w-full py-4 rounded-lg font-bold transition-colors bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300 text-xl">
                        登出帳號
                    </button>
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

export default AccountPage;

