import React, { useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

const UsersPage = () => {
    // 1. 從 AdminContext 取得所有用戶的資料
    const { allUsers } = useAdminContext();

    // 2. 計算每位用戶的統計數據
    const userStats = useMemo(() => {
        if (!allUsers || allUsers.length === 0) {
            return [];
        }

        const userMap = new Map(allUsers.map(u => [u.id, { ...u, referrerName: 'N/A' }]));

        // 建立推薦人名稱映射
        allUsers.forEach(user => {
            if (user.referrerId) {
                const referrer = userMap.get(user.referrerId);
                if (referrer) {
                    const currentUser = userMap.get(user.id);
                    currentUser.referrerName = referrer.name;
                }
            }
        });

        return Array.from(userMap.values());
    }, [allUsers]);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">用戶管理</h1>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">用戶</th>
                            <th scope="col" className="px-6 py-3">Email</th>
                            <th scope="col" className="px-6 py-3">註冊時間</th>
                            <th scope="col" className="px-6 py-3">推薦人</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userStats.map(user => (
                            <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-10 h-10 rounded-full mr-4" />
                                        <div>
                                            <p>{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '未知'}</td>
                                <td className="px-6 py-4">{user.referrerName}</td>
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

