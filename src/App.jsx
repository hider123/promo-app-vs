import React, { useState, useEffect } from 'react';
import { DataProvider, useData } from './context/DataContext.jsx';
import AppLayout from './AppLayout';
import StyleInjector from './components/StyleInjector';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'; // 引入新的管理員登入頁面

// 應用程式內容的渲染邏輯中心
const AppContent = () => {
    // 1. 從 Context 取得所有需要的狀態
    const { isLoading, user, auth, initError, isAdmin } = useData();

    // 2. 追蹤 URL hash (#) 的狀態，以區分一般使用者和管理員
    const [hash, setHash] = useState(window.location.hash);

    // 3. 設定監聽器，當 URL hash 改變時自動更新狀態
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

    // 狀態三：管理員路由 (URL 包含 #admin)
    if (hash === '#admin') {
        // 如果使用者已登入，且是管理員，則顯示主應用
        if (user && isAdmin) {
            return <AppLayout />;
        }
        // 否則，無論是否登入，一律顯示管理員專用登入頁面
        return <AdminLoginPage auth={auth} />;
    }
    
    // 狀態四：一般使用者路由
    // 如果使用者已登入，則顯示主應用
    if (user) {
        return <AppLayout />;
    }

    // 如果使用者未登入，則顯示一般登入/註冊頁面
    return <AuthPage auth={auth} />;
}


export default function App() {
    return (
        // 使用 DataProvider 包裹所有內容，確保應用程式的任何部分
        // 都能透過 useData() Hook 存取到全域狀態
        <DataProvider>
            <StyleInjector />
            <AppContent />
        </DataProvider>
    );
}

