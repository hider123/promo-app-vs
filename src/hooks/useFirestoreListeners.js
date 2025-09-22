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
            { name: 'app_settings', setter: setAppSettings, initialData: [{ id: 'global', catPoolPrice: 5.00, commissionRate: 0.05, copyPushCommission: 1.50, copyPushLimit: 3, midTierThreshold: 20, highTierThreshold: 100, buyInRate: 7.5, sellOutRate: 7.0 }], isPublic: true, scope: ['user', 'admin'], isSingleDoc: true, docId: 'global', seedOnEmpty: true },
            { 
                name: 'products', 
                setter: setProducts, 
                isPublic: true, 
                scope: ['user', 'admin'],
                queryConstraints: scope === 'user' ? [where('status', '==', 'published')] : []
            },
            { name: 'team_members', setter: scope === 'admin' ? setAllTeamMembers : setTeamMembers, initialData: initialTeamMembersData, isPublic: true, scope: ['user', 'admin'], seedOnEmpty: true },
            { name: 'team_invitations', setter: setPendingInvitations, initialData: [], isPublic: true, scope: ['user'], seedOnEmpty: true },
            
            // --- 私人資料 (Private Data) ---
            { name: 'poolAccounts', setter: setPoolAccounts, initialData: initialPoolAccountsData, isPublic: false, scope: ['user'], seedOnEmpty: true },
            { name: 'records', setter: setRecords, initialData: initialRecordsData, isPublic: false, scope: ['user'], seedOnEmpty: true },
            { 
                name: 'private', 
                setter: setPaymentInfo, 
                // [修改] 根據新的需求，更新預設資料結構
                initialData: [{ 
                    id: 'payment_info', 
                    alipay: { account: '', qrCodeUrl: '' }, 
                    wechat: { account: '', qrCodeUrl: '' }, 
                    bankcard: { number: '', name: '', bankName: '' } 
                }],
                isPublic: false, 
                scope: ['user'], 
                isSingleDoc: true, 
                docId: 'payment_info', 
                seedOnEmpty: true 
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

    return { appSettings, products, poolAccounts, teamMembers, pendingInvitations, records, paymentInfo, allUserRecords, allTeamMembers, allPoolAccounts };
};