import React from 'react';
// [修正] 引入新的 AuthContext Hook
import { useAuthContext } from '../context/AuthContext.jsx';
import AdminPage from '../pages/admin/AdminPage.jsx';

const AdminLayout = () => {
    // [修正] 從 useAuthContext 中取得登出函式
    const { handleSignOut } = useAuthContext();

    return (
        <div className="h-full flex flex-col bg-gray-100">
            {/* 固定的後台頁首 */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <i className="fas fa-shield-halved text-2xl text-indigo-600"></i>
                    <h1 className="text-xl font-bold text-gray-800">管理員後台</h1>
                </div>
                <button
                    onClick={handleSignOut}
                    className="py-2 px-4 rounded-md font-semibold text-sm bg-red-500 text-white hover:bg-red-600"
                >
                    登出
                </button>
            </header>
            {/* 主要內容區域 */}
            <main className="flex-1 overflow-y-auto">
                {/* 在後台模式下，永遠只顯示 AdminPage */}
                <AdminPage />
            </main>
        </div>
    );
};

export default AdminLayout;

