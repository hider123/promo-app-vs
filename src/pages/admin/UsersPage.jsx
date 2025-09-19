import React, { useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

const UsersPage = () => {
    // 1. 從 AdminContext 取得所有需要的用戶相關資料
    const { allTeamMembers, allUserRecords, allPoolAccounts } = useAdminContext();

    // 2. 使用 useMemo 來處理和聚合資料，提升效能
    const usersData = useMemo(() => {
        if (!allTeamMembers) return [];

        // 建立一個 Map 來快速查找用戶的額外資訊
        const recordsMap = new Map();
        const poolAccountsMap = new Map();

        // 計算每個用戶的餘額
        (allUserRecords || []).forEach(record => {
            const userId = record.userId;
            if (!userId) return;
            const currentBalance = recordsMap.get(userId) || 0;
            recordsMap.set(userId, currentBalance + record.amount);
        });

        // 計算每個用戶的貓池帳號數量
        (allPoolAccounts || []).forEach(account => {
            const userId = account.userId;
            if (!userId) return;
            const currentCount = poolAccountsMap.get(userId) || 0;
            poolAccountsMap.set(userId, currentCount + 1);
        });

        // 組合最終的用戶資料列表
        return allTeamMembers.map(member => ({
            ...member,
            balance: recordsMap.get(member.userId) || 0,
            poolAccountCount: poolAccountsMap.get(member.userId) || 0,
        }));

    }, [allTeamMembers, allUserRecords, allPoolAccounts]);

    // 3. 回傳 JSX 結構
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">用戶管理</h1>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">用戶帳號</th>
                                <th scope="col" className="px-6 py-3">用戶 ID</th>
                                <th scope="col" className="px-6 py-3">用戶推薦人</th>
                                <th scope="col" className="px-6 py-3">用戶郵箱</th>
                                <th scope="col" className="px-6 py-3">用戶電話號碼</th>
                                <th scope="col" className="px-6 py-3">用戶餘額</th>
                                <th scope="col" className="px-6 py-3">貓池帳號數</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersData.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{user.name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{user.userId}</td>
                                    <td className="px-6 py-4 text-gray-500 text-xs">{user.referrerId || '-'}</td>
                                    <td className="px-6 py-4">{user.email || '-'}</td>
                                    <td className="px-6 py-4">{user.phone || '-'}</td>
                                    <td className="px-6 py-4 font-semibold text-indigo-600">US$ {user.balance.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-center">{user.poolAccountCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
