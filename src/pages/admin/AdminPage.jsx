import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
// [修正] 引入正確的元件名稱 ProductFormModal.jsx
import ProductFormModal from '../../components/ProductFormModal.jsx';

const AdminPage = () => {
    const { products, handleAddProduct, handleUpdateProduct, handleDeleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleOpenAddModal = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleConfirmDelete = (productId) => {
        // 使用瀏覽器內建的 confirm 對話框進行二次確認
        if (window.confirm('您確定要刪除這個商品嗎？此操作無法復原。')) {
            handleDeleteProduct(productId);
        }
    };

    return (
        <>
            <div className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">商品管理</h1>
                    <button 
                        onClick={handleOpenAddModal}
                        className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700">
                        <i className="fas fa-plus mr-2"></i>新增商品
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">商品名稱</th>
                                <th scope="col" className="px-6 py-3">價格</th>
                                <th scope="col" className="px-6 py-3">操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50">
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

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                product={editingProduct}
                onAdd={handleAddProduct}
                onUpdate={handleUpdateProduct}
            />
        </>
    );
};

export default AdminPage;

