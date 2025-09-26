import { useState, useEffect } from 'react';
import { setupListeners } from '../firebase/config';
import { where } from "firebase/firestore";
import {
    initialPoolAccountsData,
    initialTeamMembersData,
    initialRecordsData
} from '../data/mockData';

export const useFirestoreListeners = (scope, appId, userId, isReadyToListen, onInitialLoadComplete) => {
    const [appSettings, setAppSettings] = useState(null);
    const [products, setProducts] = useState([]);
    const [poolAccounts, setPoolAccounts] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [records, setRecords] = useState([]);
    const [paymentInfo, setPaymentInfo] = useState(null);
    const [allTeamMembers, setAllTeamMembers] = useState([]);
    const [allPoolAccounts, setAllPoolAccounts] = useState([]);
    const [allUserRecords, setAllUserRecords] = useState([]);

    useEffect(() => {
        if (!isReadyToListen) {
            return () => {};
        }

        const allListeners = [
            // --- 公開資料 (Public Data) ---
            { name: 'app_settings', setter: setAppSettings, isPublic: true, scope: ['user', 'admin'], isSingleDoc: true, docId: 'global' },
            { 
                name: 'products', 
                setter: setProducts, 
                isPublic: true, 
                scope: ['user', 'admin'],
                queryConstraints: scope === 'user' ? [where('status', '==', 'published')] : []
            },
            // [核心修正] 讓 admin 也能讀取 team_members，並使用正確的 state setter
            { 
                name: 'team_members', 
                setter: scope === 'admin' ? setAllTeamMembers : setTeamMembers, 
                isPublic: true, 
                scope: ['user', 'admin'] 
            },
            { name: 'team_invitations', setter: setPendingInvitations, isPublic: true, scope: ['user'] },
            
            // --- 私人資料 (Private Data) ---
            { name: 'poolAccounts', setter: setPoolAccounts, isPublic: false, scope: ['user'] },
            { name: 'records', setter: setRecords, isPublic: false, scope: ['user'] },
            { 
                name: 'private', 
                setter: setPaymentInfo, 
                isPublic: false, 
                scope: ['user'], 
                isSingleDoc: true, 
                docId: 'payment_info'
            },

            // --- 集合群組 (僅限 'admin' scope) ---
            { 
                name: 'poolAccounts', 
                setter: setAllPoolAccounts, 
                isPublic: false, 
                scope: ['admin'], 
                isCollectionGroup: true,
            },
            { 
                name: 'records', 
                setter: setAllUserRecords, 
                isPublic: false, 
                scope: ['admin'], 
                isCollectionGroup: true,
                queryConstraints: [where('type', '==', 'commission')]
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

    return { appSettings, products, poolAccounts, teamMembers, pendingInvitations, records, paymentInfo, allTeamMembers, allPoolAccounts, allUserRecords };
};