import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners.js';
import { addData, updateData, deleteData, uploadBase64AsFile } from '../firebase/config';

// 1. 建立 Context 物件
const AdminContext = createContext();

// 2. 建立一個自定義 Hook (useAdminContext)，方便後台元件存取
export const useAdminContext = () => useContext(AdminContext);

// 3. 建立 Provider 元件 (AdminProvider)
export const AdminProvider = ({ children }) => {
    // a. 從 AuthContext 取得 AppID 和使用者資訊
    const { appId, user } = useAuthContext();
    
    // b. 呼叫「資料雷達」，並明確告知 scope 是 'admin'
    const { products, appSettings, allUserRecords } = useFirestoreListeners('admin', appId, user?.uid, !!user, useCallback(() => {}, []));
    const [alert, setAlert] = useState({ isOpen: false, message: '' });

    // c. 封裝所有「管理員專屬」的業務邏輯
    const showAlert = useCallback((message) => setAlert({ isOpen: true, message }), []);
    const closeAlert = useCallback(() => setAlert({ isOpen: false, message: '' }), []);

    const handleUpdateSettings = async (newSettings) => {
        if (!appId) return;
        try {
            await updateData(`artifacts/${appId}/public/data/app_settings`, 'global', newSettings);
            showAlert('✅ 系統設定已更新！');
        } catch (error) {
            console.error("更新設定失敗:", error);
            showAlert("更新設定失敗，請稍後再試。");
        }
    };

    const handleAddProduct = async (productData) => {
        if (!appId) return;
        try {
            let finalImageUrl = productData.image_url || productData.image;
            if (finalImageUrl && finalImageUrl.startsWith('data:image/png;base64,')) {
                showAlert('正在將 AI 生成的圖片上傳至雲端...');
                finalImageUrl = await uploadBase64AsFile(finalImageUrl, 'products/', productData.name);
            }
            const priceString = typeof productData.price === 'number' ? `US$${productData.price.toFixed(2)}` : productData.price;
            
            const defaultDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

            const newProduct = {
                name: productData.name || '未命名商品',
                description: productData.description || '無描述',
                price: priceString,
                category: productData.category || '未分類',
                rating: '4.5',
                image: finalImageUrl || `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(productData.name || '商品')}`,
                createdAt: new Date().toISOString(),
                deadline: productData.deadline || defaultDeadline,
                status: 'draft',
                pushLimit: productData.pushLimit || 100,
                popularity: productData.popularity || 5,
                commissionMin: productData.commissionMin || 0.2,
                commissionMax: productData.commissionMax || 0.5,
                tag: { text: '新品', color: 'bg-blue-500' }
            };
            await addData(`artifacts/${appId}/public/data/products`, newProduct);
            showAlert('🎉 商品新增成功！');
        } catch (error) {
            console.error("新增商品失敗:", error);
            showAlert(`新增商品失敗：${error.message}`);
        }
    };

    const handleUpdateProduct = async (productId, productData) => {
        if (!appId) return;
        try {
            await updateData(`artifacts/${appId}/public/data/products`, productId, productData);
            showAlert('✅ 商品更新成功！');
        } catch (error) {
            console.error("更新商品失敗:", error);
            showAlert("更新商品失敗，請稍後再試。");
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!appId) return;
        try {
            await deleteData(`artifacts/${appId}/public/data/products`, productId);
            showAlert('🗑️ 商品已刪除。');
        } catch (error) {
            console.error("刪除商品失敗:", error);
            showAlert("刪除商品失敗，請稍後再試。");
        }
    };

    const handleTogglePublishStatus = async (productId, currentStatus) => {
        if (!appId) return;
        const newStatus = currentStatus === 'published' ? 'draft' : 'published';
        try {
            await updateData(`artifacts/${appId}/public/data/products`, productId, { status: newStatus });
            showAlert(`商品狀態已更新為：${newStatus === 'published' ? '已發佈' : '草稿'}`);
        } catch (error) {
            console.error("更新商品狀態失敗:", error);
            showAlert("狀態更新失敗，請稍後再試。");
        }
    };

    // d. 組合所有要提供給後台子元件的 value
    const value = {
        products,
        appSettings,
        allUserRecords,
        alert,
        showAlert,
        closeAlert,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
        handleUpdateSettings,
        handleTogglePublishStatus,
    };

    // e. 透過 Provider 將 value 廣播出去
    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

