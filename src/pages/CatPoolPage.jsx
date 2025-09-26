import React, { useState, useMemo, useCallback } from 'react';
import { useUserContext } from '../context/UserContext.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';

const CatPoolPage = ({ onAddAccountClick }) => {
    const { poolAccounts, records } = useUserContext();
    const { showAlert } = useAuthContext();
    
    const [currentPage, setCurrentPage] = useState(1);
    // [核心修改] 将每页的项目数从 20 改为 15
    const ITEMS_PER_PAGE = 15;

    const pushedToday = useMemo(() => {
        if (!records) return new Set();
        const todayStr = new Date().toLocaleDateString('sv-SE');
        return new Set(records
            .filter(r => r.type === 'commission' && r.date?.startsWith(todayStr))
            .map(r => r.platformDetails?.account));
    }, [records]);
    
    const totalAccounts = (poolAccounts || []).length;
    const pushedTodayCount = pushedToday.size;
    const notPushedTodayCount = totalAccounts - pushedTodayCount;

    const { paginatedAccounts, pageCount } = useMemo(() => {
        const sorted = [...(poolAccounts || [])].sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : 0;
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : 0;
            return new Date(dateB) - new Date(dateA);
        });

        const totalPages = Math.ceil(sorted.length / ITEMS_PER_PAGE);
        const paginated = sorted.slice(
            (currentPage - 1) * ITEMS_PER_PAGE,
            currentPage * ITEMS_PER_PAGE
        );
        
        return { paginatedAccounts: paginated, pageCount: totalPages };
    }, [poolAccounts, currentPage]);

    const onDetailsClick = useCallback((account) => {
        const date = account.createdAt?.toDate ? account.createdAt.toDate() : account.createdAt;
        const formattedDate = date ? new Date(date).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }) : '不明';
        const relevantRecords = (records || []).filter(r => r.platformDetails?.account === account.name);
        const successCount = relevantRecords.filter(r => r.status === '成功').length;
        const failCount = relevantRecords.length - successCount;
        const message = `帐号详情： ${account.name}\n\n` +
                      `创建时间：\n${formattedDate}\n\n` +
                      `成功推播次数： ${successCount} 次\n` +
                      `失败推播次数： ${failCount} 次`;
        showAlert(message);
    }, [records, showAlert]);

    const formatCreationDate = (createdAt) => {
        if (!createdAt) return { month: '??', day: '??' };
        let dateObj;
        if (createdAt.toDate) {
            dateObj = createdAt.toDate();
        } else {
            dateObj = new Date(createdAt);
        }
        const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = dateObj.getDate();
        return { month, day };
    };

    return (
        <div className="relative h-full">
            <div className="space-y-4 p-4 pb-[calc(var(--tab-bar-height)_+_1rem)]">
                <h1 className="text-3xl font-bold text-gray-800">猫池</h1>
                <p className="text-gray-600">管理您不同帐号的内容池，快速选用素材与文案。</p>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="grid grid-cols-3 divide-x divide-gray-200 text-center">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">总帐号数</h3>
                            <p className="mt-1 text-3xl font-semibold text-gray-900">{totalAccounts}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">今日已推播</h3>
                            <p className="mt-1 text-3xl font-semibold text-green-600">{pushedTodayCount}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">今日未推播</h3>
                            <p className="mt-1 text-3xl font-semibold text-yellow-600">{notPushedTodayCount}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {/* [核心修改] 放大标题栏字型 */}
                    <div className="px-4 py-3 flex items-center bg-gray-50 border-b text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        <span className="w-24 text-left">购买日期</span>
                        <span className="flex-1">KYC 帐号</span>
                        <span className="w-24 text-center">操作</span>
                    </div>

                    <ul className="divide-y divide-gray-200">
                        {paginatedAccounts.map(account => {
                            const hasPushedToday = pushedToday.has(account.name);
                            const { month, day } = formatCreationDate(account.createdAt);
                            return (
                                <li key={account.id} className={`p-4 flex items-center justify-between transition-colors ${hasPushedToday ? 'bg-gray-100 opacity-70' : 'hover:bg-gray-50'}`}>
                                    <div className="w-24 flex items-center">
                                        <div className="w-12 h-12 rounded-lg flex-shrink-0 flex flex-col items-center justify-center bg-gray-100 border border-gray-200">
                                            <span className="text-xs font-bold text-indigo-600">{month}</span>
                                            <span className="text-lg font-bold text-gray-800 leading-tight">{day}</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        {/* [核心修改] 放大列表内容字型 */}
                                        <h3 className="font-semibold text-gray-800 truncate text-base">{account.name}</h3>
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
                                    <div className="w-24 flex justify-center">
                                        <button
                                            onClick={() => onDetailsClick(account)}
                                            className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                            <i className="fas fa-info-circle mr-2"></i>详情
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                    {pageCount > 1 && (
                        <div className="flex justify-center items-center gap-4 p-4 border-t">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                                disabled={currentPage === 1}
                                className="py-1 px-3 rounded-md font-semibold text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                上一页
                            </button>
                            <span className="text-sm font-medium text-gray-600">
                                第 {currentPage} / {pageCount} 页
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(p + 1, pageCount))}
                                disabled={currentPage === pageCount}
                                className="py-1 px-3 rounded-md font-semibold text-sm bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                下一页
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <button 
                onClick={onAddAccountClick}
                className="fixed bottom-20 right-5 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform duration-200 z-30"
                aria-label="新增帐号"
            >
                <i className="fas fa-plus fa-lg"></i>
            </button>
        </div>
    );
};

export default CatPoolPage;