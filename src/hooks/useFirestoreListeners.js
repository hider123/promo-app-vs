import { useState, useEffect } from 'react';
import { setupListeners } from '../firebase/config';
import { where } from "firebase/firestore";
import {
    initialPoolAccountsData,
    initialTeamMembersData,
    initialRecordsData
} from '../data/mockData';

export const useFirestoreListeners = (scope, appId, userId, isReadyToListen, onInitialLoadComplete) => {
    // 1. 為每個資料集合建立對應的 state
    const [appSettings, setAppSettings] = useState(null);
    const [products, setProducts] = useState([]);
    const [poolAccounts, setPoolAccounts] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [records, setRecords] = useState([]);
    const [allUsers, setAllUsers] = useState([]);

    // 2. 使用 useEffect 來處理副作用（設定監聽器）
    useEffect(() => {
        if (!isReadyToListen) {
            return () => {};
        }

        const allListeners = [
            // --- 公開資料 (Public Data) ---
            { name: 'app_settings', setter: setAppSettings, initialData: [{ id: 'global', catPoolPrice: 5.00, commissionRate: 0.05, copyPushCommission: 1.50, copyPushLimit: 3, midTierThreshold: 20, highTierThreshold: 100, buyInRate: 7.5, sellOutRate: 7.0 }], isPublic: true, scope: ['user', 'admin'], isSingleDoc: true, docId: 'global', seedOnEmpty: true },
            { 
                name: 'products', 
                setter: setProducts, 
                isPublic: true, 
                scope: ['user', 'admin'],
                queryConstraints: scope === 'user' ? [where('status', '==', 'published')] : []
            },
            { name: 'team_members', setter: setTeamMembers, initialData: initialTeamMembersData, isPublic: true, scope: ['user'], seedOnEmpty: true },
            { name: 'team_invitations', setter: setPendingInvitations, initialData: [], isPublic: true, scope: ['user'], seedOnEmpty: true },
            
            // --- 私人資料 (Private Data) ---
            { name: 'poolAccounts', setter: setPoolAccounts, initialData: initialPoolAccountsData, isPublic: false, scope: ['user'], seedOnEmpty: true },
            { name: 'records', setter: setRecords, initialData: initialRecordsData, isPublic: false, scope: ['user'], seedOnEmpty: true },

            // --- 管理員資料 (僅限 'admin' scope) ---
            { 
                name: 'users', 
                setter: setAllUsers, 
                isPublic: true, // 'users' 集合是公開的
                scope: ['admin'], 
                isCollectionGroup: false, // 這是一個頂層集合
                queryConstraints: [] // 獲取所有用戶
            },
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
    return { appSettings, products, poolAccounts, teamMembers, pendingInvitations, records, allUsers };
};