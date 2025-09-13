import React, { useState } from 'react';
import { useData } from '../../context/DataContext.jsx';
import ProductEditModal from '../../components/ProductEditModal.jsx';

/**
 * 商品管理的 UI 介面，現在是一個獨立的面板
 */
const ProductManagementPanel = () => {
    const { products, handleDeleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">所有商品</h3>
                <button 
                    onClick={handleAddNew} 
                    className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700"
                >
                    <i className="fas fa-plus mr-2"></i>新增商品
                </button>
            </div>
            <div className="overflow-x-auto">
                <ul className="divide-y divide-gray-200">
                    {(products || []).map(product => (
                        <li key={product.id} className="py-3 flex justify-between items-center">
                            <div className="flex items-center min-w-0">
                                <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover mr-4" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                                    <p className="text-sm text-gray-500">{product.price}</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 ml-4 space-x-2">
                               <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-800">編輯</button>
                               <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800">刪除</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <ProductEditModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
            />
        </>
    );
};

export default ProductManagementPanel;
