import React, { useState, useEffect, useMemo } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import ProductFormModal from '../../components/ProductFormModal.jsx';
import AIScoutModal from '../../components/AIScoutModal.jsx';
import SmartImage from '../../components/SmartImage.jsx';

// 專為表格設計的倒數計時元件
const CountdownCell = ({ deadline }) => {
    const calculateTimeLeft = (deadlineISOString) => {
        if (!deadlineISOString) return null;
        const targetDate = new Date(deadlineISOString).getTime();
        const now = new Date().getTime();
        const difference = targetDate - now;
        if (difference <= 0) return { expired: true };
        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
            expired: false,
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deadline));

    useEffect(() => {
        if (!deadline || timeLeft?.expired) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(deadline));
        }, 1000);
        return () => clearInterval(timer);
    }, [deadline, timeLeft?.expired]);

    if (!timeLeft) return <span className="text-gray-400">-</span>;
    if (timeLeft.expired) return <span className="font-medium text-red-500">已結束</span>;
    
    return (
        <span className="font-mono text-xs">
            {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
    );
};

// 專為表格設計的星級顯示元件
const StarDisplay = ({ count }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <i key={i} className={`fas fa-star text-sm ${i < (count || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
        ))}
    </div>
);

// 格式化時間的輔助函式
const formatTime = (isoString) => {
    if (!isoString) return '-';
    try {
        const date = new Date(isoString);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        }).replace(/\//g, '/');
    } catch (error) {
        return '日期格式無效';
    }
};


const AdminPage = () => {
    // 1. 從 Context 取得所需的資料和函式
    const { products, handleAddProduct, handleUpdateProduct, handleDeleteProduct, handleTogglePublishStatus, allUserRecords, appSettings } = useAdminContext();
    
    // 2. 管理此頁面的 UI 狀態
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);
    const [scoutKeyword, setScoutKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 3. 計算每件商品今日的推播次數
    const dailyPushCounts = useMemo(() => {
        if (!allUserRecords) return {};
        const todayStr = new Date().toLocaleDateString('sv-SE');
        const counts = {};
        allUserRecords.forEach(record => {
            if (record.date?.startsWith(todayStr)) {
                const productName = record.platformDetails?.product;
                if (productName) {
                    counts[productName] = (counts[productName] || 0) + 1;
                }
            }
        });
        return counts;
    }, [allUserRecords]);

    // 4. 定義事件處理函式
    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setIsFormModalOpen(true);
    };

    const handleAIScout = (e) => {
        e.preventDefault();
        if (!scoutKeyword.trim()) return;
        setSearchKeyword(scoutKeyword);
        setIsScoutModalOpen(true);
    };

    const handleConfirmDelete = (productId) => {
        if (window.confirm('您確定要刪除這個商品嗎？此操作無法復原。')) {
            handleDeleteProduct(productId);
        }
    };

    // 5. 回傳 JSX 結構
    return (
        <>
            <div className="p-4 space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800">AI 商品偵察員</h2>
                    <p className="text-sm text-gray-500 mt-1">輸入關鍵字，讓 AI 為您尋找熱門商品！</p>
                    <form onSubmit={handleAIScout} className="mt-4 flex gap-2">
                        <input 
                            type="text"
                            value={scoutKeyword}
                            onChange={(e) => setScoutKeyword(e.target.value)}
                            placeholder="例如：無線吸塵器、氣炸鍋..."
                            className="flex-grow border-gray-300 rounded-md shadow-sm"
                        />
                        <button type="submit" className="py-2 px-4 rounded-md font-semibold text-sm bg-purple-600 text-white hover:bg-purple-700">
                            <i className="fas fa-robot mr-2"></i>AI 搜尋
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">商品管理</h1>
                    <button 
                        onClick={handleOpenAddModal}
                        className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700">
                        <i className="fas fa-plus mr-2"></i>手動新增商品
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">圖片預覽</th>
                                <th scope="col" className="px-6 py-3">商品名稱</th>
                                <th scope="col" className="px-6 py-3">價格</th>
                                <th scope="col" className="px-6 py-3">熱門指數</th>
                                <th scope="col" className="px-6 py-3">創建時間</th>
                                {/* [核心修正] 新增欄位標題 */}
                                <th scope="col" className="px-6 py-3">佣金範圍</th>
                                <th scope="col" className="px-6 py-3">截止時間</th>
                                <th scope="col" className="px-6 py-3">狀態</th>
                                <th scope="col" className="px-6 py-3">今日推播/上限</th>
                                <th scope="col" className="px-6 py-3">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(products || []).map(product => {
                                const isPublished = product.status === 'published';
                                const pushCount = dailyPushCounts[product.name] || 0;
                                const pushLimit = product.pushLimit ?? 100;
                                return (
                                    <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4"><SmartImage src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-md"/></td>
                                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                                        <td className="px-6 py-4">{product.price}</td>
                                        <td className="px-6 py-4"><StarDisplay count={product.popularity} /></td>
                                        <td className="px-6 py-4 text-xs text-gray-500 whitespace-pre">{formatTime(product.createdAt).replace(' ', '\n')}</td>
                                        {/* [核心修正] 顯示佣金範圍 */}
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            {`$${(product.commissionMin || 0).toFixed(2)} - $${(product.commissionMax || 0).toFixed(2)}`}
                                        </td>
                                        {/* [核心修正] 顯示截止時間 */}
                                        <td className="px-6 py-4">
                                            <CountdownCell deadline={product.deadline} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{isPublished ? '已發佈' : '草稿'}</span>
                                        </td>
                                        <td className="px-6 py-4 font-medium"><span className={pushCount >= pushLimit ? 'text-red-500' : 'text-gray-700'}>{pushCount} / {pushLimit}</span></td>
                                        <td className="px-6 py-4 flex items-center gap-4">
                                            <button onClick={() => handleTogglePublishStatus(product.id, product.status)} className={`font-medium ${isPublished ? 'text-gray-500 hover:underline' : 'text-green-600 hover:underline'}`}>{isPublished ? '取消發佈' : '發佈'}</button>
                                            <button onClick={() => handleOpenEditModal(product)} className="font-medium text-indigo-600 hover:underline">編輯</button>
                                            <button onClick={() => handleConfirmDelete(product.id)} className="font-medium text-red-600 hover:underline">刪除</button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                product={editingProduct}
                onAdd={handleAddProduct}
                onUpdate={handleUpdateProduct}
            />
            <AIScoutModal
                isOpen={isScoutModalOpen}
                onClose={() => setIsScoutModalOpen(false)}
                keyword={searchKeyword}
            />
        </>
    );
};

export default AdminPage;

