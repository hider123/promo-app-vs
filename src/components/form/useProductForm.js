import { useState, useEffect, useCallback } from 'react';
import { uploadFile } from '../../firebase/config.js';
import imageCompression from 'browser-image-compression';

// 這個 Hook 封裝了所有與商品表單相關的「狀態」和「邏輯」
export const useProductForm = (product, isOpen) => {
    // 1. 表單資料狀態
    const [formData, setFormData] = useState({});
    const [step, setStep] = useState(1);
    
    // 2. 圖片上傳與儲存的處理狀態
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState('');
    const [statusText, setStatusText] = useState('拖曳或點擊此處上傳');

    // 3. 當彈出視窗開啟時，根據 props 初始化表單
    useEffect(() => {
        if (isOpen) {
            const defaultDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
            if (product) {
                const initialData = {
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    image: product.image || '',
                    pushLimit: product.pushLimit ?? 100,
                    popularity: product.popularity ?? 5,
                    deadline: product.deadline ? new Date(product.deadline).toISOString().slice(0, 16) : defaultDeadline,
                    commissionMin: product.commissionMin ?? 0.2,
                    commissionMax: product.commissionMax ?? 0.5,
                };
                setFormData(initialData);
                setImagePreview(initialData.image);
                setStep(initialData.image ? 2 : 1);
            } else {
                setFormData({ name: '', description: '', price: '', image: '', pushLimit: 100, popularity: 5, deadline: defaultDeadline, commissionMin: 0.2, commissionMax: 0.5 });
                setImagePreview('');
                setStep(1);
            }
            setIsProcessing(false);
            setUploadProgress(0);
            setStatusText('拖曳或點擊此處上傳');
        }
    }, [product, isOpen]);

    // 4. 處理一般表單欄位變更
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        const isNumberField = ['pushLimit', 'popularity', 'commissionMin', 'commissionMax'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumberField ? parseFloat(value) : value }));
    }, []);

    const setFormField = useCallback((field, value) => {
        setFormData(prev => ({...prev, [field]: value}));
    }, []);

    // 5. 處理檔案選擇、壓縮與上傳
    const handleFileChange = useCallback(async (file) => {
        if (!file) return;

        setIsProcessing(true);
        setStatusText('正在壓縮圖片...');
        setUploadProgress(0);
        setImagePreview(URL.createObjectURL(file));

        try {
            const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true });
            if (compressedFile.size / 1024 / 1024 > 1.5) throw new Error('壓縮後的圖片仍然太大。');
            
            setStatusText('正在上傳圖片...');
            const downloadURL = await uploadFile(compressedFile, 'products/', setUploadProgress);
            
            setStatusText('✅ 上傳完成！');
            setFormData(prev => ({ ...prev, image: downloadURL }));
            
            setTimeout(() => setStep(2), 1000);
        } catch (error) {
            console.error('圖片處理失敗:', error);
            setStatusText(`處理失敗：${error.message}`);
            setIsProcessing(false);
        }
    }, []);

    return {
        step,
        setStep,
        formData,
        handleChange,
        setFormField,
        isProcessing,
        uploadProgress,
        imagePreview,
        statusText,
        handleFileChange,
    };
};
