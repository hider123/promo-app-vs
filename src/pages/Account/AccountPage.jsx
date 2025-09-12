import React from 'react';

// 「我的」主頁面
const AccountPage = ({ onNavigate, records, userId }) => {
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalCommissionEarned = (records || [])
        .filter(r => r.type === 'commission' && r.amount > 0)
        .reduce((sum, r) => sum + r.amount, 0);

    const getUserLevel = (commission) => {
        if (commission >= 50000) return { name: '首席顧問', color: 'bg-indigo-100 text-indigo-800' };
        if (commission >= 10000) return { name: '資深總監', color: 'bg-purple-100 text-purple-800' };
        if (commission >= 2000) return { name: '推廣經理', color: 'bg-sky-100 text-sky-800' };
        return { name: '行銷專員', color: 'bg-teal-100 text-teal-800' };
    };

    const userLevel = getUserLevel(totalCommissionEarned);

    const formatUserId = (id) => {
        if (!id || id.length < 8) return id || 'N/A';
        const firstLetter = String.fromCharCode(65 + (parseInt(id.substring(0, 2), 16) % 26));
        const secondLetter = String.fromCharCode(65 + (parseInt(id.substring(2, 4), 16) % 26));
        const lastSixDigits = id.slice(-6);
        return `${firstLetter}${secondLetter}${lastSixDigits}`;
    };
    
    const formattedUserId = formatUserId(userId);

    return (
        <div className="space-y-6 p-4">
            <h1 className="text-3xl font-bold text-gray-800">我的帳號</h1>
            
            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">個人資料</h2>
                <div className="flex items-center space-x-4">
                    <img className="h-16 w-16 rounded-full object-cover" src="https://placehold.co/100x100/e2e8f0/475569?text=頭像" alt="使用者頭像" />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-x-2 mb-1">
                            <p className="font-semibold text-lg text-gray-800">PromoMaster</p>
                            <span className={`${userLevel.color} text-xs font-medium px-2.5 py-0.5 rounded-full`}>{userLevel.name}</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">UserID: {userId ? formattedUserId : '正在登入...'}</p>
                    </div>
                    <button onClick={() => onNavigate('editProfile')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex-shrink-0">編輯</button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-800">我的交易</h2>
                    <button onClick={() => onNavigate('transactions')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                        查看詳細紀錄 <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
                <div className="text-center pt-2">
                     <p className="text-sm font-medium text-gray-500">目前總餘額</p>
                     <p className="text-3xl font-bold text-gray-800 mt-1">NT$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">已連結的社群帳號</h2>
                <ul className="divide-y divide-gray-200">
                    <li className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                            <i className="fab fa-facebook text-2xl text-blue-600 mr-4 w-6 text-center"></i>
                            <span className="font-medium text-gray-800">Facebook</span>
                        </div>
                        <button className="text-sm font-medium text-red-600 hover:text-red-800">取消連結</button>
                    </li>
                    <li className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                            <i className="fab fa-x-twitter text-2xl text-gray-800 mr-4 w-6 text-center"></i>
                            <span className="font-medium text-gray-800">X (Twitter)</span>
                        </div>
                         <button className="text-sm font-medium text-red-600 hover:text-red-800">取消連結</button>
                    </li>
                     <li className="flex items-center justify-between py-3">
                        <div className="flex items-center">
                           <i className="fab fa-instagram text-2xl text-pink-500 mr-4 w-6 text-center"></i>
                           <span className="font-medium text-gray-800">Instagram</span>
                        </div>
                        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">連結帳號</button>
                    </li>
                </ul>
            </div>

            <div className="pt-2">
                <button className="w-full py-3 rounded-lg font-semibold transition-colors bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300">
                    登出帳號
                </button>
            </div>
        </div>
    );
};

export default AccountPage;

