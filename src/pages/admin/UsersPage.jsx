import React, { useMemo, useCallback } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

const UsersPage = () => {
    const { allTeamMembers, allPoolAccounts, allUserRecords, appSettings, handleToggleUserStatus, allAuthUsers } = useAdminContext();

    const getUserLevel = useCallback((purchaseCount) => {
        const highTier = appSettings?.highTierThreshold ?? 100;
        const midTier = appSettings?.midTierThreshold ?? 20;

        if (purchaseCount >= highTier) return '品牌大使(高阶)';
        if (purchaseCount >= midTier) return '行销达人(中阶)';
        return '推广新星(初阶)';
    }, [appSettings]);

    const userStats = useMemo(() => {
        if (!allTeamMembers || allTeamMembers.length === 0 || !allAuthUsers || allAuthUsers.length === 0) return [];
        
        const authUserMap = new Map();
        allAuthUsers.forEach(u => authUserMap.set(u.uid, u.email));

        const visibleMembers = allTeamMembers; // 预设显示所有成员，透过 UI 标示隐藏状态

        const stats = {};
        const memberMap = new Map();

        visibleMembers.forEach(member => {
            if (member.userId) {
                stats[member.userId] = {
                    ...member,
                    email: authUserMap.get(member.userId) || '未知 Email',
                    poolAccountCount: 0,
                    commissionTotal: 0,
                };
                memberMap.set(member.userId, authUserMap.get(member.userId) || member.name);
            }
        });
        
        (allPoolAccounts || []).forEach(account => {
            if (stats[account.userId]) {
                stats[account.userId].poolAccountCount += 1;
            }
        });
        
        (allUserRecords || []).forEach(record => {
            if (stats[record.userId]) {
                stats[record.userId].commissionTotal += (record.amount || 0);
            }
        });

        return Object.values(stats).map(user => ({
            ...user,
            tier: getUserLevel(user.poolAccountCount),
            referrerName: user.referrerId ? memberMap.get(user.referrerId) || '未知' : '无',
        }));
    }, [allTeamMembers, allPoolAccounts, allUserRecords, getUserLevel, allAuthUsers]);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">用户管理</h1>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">用户</th>
                            <th scope="col" className="px-6 py-3">阶级</th>
                            <th scope="col" className="px-6 py-3">推荐人</th>
                            <th scope="col" className="px-6 py-3">总佣金</th>
                            <th scope="col" className="px-6 py-3">状态</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userStats.length > 0 ? userStats.map(user => {
                            const isFrozen = user.accountStatus === 'frozen';
                            const isVisible = user.isVisible !== false;

                            return (
                                <tr key={user.id} className={`bg-white border-b hover:bg-gray-50 ${!isVisible ? 'bg-gray-100 opacity-60' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        {/* [核心修改] 移除 img 图示 */}
                                        <div>
                                            <p className={`${isFrozen ? 'text-gray-400 line-through' : ''}`}>{user.email}</p>
                                            <p className="text-xs text-gray-500">{user.userId}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.tier}</td>
                                    <td className="px-6 py-4">{user.referrerName}</td>
                                    <td className="px-6 py-4">US$ {user.commissionTotal.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {isFrozen && (
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                    已冻结
                                                </span>
                                            )}
                                            {!isVisible && (
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">
                                                    已隐藏
                                                </span>
                                            )}
                                            {!isFrozen && isVisible && (
                                                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    正常
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button 
                                            onClick={() => handleToggleUserStatus(user.id, user.userId, 'toggleFreeze')}
                                            className={`font-medium ${isFrozen ? 'text-green-600 hover:underline' : 'text-yellow-600 hover:underline'}`}
                                        >
                                            {isFrozen ? '解冻' : '冻结'}
                                        </button>
                                        <button 
                                            onClick={() => handleToggleUserStatus(user.id, user.userId, 'toggleVisibility')}
                                            className={`font-medium ${isVisible ? 'text-gray-500 hover:underline' : 'text-blue-600 hover:underline'}`}
                                        >
                                            {isVisible ? '隐藏' : '显示'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan="6" className="text-center py-10 text-gray-500">
                                    <p>目前没有使用者资料可显示。</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;