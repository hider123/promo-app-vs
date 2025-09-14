import React from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { useUserContext } from '../context/UserContext.jsx';

const ProductsPage = ({ onGenerateClick }) => {
    // 1. 從 UserContext 取得商品資料
    const { products } = useUserContext();

    // 2. 回傳 JSX 結構
    return (
    <div className="space-y-4 p-4">
        <h1 className="text-3xl font-bold text-gray-800">商品列表</h1>
        <SearchBar />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 使用 (products || []) 來防止 products 在初始渲染時為 undefined 所造成的錯誤 */}
            {(products || []).map(product => (
                <ProductCard key={product.id} product={product} onGenerateClick={onGenerateClick} />
            ))}
        </div>
    </div>
    );
};

export default ProductsPage;

