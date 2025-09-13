import React, { useState, useCallback, useMemo } from 'react';
import { useData } from './context/DataContext.jsx';

// 頁面元件
import ProductsPage from './pages/ProductsPage';
import CatPoolPage from './pages/CatPoolPage';
import TeamPage from './pages/TeamPage';
import RecordsPage from './pages/RecordsPage';
import AccountPage from './pages/Account/AccountPage';
import EditProfilePage from './pages/Account/EditProfilePage';
import TransactionsPage from './pages/Account/TransactionsPage';

// 共用元件
import BottomTabBar from './components/BottomTabBar';
import GenerationModal from './components/GenerationModal';
import ConfirmationModal from './components/ConfirmationModal';
import AlertModal from './components/AlertModal';

// 假資料 (因為商品資料是靜態的)
import { initialProducts } from './data/mockData';

const AppLayout = () => {
    // 1. 從 Context 取得全域狀態和函式
    const { 
        records, 
        userId, 
        appId, 
        poolAccounts, 
        teamMembers,
        pendingInvitations,
        alert, 
        closeAlert,
        showAlert,
        handleAddAccount, 
        handleInvite,
        balance // 取得餘額
    } = useData();
    
    // 2. 管理此佈局層級的 UI 狀態
    const [products] = useState(initialProducts);
    const [currentPage, setCurrentPage] = useState('account'); // 預設為 'account' 方便查看
    const [accountView, setAccountView] = useState('main');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    
    // 3. 計算衍生資料
    const todaysPushedAccounts = useMemo(() => {
        if (!records) return new Set();
        const todayStr = new Date().toLocaleDateString('sv-SE');
        const accountNames = records
            .filter(r => r.type === 'commission' && r.date?.startsWith(todayStr))
            .map(r => r.platformDetails?.account);
        return new Set(accountNames);
    }, [records]);
    
    // 4. 定義 UI 事件處理函式
    const handleGenerateClick = useCallback((product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const handlePushSuccess = useCallback(() => {
        setIsModalOpen(false);
        setCurrentPage('records');
    }, []);

    const handleManageAccountClick = useCallback((account) => {
        const date = account.createdAt?.toDate ? account.createdAt.toDate() : account.createdAt;
        if (date) {
            const formattedDate = new Date(date).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });
            showAlert(`帳號 "${account.name}"\n創建於：\n${formattedDate}`);
        } else {
            showAlert(`帳號 "${account.name}" 的創建日期不明。`);
        }
    }, [showAlert]);

    // [新增] 處理新增帳號前的餘額檢查
    const handleAttemptAddAccount = useCallback(() => {
        if (balance >= 200) {
            setConfirmModalOpen(true); // 餘額足夠，顯示確認視窗
        } else {
            showAlert('您的帳戶餘額不足以支付 NT$200 的費用。'); // 餘額不足，直接顯示提示
        }
    }, [balance, showAlert]);

    // 5. 頁面渲染邏輯
    const renderAccountPage = () => {
        switch (accountView) {
            case 'editProfile':
                return <EditProfilePage onBack={() => setAccountView('main')} />;
            case 'transactions':
                return <TransactionsPage onBack={() => setAccountView('main')} />;
            case 'main':
            default:
                return <AccountPage onNavigate={setAccountView} />;
        }
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'products':
                return <ProductsPage products={products} onGenerateClick={handleGenerateClick} />;
            case 'catpool':
                // [修正] 將 onAddAccountClick 指向新的處理函式
                return <CatPoolPage poolAccounts={poolAccounts} onAddAccountClick={handleAttemptAddAccount} onManageClick={handleManageAccountClick} pushedToday={todaysPushedAccounts} />;
            case 'team':
                return <TeamPage teamMembers={teamMembers} pendingInvitations={pendingInvitations} handleInvite={handleInvite} />;
            case 'records':
                return <RecordsPage />;
            case 'account':
                return renderAccountPage();
            default:
                return <ProductsPage products={products} onGenerateClick={handleGenerateClick} />;
        }
    };

    // 6. 回傳最終的 JSX 結構
    return (
        <div className="h-full flex flex-col">
            <main className="main-content flex-1 overflow-y-auto pb-[var(--tab-bar-height)]">
                {renderPage()}
            </main>
            
            <BottomTabBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            {/* 彈出視窗 (Modals) */}
            {selectedProduct && (
                <GenerationModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onPushSuccess={handlePushSuccess}
                    product={selectedProduct}
                    poolAccounts={poolAccounts}
                    userId={userId}
                    appId={appId}
                    pushedToday={todaysPushedAccounts}
                />
            )}
            <ConfirmationModal 
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={() => {
                    handleAddAccount();
                    setConfirmModalOpen(false);
                }}
                title="確認新增帳號"
            >
                <p>每次新增帳號將從您的餘額中扣除 NT$200 的費用。</p>
                <p className="mt-2 font-semibold">您確定要繼續嗎？</p>
            </ConfirmationModal>
            
            <AlertModal 
                isOpen={alert.isOpen}
                onClose={closeAlert}
                message={alert.message}
            />
        </div>
    );
};

export default AppLayout;

