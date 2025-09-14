import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners.js';
import { addData, updateData, deleteData } from '../firebase/config';

// 1. 建立 Context 物件
const AdminContext = createContext();

// 2. 建立一個自定義 Hook (useAdminContext)，方便後台元件存取
export const useAdminContext = () => useContext(AdminContext);

// 3. 建立 Provider 元件 (AdminProvider)
export const AdminProvider = ({ children }) => {
    // a. 從 AuthContext 取得 AppID 和使用者資訊
    const { appId, user } = useAuthContext();
    
    // b. 只監聽「商品」等公開資料集合
    const { products } = useFirestoreListeners(
        'admin',   // scope
        appId,
        user?.uid, // 傳入 uid 以觸發 effect 更新
        !!user,    // 確保使用者物件存在時才開始監聽
        useCallback(() => {}, [])
    );

    // c. 管理後台介面的 UI 狀態 (例如：彈出提示)
    const [alert, setAlert] = useState({ isOpen: false, message: '' });
    
    // d. 封裝所有「管理員專屬」的業務邏輯
    const showAlert = useCallback((message) => {
        setAlert({ isOpen: true, message });
    }, []);

    const closeAlert = useCallback(() => {
        setAlert({ isOpen: false, message: '' });
    }, []);

    const handleAddProduct = async (productData) => {
        if (!appId) return;

        // 處理來自 AI 的數字價格或手動輸入的字串價格
        const priceString = typeof productData.price === 'number'
            ? `US$${productData.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : productData.price;

        const newProduct = {
            name: productData.name || '未命名商品',
            description: productData.description || '無描述',
            price: priceString,
            category: productData.category || '未分類',
            rating: '4.5',
            image: productData.image_url || productData.image || `https://placehold.co/600x400/ede9fe/5b21b6?text=${encodeURIComponent(productData.name || '商品')}`,
            tag: { text: '新品', color: 'bg-blue-500' }
        };
        try {
            await addData(`artifacts/${appId}/public/data/products`, newProduct);
            showAlert('🎉 商品新增成功！');
        } catch (error) {
            console.error("新增商品失敗:", error);
            showAlert("新增商品失敗，請稍後再試。");
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

    // e. 組合所有要提供給後台子元件的 value
    const value = {
        products,
        alert,
        showAlert,
        closeAlert,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
    };

    // f. 透過 Provider 將 value 廣播出去
    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

