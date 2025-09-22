import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import StyleInjector from './components/StyleInjector';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AlertModal from './components/AlertModal.jsx';

// [修改] 將所有應用程式邏輯移至此 AppContent 元件中
const AppContent = () => {
    // 1. 在這裡使用 Context 是安全的，因為它已經被 AuthProvider 包裹
    const { isLoading, user, auth, initError, isAdmin, handleSignOut, alert, showAlert, closeAlert } = useAuthContext();
    const [hash, setHash] = useState(window.location.hash);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    // 首次登入歡迎訊息的邏輯
    useEffect(() => {
        if (user) {
            const { creationTime, lastSignInTime } = user.metadata;
            const isNewUser = new Date(lastSignInTime) - new Date(creationTime) < 5000;

            if (isNewUser && !sessionStorage.getItem('welcomeMessageShown')) {
                showAlert(`👋 歡迎您，${user.email}！\n很高興您的加入。`);
                sessionStorage.setItem('welcomeMessageShown', 'true');
            }
        }
    }, [user, showAlert]);

    // 渲染主內容的函式
    const renderMainContent = () => {
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

        const isAdminRoute = hash === '#admin';

        if (user) {
            if (isAdmin) {
                return isAdminRoute 
                    ? <AdminProvider><AdminLayout /></AdminProvider> 
                    : <UserProvider><UserLayout /></UserProvider>;
            } else {
                if (isAdminRoute) {
                    handleSignOut();
                    return <div className="h-full flex items-center justify-center bg-red-50"><p>權限不足，正在將您登出...</p></div>;
                }
                return <UserProvider><UserLayout /></UserProvider>;
            }
        } else {
            return isAdminRoute ? <AdminLoginPage auth={auth} /> : <AuthPage auth={auth} />;
        }
    };

    return (
        <>
            {renderMainContent()}
            {/* AlertModal 現在可以安全地從 Context 取得狀態並顯示 */}
            <AlertModal 
                isOpen={alert.isOpen}
                onClose={closeAlert}
                message={alert.message}
            />
        </>
    );
}

// App 元件現在只負責提供 Context 和基礎結構
export default function App() {
    return (
        <AuthProvider>
            <StyleInjector />
            <AppContent />
        </AuthProvider>
    );
}