import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import StyleInjector from './components/StyleInjector';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';

// AppContent 元件是應用程式的渲染邏輯中心
const AppContent = () => {
    // 1. 從最外層的 AuthContext 取得所有認證相關的狀態
    const { isLoading, user, auth, initError, isAdmin, handleSignOut } = useAuthContext();

    // 2. 追蹤 URL hash (#) 的狀態，以區分後台模式
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        // 清理函式：當元件卸載時，移除監聽器以防止記憶體洩漏
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    // --- 渲染邏輯 ---

    // 狀態一：有初始化錯誤 -> 顯示全螢幕錯誤訊息
    if (initError) {
        return (
            <div className="h-full flex items-center justify-center bg-red-50">
                <div className="text-center p-8">
                    <i className="fas fa-exclamation-triangle fa-3x text-red-500"></i>
                    <h1 className="mt-4 text-2xl font-bold text-red-800">連線失敗</h1>
                    <p className="mt-2 text-gray-600">{initError}</p>
                </div>
            </div>
        );
    }

    // 狀態二：正在載入 -> 顯示載入動畫
    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-3x text-indigo-600"></i>
                    <p className="mt-4 text-gray-600">正在連接雲端服務...</p>
                </div>
            </div>
        );
    }

    // 狀態三：路由判斷
    const isAdminRoute = hash === '#admin';

    if (user) {
        // --- 使用者已登入 ---
        if (isAdmin) {
            // 如果登入者是管理員
            if (isAdminRoute) {
                // 且在後台路由 -> 顯示後台 (被 AdminProvider 包裹)
                return <AdminProvider><AdminLayout /></AdminProvider>;
            } else {
                // 雖然是管理員，但在前台路由 -> 顯示前台 (被 UserProvider 包裹)
                return <UserProvider><UserLayout /></UserProvider>;
            }
        } else {
            // 如果登入者不是管理員
            if (isAdminRoute) {
                // 卻試圖進入後台 -> 強制登出並顯示提示
                handleSignOut();
                return (
                    <div className="h-full flex items-center justify-center bg-red-50">
                        <p>權限不足，正在將您登出...</p>
                    </div>
                );
            }
            // 一般使用者在前台 -> 顯示前台 (被 UserProvider 包裹)
            return <UserProvider><UserLayout /></UserProvider>;
        }
    } else {
        // --- 使用者未登入 ---
        // 根據路由顯示對應的登入頁面
        return isAdminRoute ? <AdminLoginPage auth={auth} /> : <AuthPage auth={auth} />;
    }
}

export default function App() {
    return (
        // 使用 AuthProvider 作為最外層的 Provider，
        // 確保整個應用程式都能存取到最基礎的認證狀態
        <AuthProvider>
            <StyleInjector />
            <AppContent />
        </AuthProvider>
    );
}

