import React, { useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';

const WithdrawalsPage = () => {
    // 1. 從 AdminContext 取得所有提領申請和相關函式
    const { withdrawalRequests, handleUpdateRequestStatus } = useAdminContext();

    // 2. 使用 useMemo 將申請按狀態分類
    const categorizedRequests = useMemo(() => {
        const pending = [];
        const completed = [];
        (withdrawalRequests || []).forEach(req => {
            if (req.status === 'pending') {
                pending.push(req);
            } else {
                completed.push(req);
            }
        });
        // 將已完成的由新到舊排序
        completed.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return { pending, completed };
    }, [withdrawalRequests]);

    // 輔助函式：格式化時間
    const formatTime = (isoString) => {
        if (!isoString) return '-';
        try {
            return new Date(isoString).toLocaleString('zh-TW');
        } catch (error) {
            return '日期格式無效';
        }
    };
    
    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">提領管理</h1>

            {/* 待處理區塊 */}
            <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">待處理的申請</h2>
                {categorizedRequests.pending.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {categorizedRequests.pending.map(req => (
                            <li key={req.id} className="p-4 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold">用戶ID: <span className="font-normal text-gray-600">{req.userId}</span></p>
                                        <p className="font-semibold">申請時間: <span className="font-normal text-gray-600">{formatTime(req.createdAt)}</span></p>
                                        <p className="font-semibold">提領金額: <span className="font-bold text-red-600">US$ {req.amount.toFixed(2)}</span></p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdateRequestStatus(req.id, 'approved')} className="py-1 px-3 text-sm font-semibold rounded-md bg-green-500 text-white hover:bg-green-600">批准</button>
                                        <button onClick={() => handleUpdateRequestStatus(req.id, 'rejected')} className="py-1 px-3 text-sm font-semibold rounded-md bg-red-500 text-white hover:bg-red-600">拒絕</button>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-2 rounded-md">
                                    <p className="text-sm font-semibold">收款資訊:</p>
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{req.paymentInfo}</pre>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : <p className="p-4 text-gray-500">目前沒有待處理的申請。</p>}
            </div>

            {/* 已完成區塊 */}
            <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 p-4 border-b">已完成的申請</h2>
                {categorizedRequests.completed.length > 0 ? (
                     <ul className="divide-y divide-gray-200">
                        {categorizedRequests.completed.map(req => (
                             <li key={req.id} className="p-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-sm">用戶ID: <span className="font-normal text-gray-500">{req.userId}</span></p>
                                        <p className="font-semibold text-sm">金額: <span className="font-normal text-gray-500">US$ {req.amount.toFixed(2)}</span></p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${req.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {req.status === 'approved' ? '已批准' : '已拒絕'}
                                    </span>
                                </div>
                             </li>
                        ))}
                     </ul>
                ) : <p className="p-4 text-gray-500">目前沒有已完成的申請。</p>}
            </div>
        </div>
    );
};

export default WithdrawalsPage;
