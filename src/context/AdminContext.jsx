import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners.js';
// [新增] 直接引入最底層的 Firebase 工具
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { addData, updateData, deleteData, uploadBase64AsFile } from '../firebase/config';

const AdminContext = createContext();
export const useAdminContext = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
    const { appId, user, showAlert } = useAuthContext();
    
    // 1. 讓 useFirestoreListeners 負責讀取除了 team_members 以外的其他後台資料
    const { products, appSettings, allUserRecords, allPoolAccounts } = useFirestoreListeners('admin', appId, user?.uid, !!user, useCallback(() => {}, []));

    // 2. 新增 state 來分別存放 Firestore 和 Auth 的使用者資料
    const [allTeamMembers, setAllTeamMembers] = useState([]);
    const [allAuthUsers, setAllAuthUsers] = useState([]);
    
    // 3. [核心修正] 讓 AdminContext 自己負責「即時監聽」 allTeamMembers
    useEffect(() => {
        // 確保 appId 和 user 都已準備好
        if (!appId || !user) return;

        const db = getFirestore();
        const membersRef = collection(db, `artifacts/${appId}/public/data/team_members`);
        
        // 使用 onSnapshot 來建立即時監聽，任何資料庫的變動都會立刻反應在後台
        const unsubscribe = onSnapshot(membersRef, (querySnapshot) => {
            const membersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllTeamMembers(membersData);
            console.log("[AdminContext] 已更新 team_members:", membersData);
        }, (error) => {
            console.error("[AdminContext] 監聽 team_members 失敗:", error);
            showAlert(`讀取用戶列表失敗: ${error.message}`);
        });

        // [新增] 同時，呼叫後端函式取得所有使用者的 Email
        const fetchAllAuthUsers = async () => {
            try {
                const functions = getFunctions();
                const getAllUsersFunction = httpsCallable(functions, 'getAllAuthUsers');
                const result = await getAllUsersFunction();
                setAllAuthUsers(result.data.users);
            } catch (error) {
                console.error("[AdminContext] 取得所有認證使用者失敗:", error);
                showAlert(`讀取使用者 Email 列表失敗: ${error.message}`);
            }
        };
        fetchAllAuthUsers();

        // 當元件卸載時，自動取消監聽以節省資源
        return () => unsubscribe();
        
    }, [appId, user, showAlert]);

    // 4. 呼叫後端函式來更新使用者狀態 (凍結/隱藏)
    const handleToggleUserStatus = useCallback(async (docId, uid, action) => {
        showAlert('正在處理請求...');
        try {
            const functions = getFunctions();
            const toggleFunction = httpsCallable(functions, 'toggleUserStatus');
            const result = await toggleFunction({ docId, uid, action });
            showAlert(result.data.message);
        } catch (error) {
            console.error("更新使用者狀態失敗:", error);
            showAlert(`操作失敗: ${error.message}`);
        }
    }, [showAlert]);

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
        await handleAddMultipleProducts([productData]);
    };

    const handleAddMultipleProducts = async (productsToAdd) => {
        if (!appId || !productsToAdd || !productsToAdd.length === 0) return;
        
        showAlert(`正在處理 ${productsToAdd.length} 件商品...`);

        try {
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
        allAuthUsers,
        allPoolAccounts,
        handleToggleUserStatus,
        handleAddProduct,
        handleAddMultipleProducts,
        handleUpdateProduct,
        handleDeleteProduct,
        handleUpdateSettings,
        handleTogglePublishStatus,
    };

    return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};