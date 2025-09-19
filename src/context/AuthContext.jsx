import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

// --- 管理員設定 ---
const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS
    ? import.meta.env.VITE_ADMIN_UIDS.split(',')
    : [];

export const AuthProvider = ({ children }) => {
    // a. 使用 useAuth Hook 取得最底層的認證狀態
    const { auth, user, userId, appId, isLoading, initError } = useAuth();

    // b. 判斷當前使用者是否為管理員
    const isAdmin = useMemo(() => user ? ADMIN_UIDS.includes(user.uid) : false, [user]);

    // c. [核心修正] 將全域提示系統移至此處
    const [alert, setAlert] = useState({ isOpen: false, message: '', onClose: null });

    const showAlert = useCallback((message, onCloseCallback = null) => {
        setAlert({ isOpen: true, message, onClose: onCloseCallback });
    }, []);

    const closeAlert = useCallback(() => {
        if (alert.onClose) {
            alert.onClose();
        }
        setAlert({ isOpen: false, message: '', onClose: null });
    }, [alert]);


    // d. 封裝登出邏輯
    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };

    // e. 組合所有要廣播出去的 value
    const value = {
        auth,
        user,
        userId,
        appId,
        isLoading,
        initError,
        isAdmin,
        handleSignOut,
        // [核心修正] 將 alert 相關的功能由此提供
        alert,
        showAlert,
        closeAlert,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

