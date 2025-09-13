import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners';
import { addData, deleteDataByRef } from '../firebase/config';
import { signOut } from 'firebase/auth';

// 1. 建立 Context 物件
// 這就像建立一個廣播電台，準備向外廣播訊號（資料）
const DataContext = createContext();

// 2. 建立一個自定義 Hook (useData)
// 讓其他元件可以方便地「收聽」这个廣播電台
export const useData = () => useContext(DataContext);

// 3. 建立 Provider 元件 (DataProvider)
// 這是廣播電台的核心，它負責收集所有要廣播的資訊，並將它們傳送出去
export const DataProvider = ({ children }) => {
    // a. 使用自定義 Hooks 處理底層邏輯
    const { auth, user, userId, appId, isLoading, initError } = useAuth();
    
    const onFirestoreLoadComplete = useCallback(() => {
        // 這個回呼函式目前沒有做任何事，但穩定性很重要
    }, []);

    const { poolAccounts, teamMembers, pendingInvitations, records } = useFirestoreListeners(
        appId,
        userId,
        !!user, // 只要 user 存在，就代表可以開始監聽
        onFirestoreLoadComplete // 傳入穩定的函式
    );

    // b. 建立全域 UI 狀態 (例如：彈出提示)
    const [alert, setAlert] = useState({ isOpen: false, message: '', onClose: null });

    // c. 計算衍生狀態 (從原始資料計算出的新資料)
    const balance = useMemo(() => (records || []).reduce((acc, record) => acc + (record.amount || 0), 0), [records]);
    
    // d. 封裝核心業務邏輯 (使用者可以執行的操作)
    const showAlert = useCallback((message, onCloseCallback = null) => {
        setAlert({ isOpen: true, message, onClose: onCloseCallback });
    }, []);

    const handleAddAccount = async () => {
        if (!userId || !appId) return;

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
            await addData(`artifacts/${appId}/users/${userId}/poolAccounts`, newAccountData);
            await addData(`artifacts/${appId}/users/${userId}/records`, newExpenseRecord);
            showAlert(`帳號 ${newAccountData.name} 已經建立！`);
        } catch (error) {
             console.error("購買貓池帳號失敗: ", error);
             showAlert('購買失敗，請稍後再試。');
        }
    };
    
    const handleInvite = async ({ email, role }) => {
        if (!appId) return;
        const newInvitation = { email, role, status: '邀請中...' };
        try {
            const newInvitationRef = await addData(`artifacts/${appId}/public/data/team_invitations`, newInvitation, true);
            setTimeout(async () => {
                const name = email.split('@')[0];
                const newMember = {
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    role: role,
                    avatar: `https://placehold.co/100x100/e0f2fe/075985?text=${name.charAt(0).toUpperCase()}`,
                    status: '離線'
                };
                try {
                    await addData(`artifacts/${appId}/public/data/team_members`, newMember);
                    if (newInvitationRef) {
                        await deleteDataByRef(newInvitationRef);
                    }
                } catch (e) { console.error("從邀請轉換為成員失敗:", e); }
            }, 3000);
        } catch (error) { console.error("送出邀請失敗: ", error); }
    };
    
    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (error) {
            console.error("登出失敗:", error);
        }
    };

    const handleRecharge = async (amount) => {
        if (!userId || !appId || !amount || amount <= 0) return;
        const newRecord = {
            type: 'deposit',
            description: '帳戶儲值',
            date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
            amount: amount,
            status: '成功',
        };
        try {
            await addData(`artifacts/${appId}/users/${userId}/records`, newRecord);
            showAlert(`🎉 成功儲值 NT$${amount.toFixed(2)}！`);
        } catch (error) {
            console.error("儲值失敗:", error);
            showAlert("儲值失敗，請稍後再試。");
        }
    };

    const closeAlert = useCallback(() => {
        if (alert.onClose) {
            alert.onClose();
        }
        setAlert({ isOpen: false, message: '', onClose: null });
    }, [alert]);
    
    // e. 組合所有要廣播出去的資料和函式
    const value = {
        isLoading,
        user,
        auth,
        userId,
        appId,
        initError,
        poolAccounts,
        teamMembers,
        pendingInvitations,
        records,
        balance,
        handleAddAccount,
        handleInvite,
        handleSignOut,
        handleRecharge,
        alert,
        showAlert,
        closeAlert,
    };

    // f. 透過 Provider 將 value 廣播給所有子元件
    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

