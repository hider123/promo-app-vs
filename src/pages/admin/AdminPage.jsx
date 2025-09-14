import React, { useState } from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import ProductFormModal from '../../components/ProductFormModal.jsx';
import AIScoutModal from '../../components/AIScoutModal.jsx';

const AdminPage = () => {
    // 1. 從 AdminContext 取得所需的資料和函式
    const { products, handleAddProduct, handleUpdateProduct, handleDeleteProduct } = useAdminContext();
    
    // 2. 管理此頁面的 UI 狀態
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // AI 相關狀態
    const [isScoutModalOpen, setIsScoutModalOpen] = useState(false);
    const [scoutKeyword, setScoutKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');

    // 3. 定義事件處理函式
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
    
    // [新增] 處理圖片載入失敗的函式
    const handleImageError = (e) => {
        const productName = e.target.alt || '商品';
        e.target.src = `https://placehold.co/100x100/e2e8f0/475569?text=${encodeURIComponent(productName)}`;
    };

    // 4. 回傳 JSX 結構
    return (
        <>
            <div className="p-4 space-y-6">
                {/* AI 商品偵察員區塊 */}
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

                {/* 商品管理區塊 */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">商品管理</h1>
                    <button 
                        onClick={handleOpenAddModal}
                        className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700">
                        <i className="fas fa-plus mr-2"></i>手動新增商品
                    </button>
                </div>

                {/* 商品列表 */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                {/* [核心修正] 新增圖片預覽欄位 */}
                                <th scope="col" className="px-6 py-3">圖片預覽</th>
                                <th scope="col" className="px-6 py-3">商品名稱</th>
                                <th scope="col" className="px-6 py-3">價格</th>
                                <th scope="col" className="px-6 py-3">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(products || []).map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
                                    {/* [核心修正] 顯示商品圖片 */}
                                    <td className="px-6 py-4">
                                        <img 
                                            src={product.image} 
                                            alt={product.name}
                                            className="w-16 h-16 object-cover rounded-md"
                                            onError={handleImageError}
                                        />
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{product.name}</td>
                                    <td className="px-6 py-4">{product.price}</td>
                                    <td className="px-6 py-4 flex gap-4">
                                        <button onClick={() => handleOpenEditModal(product)} className="font-medium text-indigo-600 hover:underline">編輯</button>
                                        <button onClick={() => handleConfirmDelete(product.id)} className="font-medium text-red-600 hover:underline">刪除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 渲染彈出視窗 */}
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

