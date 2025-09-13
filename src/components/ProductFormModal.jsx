import React, { useState, useEffect } from 'react';

const ProductFormModal = ({ isOpen, onClose, product, onAdd, onUpdate }) => {
    // 1. 使用 state 來管理表單中的資料
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        rating: '4.5',
        image: 'https://placehold.co/600x400/ede9fe/5b21b6?text=商品',
        tag: { text: '新品', color: 'bg-blue-500' }
    });

    // 2. 使用 useEffect 來監聽 props 的變化
    // 當彈出視窗打開時，根據傳入的 product prop 來決定要顯示的表單內容
    useEffect(() => {
        if (product) {
            // 如果有傳入 product prop，代表是「編輯模式」，將表單資料設定為該商品現有的資料
            setFormData(product);
        } else {
            // 如果沒有傳入 product prop，代表是「新增模式」，重設表單為預設的空值
            setFormData({
                name: '', description: '', price: '', rating: '4.5',
                image: 'https://placehold.co/600x400/ede9fe/5b21b6?text=商品',
                tag: { text: '新品', color: 'bg-blue-500' }
            });
        }
    }, [product, isOpen]); // 當 product 或 isOpen 改變時，這個 effect 會重新執行

    // 3. 處理表單欄位變化的函式
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. 處理表單提交的函式
    const handleSubmit = (e) => {
        e.preventDefault(); // 防止瀏覽器預設的表單提交行為
        if (product) {
            // 如果是編輯模式，呼叫 onUpdate 函式
            onUpdate(product.id, formData);
        } else {
            // 如果是新增模式，呼叫 onAdd 函式
            onAdd(formData);
        }
        onClose(); // 完成後關閉彈出視窗
    };

    // 如果彈出視窗不是開啟狀態，則不渲染任何東西
    if (!isOpen) return null;

    // 5. 回傳 JSX 結構
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-md mx-auto rounded-lg shadow-xl z-10">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800">{product ? '編輯商品' : '新增商品'}</h3>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">商品名稱</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">價格 (例如：NT$1,280)</label>
                                <input type="text" name="price" id="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">簡短描述</label>
                                <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300">取消</button>
                        <button type="submit" className="py-2 px-4 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700">儲存</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;

