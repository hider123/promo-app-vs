import React from 'react';

const BottomTabBar = ({ currentPage, setCurrentPage }) => {
    const navItems = [
        { id: 'products', label: '商品', icon: 'fas fa-store' },
        { id: 'catpool', label: '貓池', icon: 'fas fa-cat' },
        { id: 'team', label: '團隊', icon: 'fas fa-users' },
        { id: 'records', label: '紀錄', icon: 'fas fa-history' },
        // [新增] 實驗用頁籤
        { id: 'frontend_experiment', label: '前端實驗', icon: 'fas fa-vial' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[var(--tab-bar-height)] bg-white border-t border-gray-200 flex shadow-lg z-20">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === item.id ? (item.id === 'frontend_experiment' ? 'text-red-600' : 'text-indigo-600') : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <i className={`${item.icon} text-xl mb-1`}></i>
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default BottomTabBar;