import React, { createContext, useContext, useMemo, useCallback, useState } from 'react';
import { useAuthContext } from './AuthContext.jsx';
import { useFirestoreListeners } from '../hooks/useFirestoreListeners.js';
import { setData, addData, deleteDataByRef, updateData } from '../firebase/config';
import { getFunctions, httpsCallable } from "firebase/functions";

const UserContext = createContext();

export const useUserContext = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const { user, userId, appId, showAlert } = useAuthContext();
    const { products, poolAccounts, teamMembers, pendingInvitations, records, appSettings, paymentInfo } = useFirestoreListeners('user', appId, userId, !!user, useCallback(() => {}, []));
    const balance = useMemo(() => (records || []).reduce((acc, record) => acc + (record.amount || 0), 0), [records]);
    
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
        if (!userId || !appId) return;

        showAlert('正在為您建立新帳號，請稍候...');

        try {
            const functions = getFunctions();
            const createAccountFunction = httpsCallable(functions, 'createUniquePoolAccount');
            
            const result = await createAccountFunction();

            showAlert(result.data.message || '帳號已成功建立！');

        } catch (error) {
             console.error("購買貓池帳號失敗: ", error);
             showAlert(`購買失敗：${error.message}`);
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
                // 過濾掉值為 undefined 的欄位，避免意外覆蓋
                const dataToUpdate = Object.entries(profileData).reduce((acc, [key, value]) => {
                    if (value !== undefined) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});

                if (Object.keys(dataToUpdate).length > 0) {
                    await updateData(`artifacts/${appId}/public/data/team_members`, currentUserInTeam.id, dataToUpdate);
                    // 只有在不是僅更新推薦人ID時才顯示通用成功訊息
                    if (!('referrerId' in dataToUpdate && Object.keys(dataToUpdate).length === 1)) {
                         showAlert('✅ 個人資料已成功儲存！');
                    }
                }
            } catch (error) {
                console.error("更新個人資料失敗:", error);
                showAlert('儲存失敗，請稍後再試。');
            }
        } else {
             // 首次登入時，teamMembers 可能尚未包含當前用戶，這是正常的
            console.warn('在 teamMembers 中暫未找到當前用戶資料，可能正在同步中。');
        }
    };

    const handleWithdrawRequest = async ({ amount, paymentInfo }) => {
        if (!userId || !appId || !amount || amount <= 0 || !paymentInfo) {
            showAlert("提領申請資料不完整。");
            return;
        }

        const newRequest = {
            userId: userId,
            amount: amount,
            paymentInfo: paymentInfo,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };

        try {
            await addData(`artifacts/${appId}/public/data/withdrawal_requests`, newRequest);
            showAlert('✅ 提領申請已成功送出！\n我們將在 24 小時內完成審核。');
        } catch (error) {
            console.error("送出提領申請失敗:", error);
            showAlert("送出申請失敗，請稍後再試。");
        }
    };

    const handleUpdatePaymentInfo = async (newPaymentInfo) => {
        if (!userId || !appId) {
            showAlert("無法儲存設定，請重新登入。");
            return;
        }
        try {
            await setData(`artifacts/${appId}/users/${userId}/private`, 'payment_info', newPaymentInfo, { merge: true });
            showAlert('✅ 收款方式已成功儲存！');
        } catch (error) {
            console.error("更新收款方式失敗:", error);
            showAlert('儲存失敗，請稍後再試。');
        }
    };
    
    const value = {
        products,
        appSettings,
        poolAccounts,
        teamMembers,
        pendingInvitations,
        records,
        balance,
        paymentInfo,
        handleRecharge,
        handleAddAccount,
        handleInvite,
        updateUserProfile,
        handleWithdrawRequest,
        handleUpdatePaymentInfo,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};