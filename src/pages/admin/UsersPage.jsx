import React, { useMemo, useCallback } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

const UsersPage = () => {
    // 1. 從 AdminContext 取得所有用戶的資料
    const { allTeamMembers, allPoolAccounts, allUserRecords, appSettings } = useAdminContext();

    // 2. 定義輔助函式
    const getUserLevel = useCallback((purchaseCount) => {
        const highTier = appSettings?.highTierThreshold ?? 100;
        const midTier = appSettings?.midTierThreshold ?? 20;

        if (purchaseCount >= highTier) return '品牌大使(高階)';
        if (purchaseCount >= midTier) return '行銷達人(中階)';
        return '推廣新星(初階)';
    }, [appSettings]);

    // 3. 計算每位用戶的統計數據
    const userStats = useMemo(() => {
        const stats = {};
        const memberMap = new Map();

        // [核心修正] 初始化時，處理所有成員，不再依賴 userId
        (allTeamMembers || []).forEach(member => {
            // 使用 Firestore document ID 作為唯一的 key
            stats[member.id] = {
                ...member,
                poolAccountCount: 0,
                pushCount: 0,
                commissionTotal: 0,
            };
            // 如果有 userId，才將其加入到 map 中，用於後續的推薦人名稱查找
            if (member.userId) {
                memberMap.set(member.userId, member.name);
            }
        });
        
        (allPoolAccounts || []).forEach(account => {
            const userId = account.userId;
            // 找到對應的 user stats 物件（可能有多個 team member 文件對應同一個 user）
            const userStatEntry = Object.values(stats).find(s => s.userId === userId);
            if (userStatEntry) {
                userStatEntry.poolAccountCount += 1;
            }
        });
        
        (allUserRecords || []).forEach(record => {
            const userId = record.userId;
            const userStatEntry = Object.values(stats).find(s => s.userId === userId);
            if (userStatEntry) {
                userStatEntry.pushCount += 1;
                userStatEntry.commissionTotal += record.amount;
            }
        });

        // 最終處理：計算階級和推薦人名稱
        return Object.values(stats).map(user => ({
            ...user,
            tier: getUserLevel(user.poolAccountCount),
            referrerName: user.referrerId ? memberMap.get(user.referrerId) || '未知' : '-',
        }));
    }, [allTeamMembers, allPoolAccounts, allUserRecords, getUserLevel]);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">用戶管理</h1>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">用戶</th>
                            <th scope="col" className="px-6 py-3">階級</th>
                            <th scope="col" className="px-6 py-3">推薦人</th>
                            <th scope="col" className="px-6 py-3">總佣金</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userStats.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                                        <div>
                                            <p>{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.userId || '尚未註冊'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{user.tier}</td>
                                <td className="px-6 py-4">{user.referrerName}</td>
                                <td className="px-6 py-4">US$ {user.commissionTotal.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <button className="font-medium text-indigo-600 hover:underline">查看詳情</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;

