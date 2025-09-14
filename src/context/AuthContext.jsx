import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';

// 1. 建立 Context 物件
// 這就像建立一個廣播電台，專門廣播「認證」相關的訊號
const AuthContext = createContext();

// 2. 建立一個自定義 Hook (useAuthContext)，方便其他元件「收聽」
export const useAuthContext = () => useContext(AuthContext);

// --- 管理員設定 ---
// 從 .env 環境變數讀取管理員 UID 列表，並轉換為陣列
const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS
    ? import.meta.env.VITE_ADMIN_UIDS.split(',')
    : [];

// 3. 建立 Provider 元件 (AuthProvider)
// 這是認證廣播電台的核心，負責收集所有認證資訊並傳送出去
export const AuthProvider = ({ children }) => {
    // a. 使用 useAuth Hook 取得最底層的認證狀態
    const { auth, user, userId, appId, isLoading, initError } = useAuth();

    // b. 判斷當前使用者是否為管理員
    const isAdmin = useMemo(() => user ? ADMIN_UIDS.includes(user.uid) : false, [user]);

    // c. 封裝登出邏輯
    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };

    // d. 組合所有要廣播出去的 value
    const value = {
        auth,
        user,
        userId,
        appId,
        isLoading,
        initError,
        isAdmin,
        handleSignOut,
    };

    // e. 透過 Provider 將 value 廣播給所有子元件
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

