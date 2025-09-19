import React from 'react';
import StarInput from './StarInput.jsx';

// 這個元件只負責「商品詳情」的表單欄位
const ProductDetailsForm = ({ formData, handleChange, onImageChangeClick }) => {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700">商品照片</label>
                <div className="mt-1 flex items-center gap-4">
                    <img src={formData.image} alt="預覽" className="w-20 h-20 object-cover rounded-md" />
                    <button type="button" onClick={onImageChangeClick} className="py-2 px-4 rounded-md font-medium bg-white border border-gray-300 hover:bg-gray-50">更換圖片</button>
                </div>
            </div>
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">商品名稱</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full" required />
            </div>
            <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">價格 (例如：US$39.99)</label>
                <input type="text" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full" required />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">簡短描述</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full"></textarea>
            </div>
            <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">截止時間</label>
                <input type="datetime-local" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className="mt-1 block w-full" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">佣金範圍 (美元)</label>
                <div className="mt-1 flex items-center gap-2">
                    <input type="number" name="commissionMin" value={formData.commissionMin} onChange={handleChange} className="w-full" placeholder="最低" step="0.01" />
                    <span className="text-gray-500">-</span>
                    <input type="number" name="commissionMax" value={formData.commissionMax} onChange={handleChange} className="w-full" placeholder="最高" step="0.01" />
                </div>
            </div>
            <div>
                <label htmlFor="pushLimit" className="block text-sm font-medium text-gray-700">每日商品推播上限 (次數)</label>
                <input type="number" name="pushLimit" value={formData.pushLimit} onChange={handleChange} className="mt-1 block w-full" placeholder="例如：100" step="1" />
            </div>
            <div>
                <label htmlFor="popularity" className="block text-sm font-medium text-gray-700">熱門指數 (1-5)</label>
                <StarInput
                    rating={formData.popularity}
                    setRating={(newRating) => handleChange({ target: { name: 'popularity', value: newRating } })}
                />
            </div>
        </>
    );
};

export default ProductDetailsForm;
