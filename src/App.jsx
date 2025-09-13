import React from 'react';
import { DataProvider, useData } from './context/DataContext.jsx';
import AppLayout from './AppLayout';
import StyleInjector from './components/StyleInjector';
import AuthPage from './pages/AuthPage';

// AppContent 元件是應用程式的真正根元件
const AppContent = () => {
    // 從 Context 取得認證相關的狀態
    const { isLoading, user, auth } = useData();

    // 狀態一：正在等待 Firebase 初始化和使用者狀態確認
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

    // 狀態二：初始化完成，但使用者未登入 -> 顯示登入/註冊頁面
    if (!user) {
        return <AuthPage auth={auth} />;
    }

    // 狀態三：初始化完成，且使用者已登入 -> 顯示主應用程式
    return <AppLayout />;
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

