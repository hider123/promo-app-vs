import React, { useState, useCallback, useMemo } from 'react';
import { useUserContext } from '../context/UserContext.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';

// 頁面元件
import ProductsPage from '../pages/ProductsPage';
import CatPoolPage from '../pages/CatPoolPage';
import TeamPage from '../pages/TeamPage';
import RecordsPage from '../pages/RecordsPage';
import AccountPage from '../pages/Account/AccountPage';
import EditProfilePage from '../pages/Account/EditProfilePage';
import TransactionsPage from '../pages/Account/TransactionsPage';
import PaymentChannelsPage from '../pages/Account/PaymentChannelsPage.jsx';

// 共用元件
import BottomTabBar from '../components/BottomTabBar';
import GenerationModal from '../components/GenerationModal';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';

const UserLayout = () => {
    // 1. 從各自的 Context 取得所需的資料和函式
    const { isAdmin, userId, appId } = useAuthContext();
    const { 
        products, 
        records, 
        poolAccounts,
        alert, 
        closeAlert, 
        showAlert, 
        handleAddAccount, 
        balance
    } = useUserContext();
    
    // 2. 管理一般使用者介面的狀態
    const [currentPage, setCurrentPage] = useState('products');
    const [accountView, setAccountView] = useState('main');
    const [rechargeAmount, setRechargeAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // 3. 計算衍生資料
    const todaysPushedAccounts = useMemo(() => {
        if (!records) return new Set();
        const todayStr = new Date().toLocaleDateString('sv-SE');
        return new Set(records
            .filter(r => r.type === 'commission' && r.date?.startsWith(todayStr))
            .map(r => r.platformDetails?.account));
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
    
    const handleAttemptAddAccount = useCallback(() => {
        if (balance >= 200) {
            setConfirmModalOpen(true);
        } else {
            showAlert('您的帳戶餘額不足以支付 NT$200 的費用。');
        }
    }, [balance, showAlert]);

    // 5. 頁面渲染邏輯
    const renderAccountPage = () => {
        switch (accountView) {
            case 'editProfile':
                return <EditProfilePage onBack={() => setAccountView('main')} />;
            case 'transactions':
                return <TransactionsPage onBack={() => setAccountView('main')} />;
            case 'paymentChannels':
                return <PaymentChannelsPage onBack={() => setAccountView('main')} amount={rechargeAmount} />;
            case 'main':
            default:
                return <AccountPage onNavigate={setAccountView} setRechargeAmount={setRechargeAmount} />;
        }
    };
    
    const renderPage = () => {
        switch (currentPage) {
            case 'products':
                return <ProductsPage onGenerateClick={handleGenerateClick} />;
            case 'catpool':
                return <CatPoolPage onAddAccountClick={handleAttemptAddAccount} onManageClick={handleManageAccountClick} pushedToday={todaysPushedAccounts} />;
            case 'team':
                return <TeamPage />;
            case 'records':
                return <RecordsPage />;
            case 'account':
                return renderAccountPage();
            default:
                return <ProductsPage onGenerateClick={handleGenerateClick} />;
        }
    };

    // 6. 回傳最終的 JSX 結構
    return (
        <div className="h-full flex flex-col">
            <main className="main-content flex-1 overflow-y-auto pb-[var(--tab-bar-height)]">
                {renderPage()}
            </main>
            <button
                onClick={() => setCurrentPage('account')}
                className={`fixed top-4 right-4 z-30 flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl ${currentPage === 'account' ? 'ring-4 ring-indigo-400' : 'ring-2 ring-gray-200'}`}
                aria-label="我的帳號"
            >
                <i className="fas fa-user-circle text-3xl text-indigo-600"></i>
            </button>
            <BottomTabBar currentPage={currentPage} setCurrentPage={setCurrentPage} isAdmin={isAdmin} />
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

export default UserLayout;

