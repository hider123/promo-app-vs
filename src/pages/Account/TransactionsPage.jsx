import React from 'react';

// 交易紀錄詳情頁面
const TransactionsPage = ({ onBack, records }) => {
    const totalBalance = (records || []).reduce((sum, r) => sum + (r.amount || 0), 0);
    const pendingCommission = 150.00; 
    const withdrawableBalance = totalBalance > pendingCommission ? totalBalance - pendingCommission : 0;

    return (
        <div className="p-4 space-y-6">
            <div className="relative flex items-center justify-center">
                <button onClick={onBack} className="absolute left-0 text-indigo-600 hover:text-indigo-800" aria-label="返回上一頁">
                    <i className="fas fa-arrow-left fa-lg"></i>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">我的交易</h1>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-sm font-medium text-gray-500">目前總餘額</p>
                <p className="text-4xl font-bold text-indigo-600 my-2">NT$ {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className="flex justify-center items-center text-sm text-gray-600 divide-x divide-gray-300">
                    <div className="px-4">可提領: <span className="font-semibold">NT$ {withdrawableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                    <div className="px-4">待處理: <span className="font-semibold">NT$ {pendingCommission.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                </div>
                <button className="w-full max-w-xs mx-auto mt-6 py-3 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300">
                    申請提領
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                 <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">交易紀錄</h2>
                 <ul className="divide-y divide-gray-200">
                    {(records || []).map((record, index) => {
                        const isExpense = record.amount < 0;
                        return (
                             <li key={record.id || index} className="p-4 flex items-center justify-between">
                                <div className="flex items-center min-w-0">
                                    <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${isExpense ? 'bg-red-100' : 'bg-green-100'}`}>
                                        {isExpense ? <i className="fas fa-arrow-down text-red-600"></i> : <i className="fas fa-dollar-sign text-green-600"></i>}
                                    </div>
                                    <div className="ml-4 flex-1 min-w-0">
                                        <p className="font-medium text-gray-800 truncate">{record.description}</p>
                                        <p className="text-sm text-gray-500">{record.date}</p>
                                    </div>
                                </div>
                                <div className={`font-semibold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                                    {`${isExpense ? '-' : '+'} NT$${Math.abs(record.amount || 0).toFixed(2)}`}
                                </div>
                            </li>
                        )
                    })}
                 </ul>
            </div>
        </div>
    );
};

export default TransactionsPage;

