import React, { useState } from 'react';
// 引入我們新建的 Hook 和子元件
import { useProductForm } from './form/useProductForm.js';
import ImageUpload from './form/ImageUpload.jsx';
import ProductDetailsForm from './form/ProductDetailsForm.jsx';

const ProductFormModal = ({ isOpen, onClose, product, onAdd, onUpdate }) => {
    // 1. 使用我們新建的 Hook 來取得所有狀態和邏輯
    const {
        step,
        setStep,
        formData,
        handleChange,
        isProcessing,
        uploadProgress,
        imagePreview,
        statusText,
        handleFileChange,
    } = useProductForm(product, isOpen);

    const [isSaving, setIsSaving] = useState(false);

    // 2. 處理表單提交
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const finalData = {
            ...formData,
            deadline: new Date(formData.deadline).toISOString(),
            rating: product?.rating || '4.5',
            tag: product?.tag || { text: '新品', color: 'bg-blue-500' }
        };

        try {
            if (product) {
                await onUpdate(product.id, finalData);
            } else {
                await onAdd(finalData);
            }
            onClose();
        } catch (error) {
            console.error("儲存商品失敗:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    // 3. 回傳 JSX 結構
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => !isSaving && !isProcessing && onClose()}></div>
            <div className="bg-white w-11/12 max-w-md mx-auto rounded-lg shadow-xl z-10">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800">{product ? '編輯商品' : '新增商品'}</h3>
                        <div className="mt-6 space-y-4">
                            {/* 根據步驟顯示對應的元件 */}
                            {step === 1 && (
                                <ImageUpload 
                                    onFileChange={handleFileChange}
                                    imagePreview={imagePreview}
                                    isProcessing={isProcessing}
                                    uploadProgress={uploadProgress}
                                    statusText={statusText}
                                />
                            )}
                            {step === 2 && (
                                <ProductDetailsForm 
                                    formData={formData}
                                    handleChange={handleChange}
                                    onImageChangeClick={() => setStep(1)}
                                />
                            )}
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        {step === 1 && (
                            <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300">取消</button>
                        )}
                        {step === 2 && (
                            <>
                                <button type="button" onClick={() => setStep(1)} className="py-2 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300" disabled={isSaving}>上一步</button>
                                <button type="submit" disabled={isSaving || isProcessing} className="py-2 px-4 rounded-md font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300">
                                    {isSaving ? '儲存中...' : '儲存'}
                                </button>
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;

