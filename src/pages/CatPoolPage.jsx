import React from 'react';

// 貓池頁面
const CatPoolPage = ({ poolAccounts, onAddAccountClick, onManageClick, pushedToday }) => {
    // 建立一個已排序的帳號列表副本，由新到舊
    const sortedAccounts = [...(poolAccounts || [])].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : a.createdAt || 0;
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : b.createdAt || 0;
        return new Date(dateB) - new Date(dateA);
    });

     const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'Instagram':
                return 'fab fa-instagram text-white';
            case 'Facebook 粉絲專頁':
                return 'fab fa-facebook-f text-white';
            case 'X (Twitter)':
                return 'fab fa-twitter text-white';
            case 'YouTube':
                return 'fab fa-youtube text-white';
            case 'TikTok':
                 return 'fab fa-tiktok text-white';
            default:
                return 'fas fa-user text-white';
        }
    };

     const getPlatformBgColor = (platform) => {
        switch (platform) {
            case 'Instagram':
                return 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500';
            case 'Facebook 粉絲專頁':
                return 'bg-blue-600';
            case 'X (Twitter)':
                return 'bg-gray-800';
            case 'YouTube':
                return 'bg-red-600';
             case 'TikTok':
                return 'bg-black';
            default:
                return 'bg-gray-400';
        }
    };

    return (
        <div className="relative h-full">
            <div className="space-y-4 p-4">
                <h1 className="text-3xl font-bold text-gray-800">貓池</h1>
                <p className="text-gray-600">管理您不同帳號的內容池，快速選用素材與文案。</p>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {sortedAccounts.map(account => {
                            const hasPushedToday = pushedToday.has(account.name);
                            return (
                                <li key={account.id} className={`p-4 flex items-center justify-between transition-colors ${hasPushedToday ? 'bg-gray-100 opacity-60' : 'hover:bg-gray-50'}`}>
                                    <div className="flex items-center min-w-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${getPlatformBgColor(account.platform)}`}>
                                            <i className={`${getPlatformIcon(account.platform)} text-2xl`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-800 truncate">{account.name}</h3>
                                            <div className="flex items-center text-sm mt-1">
                                                <p className="text-gray-500">{account.platform}</p>
                                                {hasPushedToday && (
                                                    <span className="ml-2 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center">
                                                        <i className="fas fa-check-circle mr-1"></i>
                                                        今日已推播
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onManageClick(account)}
                                        className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 flex-shrink-0 ml-4">
                                        <i className="fas fa-tasks mr-2"></i>管理
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
            <button 
                onClick={onAddAccountClick}
                className="fixed bottom-20 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-30"
                aria-label="新增帳號"
            >
                <i className="fas fa-plus fa-lg"></i>
            </button>
        </div>
    );
};

export default CatPoolPage;

