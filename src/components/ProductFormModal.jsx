import React, { useState, useEffect } from 'react';
import { uploadFile } from '../firebase/config.js';

const ProductFormModal = ({ isOpen, onClose, product, onAdd, onUpdate }) => {
    // 1. 表單資料狀態
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        image: '',
    });
    
    // 2. 圖片上傳相關狀態
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [statusText, setStatusText] = useState('');

    // 3. 當彈出視窗開啟時，根據 props 初始化表單
    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData(product);
                setImagePreview(product.image);
            } else {
                // 重設表單為空白
                setFormData({ name: '', description: '', price: '', image: '' });
                setImagePreview('');
            }
            // 重設上傳狀態
            setIsUploading(false);
            setUploadProgress(0);
            setStatusText('');
        }
    }, [product, isOpen]);

    // 4. 處理一般表單欄位變更
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 5. 處理檔案選擇、壓縮與上傳
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 檢查壓縮工具是否已載入
        if (typeof window.imageCompression !== 'function') {
            alert('錯誤：圖片壓縮功能尚未載入，請確認 index.html 設定是否正確。');
            return;
        }

        setIsUploading(true);
        setStatusText('正在壓縮圖片...');
        setUploadProgress(0);

        // 壓縮選項
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
        };

        try {
            console.log(`原始圖片大小: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
            
            // 執行壓縮
            const compressedFile = await window.imageCompression(file, options);
            
            console.log(`壓縮後圖片大小: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
            
            // 尺寸守門員：如果壓縮後還是太大，則拒絕上傳
            if (compressedFile.size / 1024 / 1024 > 1.5) {
                throw new Error('壓縮後的圖片仍然太大，請選擇一張較小的圖片。');
            }
            
            setImagePreview(URL.createObjectURL(compressedFile));
            setStatusText('正在上傳圖片...');
            
            // 上傳壓縮後的檔案
            const downloadURL = await uploadFile(compressedFile, 'products/', (progress) => {
                setUploadProgress(progress);
            });
            setFormData(prev => ({ ...prev, image: downloadURL }));
            setStatusText('上傳完成！');

        } catch (error) {
            console.error('圖片壓縮或上傳失敗:', error);
            alert(`圖片處理失敗：${error.message}`);
            setImagePreview(product ? product.image : ''); // 回復到舊的圖片預覽
            setStatusText('處理失敗');
        } finally {
            setIsUploading(false);
        }
    };

    // 6. 處理表單提交
    const handleSubmit = (e) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            rating: product?.rating || '4.5',
            tag: product?.tag || { text: '新品', color: 'bg-blue-500' }
        };
        if (product) {
            onUpdate(product.id, finalData);
        } else {
            onAdd(finalData);
        }
        onClose();
    };

    if (!isOpen) return null;

    // 7. 回傳 JSX 結構
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
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label htmlFor="price" className="block text-sm font-medium text-gray-700">價格 (例如：US$39.99)</label>
                                <input type="text" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">商品照片</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="預覽" className="w-20 h-20 object-cover rounded-md" />
                                    ) : (
                                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                                            <i className="fas fa-image fa-2x"></i>
                                        </div>
                                    )}
                                    <input type="file" id="image-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
                                    <label htmlFor="image-upload" className="cursor-pointer py-2 px-4 rounded-md font-medium bg-white border border-gray-300 hover:bg-gray-50">
                                        選擇檔案
                                    </label>
                                </div>
                                {isUploading && (
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600">{statusText}</p>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">簡短描述</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300">取消</button>
                        <button type="submit" disabled={isUploading} className="py-2 px-4 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isUploading ? '處理中...' : '儲存'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;

