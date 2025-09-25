import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS
    ? import.meta.env.VITE_ADMIN_UIDS.split(',')
    : [];

export const AuthProvider = ({ children }) => {
    const { auth, user, userId, appId, isLoading, initError } = useAuth();
    const isAdmin = useMemo(() => user ? ADMIN_UIDS.includes(user.uid) : false, [user]);

    // [還原] 讓 alert 狀態可以儲存回呼函式
    const [alert, setAlert] = useState({ isOpen: false, message: '', onClose: null });

    // [還原] showAlert 可以接收一個回呼函式
    const showAlert = useCallback((message, onCloseCallback = null) => {
        setAlert({ isOpen: true, message, onClose: onCloseCallback });
    }, []);

    // [核心修正] 採用最標準的方式來處理 closeAlert，確保回呼函式永遠是最新的
    const closeAlert = useCallback(() => {
        if (alert.onClose && typeof alert.onClose === 'function') {
            alert.onClose();
        }
        setAlert({ isOpen: false, message: '', onClose: null });
    }, [alert]); // 將 alert 加入依賴，確保 closeAlert 函式能取到最新的 alert 狀態

    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };

    const value = {
        auth,
        user,
        userId,
        appId,
        isLoading,
        initError,
        isAdmin,
        handleSignOut,
        alert,
        showAlert,
        closeAlert,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};