import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners.js';
import { addData, deleteDataByRef, updateData } from '../firebase/config';

// 1. 建立 Context 物件
const UserContext = createContext();

// 2. 建立一個自定義 Hook (useUserContext)，方便前台元件存取
export const useUserContext = () => useContext(UserContext);

// 3. 建立 Provider 元件 (UserProvider)
export const UserProvider = ({ children }) => {
    // a. 從 AuthContext 取得使用者資訊和全域功能
    const { user, userId, appId, showAlert } = useAuthContext();
    
    // b. 監聽所有「使用者專屬」和「公開」的資料集合
    const { products, poolAccounts, teamMembers, pendingInvitations, records, appSettings } = useFirestoreListeners(
        'user',
        appId,
        userId,
        !!user, // 只有在 user 物件存在時，才開始監聽
        useCallback(() => {}, [])
    );

    // c. 計算衍生狀態 (從原始資料計算出的新資料)
    const balance = useMemo(() => (records || []).reduce((acc, record) => acc + (record.amount || 0), 0), [records]);
    
    // d. 封裝所有「使用者專屬」的業務邏輯
    const handleRecharge = async (amount) => {
        if (!userId || !appId || !amount || amount <= 0) return;
        const newRecord = {
            type: 'deposit',
            description: '帳戶儲值',
            date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
            amount: amount,
            status: '成功',
            userId: userId,
        };
        try {
            await addData(`artifacts/${appId}/users/${userId}/records`, newRecord);
            showAlert(`🎉 成功儲值 US$${amount.toFixed(2)}！`);
        } catch (error) {
            console.error("儲值失敗:", error);
            showAlert("儲值失敗，請稍後再試。");
        }
    };

    const handleAddAccount = async () => {
        if (!userId || !appId || !appSettings) return;

        const catPoolPrice = appSettings.catPoolPrice || 5.00;

        const namePrefixes = ['Creative', 'Digital', 'Awesome', 'Super', 'Pro', 'Global'];
        const nameSuffixes = ['Creator', 'Mind', 'Guru', 'World', 'Expert', 'Hub'];
        const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook 粉絲專頁', 'X (Twitter)'];
        
        const newAccountData = {
            name: `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]}${nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]}${Math.floor(Math.random() * 100)}`,
            platform: platforms[Math.floor(Math.random() * platforms.length)],
            avatar: `https://placehold.co/100x100/ede9fe/5b21b6?text=新`,
            createdAt: new Date(),
            userId: userId,
        };

        const newExpenseRecord = {
            type: 'expense',
            description: `費用: 購買貓池帳號 (${newAccountData.name})`,
            date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
            amount: -catPoolPrice,
            status: '成功',
            userId: userId,
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

    const updateUserProfile = async (profileData) => {
        if (!userId || !appId || !teamMembers) {
            showAlert("錯誤：無法更新個人資料，使用者資料不完整。");
            return;
        }
        const currentUserInTeam = (teamMembers || []).find(member => member.userId === userId);
        if (currentUserInTeam) {
            try {
                const dataToUpdate = {
                    name: profileData.username,
                    referrerId: profileData.referrerId,
                    phone: profileData.phone,
                };
                await updateData(`artifacts/${appId}/public/data/team_members`, currentUserInTeam.id, dataToUpdate);
                showAlert('個人資料已成功儲存！');
            } catch (error) {
                console.error("更新個人資料失敗:", error);
                showAlert('儲存失敗，請稍後再試。');
            }
        } else {
            showAlert('錯誤：在團隊中找不到您的資料。');
        }
    };
    
    // e. 組合所有要提供給前台子元件的 value
    const value = {
        products,
        appSettings,
        poolAccounts,
        teamMembers,
        pendingInvitations,
        records,
        balance,
        // showAlert 和 closeAlert 由 AuthContext 提供，這裡不再重複提供
        handleRecharge,
        handleAddAccount,
        handleInvite,
        updateUserProfile,
    };

    // f. 透過 Provider 將 value 廣播出去
    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

