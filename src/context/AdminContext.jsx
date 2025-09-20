import React, { createContext, useContext, useCallback, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners.js';
import { addData, updateData, deleteData, uploadBase64AsFile } from '../firebase/config';

const AdminContext = createContext();
export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const { appId, user, showAlert } = useAuthContext();
    const { products, appSettings, allUserRecords, allTeamMembers, allPoolAccounts } = useFirestoreListeners('admin', appId, user?.uid, !!user, useCallback(() => {}, []));

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
        // 這個函式保留給「手動新增」使用
        await handleAddMultipleProducts([productData]);
    };

    // [核心修正] 建立一個新的函式來處理批次新增
    const handleAddMultipleProducts = async (productsToAdd) => {
        if (!appId || !productsToAdd || productsToAdd.length === 0) return;
        
        showAlert(`正在處理 ${productsToAdd.length} 件商品...`);

        try {
            // 使用 Promise.all 來並行處理所有商品的圖片上傳和資料準備
            const newProductsPromises = productsToAdd.map(async (productData) => {
                let finalImageUrl = productData.image_url || productData.image;

                if (finalImageUrl && finalImageUrl.startsWith('data:image/png;base64,')) {
                    finalImageUrl = await uploadBase64AsFile(finalImageUrl, 'products/', productData.name);
                }
                
                const priceString = typeof productData.price === 'number' ? `US$${productData.price.toFixed(2)}` : productData.price;
                const defaultDeadline = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

                return {
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
            });
            
            const newProducts = await Promise.all(newProductsPromises);

            // 一次性將所有準備好的商品寫入資料庫
            for (const newProduct of newProducts) {
                await addData(`artifacts/${appId}/public/data/products`, newProduct);
            }

            showAlert(`🎉 成功新增 ${newProducts.length} 件商品！`);
        } catch (error) {
            console.error("批次新增商品失敗:", error);
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

    const value = {
        products,
        appSettings,
        allUserRecords,
        allTeamMembers,
        allPoolAccounts,
        handleAddProduct,
        handleAddMultipleProducts,
        handleUpdateProduct,
        handleDeleteProduct,
        handleUpdateSettings,
        handleTogglePublishStatus,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

