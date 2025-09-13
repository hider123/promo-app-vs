import React from 'react';
import { useData } from '../../context/DataContext.jsx';

/**
 * 使用者管理的 UI 介面
 */
const UserManagementPanel = () => {
    // 暫時使用 teamMembers 作為使用者列表的資料來源
    const { teamMembers } = useData();

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">所有使用者</h3>
            <div className="overflow-x-auto">
                <ul className="divide-y divide-gray-200">
                    {(teamMembers || []).map(user => (
                        <li key={user.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center">
                                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                <div>
                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                    <p className="text-sm text-gray-500">{user.role}</p>
                                </div>
                            </div>
                            <div className="space-x-2">
                               <button className="text-indigo-600 hover:text-indigo-800">編輯</button>
                               <button className="text-red-600 hover:text-red-800">停權</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default UserManagementPanel;
