import React from 'react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

// 商品列表頁面
// 這個頁面組合了 SearchBar 和 ProductCard 來顯示商品列表
const ProductsPage = ({ products, onGenerateClick }) => (
    <div className="space-y-4 p-4">
        <h1 className="text-3xl font-bold text-gray-800">商品列表</h1>
        <SearchBar />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(products || []).map(product => (
                <ProductCard key={product.id} product={product} onGenerateClick={onGenerateClick} />
            ))}
        </div>
    </div>
);

export default ProductsPage;