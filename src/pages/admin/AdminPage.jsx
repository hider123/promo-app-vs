import React, { useState, useEffect } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import ProductFormModal from '../../components/ProductFormModal.jsx';
import AIScoutModal from '../../components/AIScoutModal.jsx';
import SmartImage from '../../components/SmartImage.jsx';

// [新增] 一個專為表格設計的倒數計時元件
const CountdownCell = ({ createdAt }) => {
    const calculateTimeLeft = (creationDate) => {
        if (!creationDate) return null;
        
        let dateObj;
        if (creationDate && typeof creationDate.toDate === 'function') {
            dateObj = creationDate.toDate();
        } else if (typeof creationDate === 'string') {
            dateObj = new Date(creationDate);
        } else {
            return null;
        }

        const targetDate = dateObj.getTime() + 2 * 24 * 60 * 60 * 1000;
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

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(createdAt));

    useEffect(() => {
        if (!createdAt || timeLeft?.expired) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft(createdAt));
        }, 1000);
        return () => clearInterval(timer);
    }, [createdAt, timeLeft?.expired]);

    if (!timeLeft) return <span className="text-gray-400">-</span>;
    if (timeLeft.expired) return <span className="font-medium text-red-500">已結束</span>;
    
    return (
        <span className="font-mono text-xs">
            {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
    );
};


const AdminPage = () => {
    const { products, handleAddProduct, handleUpdateProduct, handleDeleteProduct } = useAdminContext();
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);
    const [scoutKeyword, setScoutKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

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
                                {/* [核心修正] 新增欄位標題 */}
                                <th scope="col" className="px-6 py-3">剩餘時間</th>
                                <th scope="col" className="px-6 py-3">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(products || []).map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <SmartImage 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                                    <td className="px-6 py-4">{product.price}</td>
                                    {/* [核心修正] 顯示倒數計時元件 */}
                                    <td className="px-6 py-4">
                                        <CountdownCell createdAt={product.createdAt} />
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <button onClick={() => handleOpenEditModal(product)} className="font-medium text-indigo-600 hover:underline">編輯</button>
                                        <button onClick={() => handleConfirmDelete(product.id)} className="font-medium text-red-600 hover:underline">刪除</button>
                                    </td>
                                </tr>
                            ))}
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

