import React from 'react';
import SmartImage from './SmartImage.jsx';

const ProductCard = ({ product, onGenerateClick }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            <div className="relative">
                {/* 使用 SmartImage 元件來顯示商品圖片 */}
                <SmartImage 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-48"
                />
                {product.tag && (
                    <div className={`absolute top-2 ${product.tag.text === '熱銷' ? 'right-2' : 'left-2'} ${product.tag.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {product.tag.text}
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h3>
                <p className="text-gray-500 text-sm mt-1">{product.description}</p>
                <div className="flex items-center justify-between mt-4">
                    <p className="text-xl font-bold text-indigo-600">{product.price}</p>
                    <div className="flex items-center text-yellow-400">
                        <i className="fas fa-star"></i>
                        <span className="ml-1 text-gray-600 font-medium">{product.rating}</span>
                    </div>
                </div>
                <button
                    className="w-full mt-4 py-2 px-4 rounded-md font-semibold transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
                    onClick={() => onGenerateClick(product)}
                >
                    <i className="fas fa-magic-wand-sparkles mr-2"></i>生成推廣文案
                </button>
            </div>
        </div>
    );
};

export default ProductCard;

