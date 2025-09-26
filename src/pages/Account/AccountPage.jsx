import React, { useState, useMemo, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';
import RechargeModal from '../../components/RechargeModal.jsx';
import WithdrawModal from '../../components/WithdrawModal.jsx';

const AccountPage = ({ onNavigate, setRechargeAmount }) => {
    const { handleSignOut, user, userId, showAlert } = useAuthContext();
    const { records, appSettings, handleWithdrawRequest, paymentInfo, teamMembers } = useUserContext();
    
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    
    const [linkedAccounts, setLinkedAccounts] = useState({
        facebook: true,
        twitter: true,
        instagram: false,
        tiktok: false,
    });

    const { referrerName, referrerId } = useMemo(() => {
        if (!teamMembers || !userId) {
            return { referrerName: '读取中...', referrerId: null };
        }
        const currentUserProfile = teamMembers.find(member => member.userId === userId);
        if (!currentUserProfile || !currentUserProfile.referrerId) {
            return { referrerName: '无', referrerId: null };
        }
        const referrerProfile = teamMembers.find(member => member.userId === currentUserProfile.referrerId);
        return {
            referrerName: referrerProfile ? referrerProfile.name : '未知用户',
            referrerId: currentUserProfile.referrerId
        };
    }, [teamMembers, userId]);

    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const catPoolPurchaseCount = useMemo(() => 
        (records || []).filter(r => r.type === 'expense' && r.description.startsWith('费用: 购买猫池帐号')).length,
    [records]);
    const pendingCommission = 5.00;
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    const getUserLevel = (purchaseCount) => {
        const highTier = appSettings?.highTierThreshold ?? 100;
        const midTier = appSettings?.midTierThreshold ?? 20;

        if (purchaseCount >= highTier) return { name: '品牌大使(高阶)', color: 'bg-indigo-100 text-indigo-800' };
        if (purchaseCount >= midTier) return { name: '行销达人(中阶)', color: 'bg-purple-100 text-purple-800' };
        return { name: '推广新星(初阶)', color: 'bg-sky-100 text-sky-800' };
    };
    const userLevel = getUserLevel(catPoolPurchaseCount);
    
    const handleConfirmRecharge = (amount) => {
        setIsRechargeModalOpen(false);
        setRechargeAmount(amount);
        onNavigate('paymentChannels');
    };
    
    const handleConfirmWithdraw = async (data) => {
        await handleWithdrawRequest(data);
        setIsWithdrawModalOpen(false);
    };
    
    const handleToggleLink = (platform, platformName) => {
        const isCurrentlyLinked = linkedAccounts[platform];
        console.log(`正在 ${isCurrentlyLinked ? '取消连结' : '连结'} ${platformName}...`);
        setLinkedAccounts(prev => ({ ...prev, [platform]: !isCurrentlyLinked }));
        showAlert(`🎉 ${platformName} 帐号${isCurrentlyLinked ? '已取消连结' : '连结成功'}！`);
    };

    const socialPlatforms = [
        { key: 'facebook', name: 'Facebook', icon: 'fab fa-facebook text-3xl text-blue-600 mr-5 w-8 text-center' },
        { key: 'twitter', name: 'X (Twitter)', icon: 'fab fa-twitter text-3xl text-gray-800 mr-5 w-8 text-center' },
        { key: 'instagram', name: 'Instagram', icon: 'fab fa-instagram text-3xl text-pink-500 mr-5 w-8 text-center' },
        { key: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok text-3xl text-black mr-5 w-8 text-center' }
    ];

    return (
        <>
            <div className="space-y-8 p-4">
                <h1 className="text-5xl font-bold text-gray-900">我的帐户</h1>
                
                <div className="bg-white p-5 rounded-xl shadow-sm relative">
                    <h2 className="text-2xl font-bold text-gray-800 mb-5">个人资料</h2>
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-2xl text-gray-900 truncate" title={user?.email}>{user?.email || '载入中...'}</p>
                            <p className="text-sm text-gray-500 mt-1 truncate" title={userId}>UID: {userId || '...'}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                推荐人: <span className="font-semibold text-gray-700" title={`UID: ${referrerId || ''}`}>{referrerName}</span>
                            </p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                             <span className={`${userLevel.color} text-sm font-semibold px-3 py-1 rounded-full`}>{userLevel.name}</span>
                        </div>
                    </div>
                    <button onClick={() => onNavigate('editProfile')} className="absolute top-5 right-5 text-lg font-bold text-indigo-600 hover:text-indigo-800 flex-shrink-0">编辑</button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm text-center">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-2xl font-bold text-gray-800">我的交易</h2>
                        <button onClick={() => onNavigate('transactions')} className="text-lg font-bold text-indigo-600 hover:text-indigo-800">
                            查看详细记录 <i className="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                    <p className="text-lg font-semibold text-gray-500">目前总馀额</p>
                    <p className="text-6xl font-extrabold text-indigo-600 my-2 tracking-tight">US$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="flex justify-center items-center text-lg text-gray-600 divide-x divide-gray-400">
                        <div className="px-5">可提领: <span className="font-bold">US$ {withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="px-5">待处理: <span className="font-bold">US$ {pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8">
                        <button 
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="w-full max-w-xs py-3 rounded-lg font-bold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={withdrawableBalance <= 0}
                        >
                            申请提领
                        </button>
                        <button onClick={() => setIsRechargeModalOpen(true)} className="w-full max-w-xs py-3 rounded-lg font-bold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-xl">储值</button>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">收款方式设定</h2>
                            <p className="text-gray-500 mt-1">管理您的提领帐户，确保资金能准确到帐。</p>
                        </div>
                        <button onClick={() => onNavigate('withdrawalSettings')} className="text-lg font-bold text-indigo-600 hover:text-indigo-800 flex-shrink-0">
                            前往设定 <i className="fas fa-arrow-right ml-1"></i>
                        </button>
                    </div>
                </div>
                
                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">已连结的社群帐号</h2>
                     <ul className="divide-y divide-gray-200">
                        {socialPlatforms.map(platform => (
                            <li key={platform.key} className="flex items-center justify-between py-4">
                                <div className="flex items-center">
                                    <i className={`${platform.icon}`}></i>
                                    <span className="font-bold text-gray-800 text-lg">{platform.name}</span>
                                </div>
                                {linkedAccounts[platform.key] ? (
                                    <button 
                                        onClick={() => handleToggleLink(platform.key, platform.name)}
                                        className="text-lg font-bold text-red-600 hover:text-red-800">
                                        取消连结
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleToggleLink(platform.key, platform.name)}
                                        className="text-lg font-bold text-indigo-600 hover:text-indigo-800">
                                        连结帐号
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
                        登出帐号
                    </button>
                </div>
            </div>

            {/* [核心修改] 将 appSettings 传递给 RechargeModal */}
            <RechargeModal
                isOpen={isRechargeModalOpen}
                onClose={() => setIsRechargeModalOpen(false)}
                onConfirm={handleConfirmRecharge}
                appSettings={appSettings}
            />
            
            <WithdrawModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onConfirm={handleConfirmWithdraw}
                withdrawableBalance={withdrawableBalance}
                appSettings={appSettings}
                paymentInfo={paymentInfo} 
            />
        </>
    );
};

export default AccountPage;