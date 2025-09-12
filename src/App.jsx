import React, { useState, useEffect, useCallback, useMemo } from 'react';

// 頁面元件
import ProductsPage from './pages/ProductsPage';
import CatPoolPage from './pages/CatPoolPage';
import TeamPage from './pages/TeamPage';
import RecordsPage from './pages/RecordsPage';
import AccountPage from './pages/Account/AccountPage';
import EditProfilePage from './pages/Account/EditProfilePage';
import TransactionsPage from './pages/Account/TransactionsPage';

// 共用元件
import StyleInjector from './components/StyleInjector';
import BottomTabBar from './components/BottomTabBar';
import GenerationModal from './components/GenerationModal';
import ConfirmationModal from './components/ConfirmationModal';
import AlertModal from './components/AlertModal';

// Firebase 設定
import { initializeFirebase, setupListeners, addData, deleteDataByRef } from './firebase/config';

// 假資料
import {
    initialProducts,
    initialPoolAccountsData,
    initialTeamMembersData,
    initialRecordsData
} from './data/mockData';

// 應用程式的「大腦」與「指揮中心」
export default function App() {
    const [products] = useState(initialProducts);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState('products');
    const [accountView, setAccountView] = useState('main'); 
    
    // Firebase 相關狀態
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [appId, setAppId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 從 Firestore 讀取的資料狀態
    const [poolAccounts, setPoolAccounts] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [records, setRecords] = useState([]);

    // UI 互動狀態
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

    // 初始化 Firebase
    useEffect(() => {
        const init = async () => {
            try {
                const { authInstance, firestore, currentAppId, user } = await initializeFirebase();
                setAuth(authInstance);
                setDb(firestore);
                setAppId(currentAppId);
                if(user) {
                    setUserId(user.uid);
                }
                setIsAuthReady(true);
            } catch (error) {
                console.error("Firebase 初始化失敗:", error);
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // 監聽 Firestore 資料
    useEffect(() => {
        if (!isAuthReady || !db || !userId || !appId) {
            if (isAuthReady) setIsLoading(false); // If auth is ready but something else is missing, stop loading
            return;
        };

        const listeners = [
            { name: 'poolAccounts', setter: setPoolAccounts, initialData: initialPoolAccountsData, isPublic: false },
            { name: 'records', setter: setRecords, initialData: initialRecordsData, isPublic: false },
            { name: 'team_members', setter: setTeamMembers, initialData: initialTeamMembersData, isPublic: true },
            { name: 'team_invitations', setter: setPendingInvitations, initialData: [], isPublic: true },
        ];

    const unsubscribers = setupListeners(appId, userId, listeners, () => setIsLoading(false));

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [isAuthReady, db, userId, appId]);
    
    // 將會計總額移至此處計算
    const balance = useMemo(() => (records || []).reduce((acc, record) => acc + (record.amount || 0), 0), [records]);


    // 計算今天已推播過的帳號
    const todaysPushedAccounts = useMemo(() => {
        if (!records) return new Set();
        const todayStr = new Date().toLocaleDateString('sv-SE');
        const accountNames = records
            .filter(r => r.type === 'commission' && r.date?.startsWith(todayStr))
            .map(r => r.platformDetails?.account);
        return new Set(accountNames);
    }, [records]);
    
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

    const handleManageAccountClick = (account) => {
        const date = account.createdAt?.toDate ? account.createdAt.toDate() : account.createdAt;
        
        if (date) {
            const formattedDate = new Date(date).toLocaleString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            setAlertModal({ isOpen: true, message: `帳號 "${account.name}"\n創建於：\n${formattedDate}` });
        } else {
            setAlertModal({ isOpen: true, message: `帳號 "${account.name}" 的創建日期不明。` });
        }
    };
    
    const handleAddAccount = async () => {
        setConfirmModalOpen(false); 
    
        if (balance >= 200) {
            const namePrefixes = ['Creative', 'Digital', 'Awesome', 'Super', 'Pro', 'Global'];
            const nameSuffixes = ['Creator', 'Mind', 'Guru', 'World', 'Expert', 'Hub'];
            const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook 粉絲專頁', 'X (Twitter)'];
            
            const newAccountData = {
                name: `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]}${nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]}${Math.floor(Math.random() * 100)}`,
                platform: platforms[Math.floor(Math.random() * platforms.length)],
                avatar: `https://placehold.co/100x100/ede9fe/5b21b6?text=新`,
                createdAt: new Date(),
            };

            const newExpenseRecord = {
                type: 'expense',
                description: `費用: 購買貓池帳號 (${newAccountData.name})`,
                date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
                amount: -200,
                status: '成功',
            };
            
            try {
                await addData(db, `artifacts/${appId}/users/${userId}/poolAccounts`, newAccountData);
                await addData(db, `artifacts/${appId}/users/${userId}/records`, newExpenseRecord);
                setAlertModal({ isOpen: true, message: `帳號 ${newAccountData.name} 已經建立！` });
            } catch (error) {
                 console.error("購買貓池帳號失敗: ", error);
                 setAlertModal({ isOpen: true, message: '購買失敗，請稍後再試。' });
            }
        } else {
            setAlertModal({ isOpen: true, message: '您的帳戶餘額不足以支付 NT$200 的費用。' });
        }
    };
    
    const handleInvite = async ({ email, role }) => {
        if (!db || !appId) return;

        const newInvitation = { email, role, status: '邀請中...' };
        
        try {
            const newInvitationRef = await addData(db, `artifacts/${appId}/public/data/team_invitations`, newInvitation, true);
            
            setTimeout(async () => {
                const name = email.split('@')[0];
                const newMember = {
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    role: role,
                    avatar: `https://placehold.co/100x100/e0f2fe/075985?text=${name.charAt(0).toUpperCase()}`,
                    status: '離線'
                };
                try {
                    await addData(db, `artifacts/${appId}/public/data/team_members`, newMember);
                    if (newInvitationRef) {
                        await deleteDataByRef(db, newInvitationRef);
                    }
                } catch (e) {
                    console.error("從邀請轉換為成員失敗:", e);
                }
            }, 3000);

        } catch (error) {
            console.error("送出邀請失敗: ", error);
        }
    };


    // 根據 `accountView` 狀態渲染不同的「我的」子頁面
    const renderAccountPage = () => {
        switch (accountView) {
            case 'editProfile':
                return <EditProfilePage onBack={() => setAccountView('main')} />;
            case 'transactions':
                return <TransactionsPage onBack={() => setAccountView('main')} records={records} />;
            case 'main':
            default:
                return <AccountPage onNavigate={setAccountView} records={records} userId={userId} />;
        }
    };
    
    // 根據 `currentPage` 狀態渲染不同的主頁面
    const renderPage = () => {
        switch (currentPage) {
            case 'products':
                return <ProductsPage products={products} onGenerateClick={handleGenerateClick} />;
            case 'catpool':
                return <CatPoolPage poolAccounts={poolAccounts} onAddAccountClick={() => setConfirmModalOpen(true)} onManageClick={handleManageAccountClick} pushedToday={todaysPushedAccounts} />;
            case 'team':
                return <TeamPage teamMembers={teamMembers} pendingInvitations={pendingInvitations} handleInvite={handleInvite} />;
            case 'records':
                return <RecordsPage records={records} />;
            case 'account':
                return renderAccountPage();
            default:
                return <ProductsPage products={products} onGenerateClick={handleGenerateClick} />;
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin fa-3x text-indigo-600"></i>
                    <p className="mt-4 text-gray-600">正在連接雲端服務...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            <StyleInjector />
            <main className="main-content flex-1 overflow-y-auto pb-[var(--tab-bar-height)]">
                {renderPage()}
            </main>
            
            <BottomTabBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
            
            {selectedProduct && (
                <GenerationModal 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onPushSuccess={handlePushSuccess}
                    product={selectedProduct}
                    poolAccounts={poolAccounts}
                    db={db}
                    userId={userId}
                    appId={appId}
                    pushedToday={todaysPushedAccounts}
                />
            )}
            <ConfirmationModal 
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleAddAccount}
                title="確認新增帳號"
            >
                <p>每次新增帳號將從您的餘額中扣除 NT$200 的費用。</p>
                <p className="mt-2 font-semibold">您確定要繼續嗎？</p>
            </ConfirmationModal>
            <AlertModal 
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal({ isOpen: false, message: '' })}
                message={alertModal.message}
            />
        </div>
    );
}

