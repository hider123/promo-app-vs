import React from 'react';

// 底部導覽列元件
// 接收 currentPage 和 setCurrentPage 作為 props 來控制高亮狀態和頁面切換
const BottomTabBar = ({ currentPage, setCurrentPage }) => (
    <div className="fixed bottom-0 left-0 right-0 h-[var(--tab-bar-height)] bg-white border-t border-gray-200 flex shadow-lg z-20">
        <button 
            onClick={() => setCurrentPage('products')}
            className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === 'products' ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <i className="fas fa-store text-xl mb-1"></i>
            商品
        </button>
        <button 
            onClick={() => setCurrentPage('catpool')}
            className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === 'catpool' ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <i className="fas fa-cat text-xl mb-1"></i>
            貓池
        </button>
        <button 
            onClick={() => setCurrentPage('team')}
            className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === 'team' ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <i className="fas fa-users text-xl mb-1"></i>
            團隊
        </button>
        <button 
            onClick={() => setCurrentPage('records')}
            className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === 'records' ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <i className="fas fa-history text-xl mb-1"></i>
            紀錄
        </button>
        <button 
            onClick={() => setCurrentPage('account')}
            className={`flex-1 flex flex-col items-center justify-center text-sm transition-colors ${currentPage === 'account' ? 'text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            <i className="fas fa-user-circle text-xl mb-1"></i>
            我的
        </button>
    </div>
);

export default BottomTabBar;

