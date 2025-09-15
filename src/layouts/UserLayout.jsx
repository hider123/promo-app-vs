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
    // 1. 從 Context 取得所需的資料和函式
    const { isAdmin } = useAuthContext();
    const { 
        alert, 
        closeAlert, 
        showAlert, 
        handleAddAccount, 
        balance,
        appSettings // 取得後台設定
    } = useUserContext();
    
    // 2. 管理此佈局層級的 UI 狀態
    const [currentPage, setCurrentPage] = useState('products');
    const [accountView, setAccountView] = useState('main');
    const [rechargeAmount, setRechargeAmount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);

    // 3. 定義 UI 事件處理函式
    const handleGenerateClick = useCallback((product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }, []);
    
    const handleAttemptAddAccount = useCallback(() => {
        // 使用來自後台設定的動態價格，若無則預設為 5 美元
        const catPoolPrice = appSettings?.catPoolPrice || 5.00;
        if (balance >= catPoolPrice) {
            setConfirmModalOpen(true);
        } else {
            showAlert(`您的帳戶餘額不足以支付 US$${catPoolPrice.toFixed(2)} 的費用。`);
        }
    }, [balance, showAlert, appSettings]);

    // 4. 頁面渲染邏輯
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
                return <CatPoolPage onAddAccountClick={handleAttemptAddAccount} />;
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

    // 5. 回傳最終的 JSX 結構
    return (
        <div className="h-full flex flex-col">
            <main className="main-content flex-1 overflow-y-auto pb-[var(--tab-bar-height)]">
                {renderPage()}
            </main>
            <button
                onClick={() => setCurrentPage('account')}
                className={`fixed top-4 right-4 z-30 flex items-center justify-center h-14 w-14 rounded-full bg-white shadow-lg transition-all duration-300 transform hover:scale-110 hover:shadow-xl ${currentPage === 'account' ? 'ring-4 ring-indigo-400' : 'ring-2 ring-gray-200'}`}
                aria-label="我的帳戶"
            >
                <i className="fas fa-user-circle text-3xl text-indigo-600"></i>
            </button>
            <BottomTabBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            {selectedProduct && (
                <GenerationModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onPushSuccess={() => {
                        setIsModalOpen(false);
                        setCurrentPage('records');
                    }}
                    product={selectedProduct}
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
                {/* [核心修正] 使用來自後台設定的動態價格 */}
                <p>每次新增帳號將從您的餘額中扣除 US${(appSettings?.catPoolPrice || 5.00).toFixed(2)} 的費用。</p>
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

