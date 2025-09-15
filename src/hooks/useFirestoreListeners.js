import { useState, useEffect } from 'react';
import { setupListeners } from '../firebase/config';
import {
    initialPoolAccountsData,
    initialTeamMembersData,
    initialRecordsData
} from '../data/mockData';

/**
 * Custom Hook: 專門處理 Firestore 資料的即時監聽。
 * @param {string} scope - 監聽的範圍，'user' 或 'admin'。
 * @param {string} appId - 應用程式 ID。
 * @param {string} userId - 使用者 ID。
 * @param {boolean} isReadyToListen - 是否可以開始監聽。
 * @param {Function} onInitialLoadComplete - 所有監聽器首次載入完成時的回呼函式。
 * @returns {object} 一個包含所有即時資料狀態的物件。
 */
export const useFirestoreListeners = (scope, appId, userId, isReadyToListen, onInitialLoadComplete) => {
    // 1. 為每個資料集合建立對應的 state
    const [appSettings, setAppSettings] = useState(null);
    const [products, setProducts] = useState([]);
    const [poolAccounts, setPoolAccounts] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [records, setRecords] = useState([]);

    // 2. 使用 useEffect 來處理副作用（設定監聽器）
    useEffect(() => {
        if (!isReadyToListen) {
            return () => {};
        }

        const allListeners = [
            // --- 公開資料 (Public Data) ---
            { name: 'app_settings', setter: setAppSettings, initialData: [{ id: 'global', catPoolPrice: 5.00, commissionRate: 0.05, copyPushCommission: 1.50 }], isPublic: true, scope: ['user', 'admin'], isSingleDoc: true, docId: 'global' },
            { name: 'products', setter: setProducts, isPublic: true, scope: ['user', 'admin'] },
            { name: 'team_members', setter: setTeamMembers, initialData: initialTeamMembersData, isPublic: true, scope: ['user'] },
            { name: 'team_invitations', setter: setPendingInvitations, initialData: [], isPublic: true, scope: ['user'] },
            
            // --- 私人資料 (Private Data) ---
            { name: 'poolAccounts', setter: setPoolAccounts, initialData: initialPoolAccountsData, isPublic: false, scope: ['user'] },
            { name: 'records', setter: setRecords, initialData: initialRecordsData, isPublic: false, scope: ['user'] },
        ];
        
        const listenersToSetup = allListeners.filter(l => l.scope.includes(scope));

        const unsubscribers = setupListeners(appId, userId, listenersToSetup, onInitialLoadComplete);

        return () => {
            if (unsubscribers && Array.isArray(unsubscribers)) {
                unsubscribers.forEach(unsub => unsub());
            }
        };
    }, [scope, isReadyToListen, userId, appId, onInitialLoadComplete]);

    // 3. 回傳所有資料狀態
    return { appSettings, products, poolAccounts, teamMembers, pendingInvitations, records };
};

