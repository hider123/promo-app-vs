import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners';
import { addData, updateData, deleteData, deleteDataByRef } from '../firebase/config';
import { signOut } from 'firebase/auth';

// --- 管理員設定 ---
// 從 .env 環境變數讀取管理員 UID 列表，並轉換為陣列
// 如果 .env 中沒有設定，則預設為一個空陣列，這樣就不會出錯
const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS
    ? import.meta.env.VITE_ADMIN_UIDS.split(',')
    : [];

// 1. 建立 Context 物件
const DataContext = createContext();

// 2. 建立一個自定義 Hook (useData)，方便其他元件存取 Context
export const useData = () => useContext(DataContext);

// 3. 建立 Provider 元件 (DataProvider)，作為應用程式的「大腦」
export const DataProvider = ({ children }) => {
    // a. 使用自定義 Hooks 處理底層邏輯
    const { auth, user, userId, appId, isLoading, initError } = useAuth();

    const onFirestoreLoadComplete = useCallback(() => {}, []);

    const { products, poolAccounts, teamMembers, pendingInvitations, records } = useFirestoreListeners(
        appId,
        userId,
        !!user, // 只有在 user 物件存在時，才開始監聽 Firestore
        onFirestoreLoadComplete
    );

    // b. 判斷當前使用者是否為管理員
    const isAdmin = useMemo(() => user ? ADMIN_UIDS.includes(user.uid) : false, [user]);

    // c. 建立全域 UI 狀態
    const [alert, setAlert] = useState({ isOpen: false, message: '', onClose: null });

    // d. 計算衍生狀態
    const balance = useMemo(() => (records || []).reduce((acc, record) => acc + (record.amount || 0), 0), [records]);

    // e. 封裝核心業務邏輯函式
    const showAlert = useCallback((message, onCloseCallback = null) => {
        setAlert({ isOpen: true, message, onClose: onCloseCallback });
    }, []);

    const closeAlert = useCallback(() => {
        if (alert.onClose) {
            alert.onClose();
        }
        setAlert({ isOpen: false, message: '', onClose: null });
    }, [alert]);

    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };

    const handleRecharge = async (amount) => {
        if (!userId || !appId || !amount || amount <= 0) return;
        const newRecord = {
            type: 'deposit',
            description: '帳戶儲值',
            date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
            amount: amount,
            status: '成功',
        };
        try {
            await addData(`artifacts/${appId}/users/${userId}/records`, newRecord);
            showAlert(`🎉 成功儲值 NT$${amount.toFixed(2)}！`);
        } catch (error) {
            console.error("儲值失敗:", error);
            showAlert("儲值失敗，請稍後再試。");
        }
    };

    const handleAddAccount = async () => {
        if (!userId || !appId) return;
        const namePrefixes = ['Creative', 'Digital', 'Awesome', 'Super', 'Pro', 'Global'];
        const nameSuffixes = ['Creator', 'Mind', 'Guru', 'World', 'Expert', 'Hub'];
        const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook 粉絲專頁', 'X (Twitter)'];
        const newAccountData = {
            name: `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]}${nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]}${Math.floor(Math.random() * 100)}`,
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            avatar: `https://placehold.co/100x100/ede9fe/5b21b6?text=新`,
            createdAt: new Date(),
        };
        const newExpenseRecord = {
            type: 'expense',
            description: `費用: 購買貓池帳號 (${newAccountData.name})`,
            date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
            amount: -200,
            status: '成功',
        };
        try {
            await addData(`artifacts/${appId}/users/${userId}/poolAccounts`, newAccountData);
            await addData(`artifacts/${appId}/users/${userId}/records`, newExpenseRecord);
            showAlert(`帳號 ${newAccountData.name} 已經建立！`);
        } catch (error) {
             console.error("購買貓池帳號失敗: ", error);
             showAlert('購買失敗，請稍後再試。');
        }
    };

    const handleInvite = async ({ email, role }) => {
        if (!appId) return;
        const newInvitation = { email, role, status: '邀請中...' };
        try {
            const newInvitationRef = await addData(`artifacts/${appId}/public/data/team_invitations`, newInvitation, true);
            setTimeout(async () => {
                const name = email.split('@')[0];
                const newMember = {
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    role: role,
                    avatar: `https://placehold.co/100x100/e0f2fe/075985?text=${name.charAt(0).toUpperCase()}`,
                    status: '離線'
                };
                try {
                    await addData(`artifacts/${appId}/public/data/team_members`, newMember);
                    if (newInvitationRef) {
                        await deleteDataByRef(newInvitationRef);
                    }
                } catch (e) { console.error("從邀請轉換為成員失敗:", e); }
            }, 3000);
        } catch (error) { console.error("送出邀請失敗: ", error); }
    };

    // --- 商品管理 (Admin) ---
    const handleAddProduct = async (productData) => {
        if (!appId) return;
        try {
            await addData(`artifacts/${appId}/public/data/products`, productData);
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

    // f. 組合所有要提供給子元件的 value
    const value = {
        isLoading,
        user,
        auth,
        userId,
        appId,
        initError,
        isAdmin,
        products,
        poolAccounts,
        teamMembers,
        pendingInvitations,
        records,
        balance,
        alert,
        showAlert,
        closeAlert,
        handleSignOut,
        handleRecharge,
        handleAddAccount,
        handleInvite,
        handleAddProduct,
        handleUpdateProduct,
        handleDeleteProduct,
    };

    // g. 透過 Provider 將 value 廣播出去
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

