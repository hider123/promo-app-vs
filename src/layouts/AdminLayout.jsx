import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext.jsx';
import AlertModal from '../components/AlertModal.jsx';
import AdminPage from '../pages/admin/AdminPage.jsx';
import SettingsPage from '../pages/admin/SettingsPage.jsx';
import RechargeSettingsPage from '../pages/admin/RechargeSettingsPage.jsx';
import UsersPage from '../pages/admin/UsersPage.jsx';
// [移除] 不再需要引入 AdminExperimentPage

const AdminLayout = () => {
    const { handleSignOut, alert, closeAlert } = useAuthContext();
    const [activeTab, setActiveTab] = useState('products');

    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <SettingsPage />;
            case 'recharge':
                return <RechargeSettingsPage />;
            case 'users':
                return <UsersPage />;
            // [移除] 移除 experiment 的 case
            case 'products':
            default:
                return <AdminPage />;
        }
    };

    return (
        <>
            <div className="h-full flex flex-col bg-gray-100">
                <header className="bg-white shadow-md p-4 flex justify-between items-center z-10">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-shield-halved text-2xl text-indigo-600"></i>
                            <h1 className="text-xl font-bold text-gray-800">管理員後台</h1>
                        </div>
                        <nav className="flex gap-4">
                            <button onClick={() => setActiveTab('products')} className={`font-semibold ${activeTab === 'products' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>商品管理</button>
                            <button onClick={() => setActiveTab('users')} className={`font-semibold ${activeTab === 'users' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>用戶管理</button>
                            <button onClick={() => setActiveTab('recharge')} className={`font-semibold ${activeTab === 'recharge' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>充值設定</button>
                            <button onClick={() => setActiveTab('settings')} className={`font-semibold ${activeTab === 'settings' ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}>系統設定</button>
                            {/* [移除] 移除實驗頁面的頁籤按鈕 */}
                        </nav>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="py-2 px-4 rounded-md font-semibold text-sm bg-red-500 text-white hover:bg-red-600"
                    >
                        登出
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
            <AlertModal 
                isOpen={alert.isOpen}
                onClose={closeAlert}
                message={alert.message}
            />
        </>
    );
};

export default AdminLayout;