import React from 'react';

// [修正] 移除 isAdmin prop，因為我們將不再在這裡顯示「管理」按鈕
const BottomTabBar = ({ currentPage, setCurrentPage }) => {
    // [修正] 移除原本根據 isAdmin 動態新增按鈕的邏輯
    const navItems = [
        { id: 'products', label: '商品', icon: 'fas fa-store' },
        { id: 'catpool', label: '貓池', icon: 'fas fa-cat' },
        { id: 'team', label: '團隊', icon: 'fas fa-users' },
        { id: 'records', label: '紀錄', icon: 'fas fa-history' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[var(--tab-bar-height)] bg-white border-t border-gray-200 flex shadow-lg z-20">
            {navItems.map(item => (
                <button 
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === item.id ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                    <i className={`${item.icon} text-xl mb-1`}></i>
                    {item.label}
                </button>
            ))}
        </div>
    );
};

export default BottomTabBar;

