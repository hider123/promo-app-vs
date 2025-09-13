import React, { useState } from 'react';
import ProductManagementPanel from './ProductManagementPanel.jsx';
import UserManagementPanel from './UserManagementPanel.jsx';

/**
 * 管理員後台的主控台，包含多個管理面板的切換功能
 */
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');

    const renderPanel = () => {
        switch (activeTab) {
            case 'products':
                return <ProductManagementPanel />;
            case 'users':
                return <UserManagementPanel />;
            default:
                return <ProductManagementPanel />;
        }
    };

    const TabButton = ({ tabId, label }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 font-bold rounded-lg transition-colors ${activeTab === tabId ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-4xl font-bold text-gray-800">管理員主控台</h1>
            <div className="bg-white p-5 rounded-xl shadow-sm">
                <div className="flex items-center gap-4 border-b pb-4 mb-4">
                    <TabButton tabId="products" label="商品管理" />
                    <TabButton tabId="users" label="使用者管理" />
                </div>
                <div>
                    {renderPanel()}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
