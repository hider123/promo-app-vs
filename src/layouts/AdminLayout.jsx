import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext.jsx';
import AdminPage from '../pages/admin/AdminPage.jsx';
import SettingsPage from '../pages/admin/SettingsPage.jsx';

const AdminLayout = () => {
    // 1. 從 AuthContext 取得登出函式
    const { handleSignOut } = useAuthContext();
    
    // 2. 管理後台當前顯示的分頁狀態
    const [activeTab, setActiveTab] = useState('products');

    // 3. 根據 activeTab 狀態，決定要渲染哪個後台頁面
    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SettingsPage />;
            case 'products':
            default:
                return <AdminPage />;
        }
    };

    // 4. 回傳 JSX 結構
    return (
        <div className="h-full flex flex-col bg-gray-100">
            {/* 固定的後台頁首 */}
            <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <i className="fas fa-shield-halved text-2xl text-indigo-600"></i>
                        <h1 className="text-xl font-bold text-gray-800">管理員後台</h1>
                    </div>
                    {/* 後台導覽列 */}
                    <nav className="flex gap-4">
                        <button onClick={() => setActiveTab('products')} className={`font-semibold ${activeTab === 'products' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>商品管理</button>
                        <button onClick={() => setActiveTab('settings')} className={`font-semibold ${activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>系統設定</button>
                    </nav>
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
                {renderContent()}
            </main>
        </div>
    );
};

export default AdminLayout;

