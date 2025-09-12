import React from 'react';

// 通用的搜尋列元件
const SearchBar = () => (
    <div className="p-4 bg-white rounded-lg shadow-sm">
        <div className="relative w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-search"></i>
            </span>
            <input type="text" placeholder="搜尋商品名稱或 ASIN..." className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-full focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50" />
        </div>
    </div>
);

export default SearchBar;

