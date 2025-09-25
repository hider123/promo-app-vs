import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuthContext } from './context/AuthContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { AdminProvider } from './context/AdminContext.jsx';
import UserLayout from './layouts/UserLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import StyleInjector from './components/StyleInjector';
import AuthPage from './pages/AuthPage';
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AlertModal from './components/AlertModal.jsx';

const AppContent = () => {
    const { isLoading, user, auth, initError, isAdmin, handleSignOut, alert, showAlert, closeAlert } = useAuthContext();
    const [hash, setHash] = useState(window.location.hash);
    
    // [移除] 移除用於控制登入提示流程的狀態
    // const [isLoginMessagePending, setIsLoginMessagePending] = useState(false);
    // const lastProcessedSignIn = useRef(null);

    useEffect(() => {
        const handleHashChange = () => setHash(window.location.hash);
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    
    // [移除] 移除整個用於顯示登入成功提示的 useEffect 區塊
    // useEffect(() => { ... }, [user, showAlert, closeAlert]);

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
        // [修改] 移除 isLoginMessagePending 的判斷
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

        // [修改] 移除 isLoginMessagePending 的判斷
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
            <AlertModal 
                isOpen={alert.isOpen}
                onClose={closeAlert}
                message={alert.message}
            />
        </>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <StyleInjector />
            <AppContent />
        </AuthProvider>
    );
}