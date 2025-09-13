import { useState, useEffect } from 'react';
import { setupListeners } from '../firebase/config';
import {
    initialPoolAccountsData,
    initialTeamMembersData,
    initialRecordsData
} from '../data/mockData';

/**
 * Custom Hook: 專門處理 Firestore 資料的即時監聽。
 * @param {string} appId - 應用程式 ID。
 * @param {string} userId - 使用者 ID。
 * @param {boolean} isReadyToListen - 是否可以開始監聽（例如：使用者是否已登入）。
 * @param {Function} onInitialLoadComplete - 所有監聽器首次載入完成時的回呼函式。
 * @returns {object} 一個包含所有即時資料狀態的物件。
 */
export const useFirestoreListeners = (appId, userId, isReadyToListen, onInitialLoadComplete) => {
    // 1. 為每個資料集合建立對應的 state
    const [poolAccounts, setPoolAccounts] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);
    const [records, setRecords] = useState([]);

    // 2. 使用 useEffect 來處理副作用（設定監聽器）
    useEffect(() => {
        // [防衛機制] 只有在明確可以開始監聽時 (例如：使用者已登入) 才繼續執行
        if (!isReadyToListen || !userId || !appId) {
            // 如果條件不滿足，明確地回傳一個空的清理函式，以增加程式的穩健性
            return () => {};
        }

        // 定義所有需要監聽的資料集合
        const listeners = [
            { name: 'poolAccounts', setter: setPoolAccounts, initialData: initialPoolAccountsData, isPublic: false },
            { name: 'records', setter: setRecords, initialData: initialRecordsData, isPublic: false },
            { name: 'team_members', setter: setTeamMembers, initialData: initialTeamMembersData, isPublic: true },
            { name: 'team_invitations', setter: setPendingInvitations, initialData: [], isPublic: true },
        ];

        // 執行監聽器設定，並取得所有取消監聽的函式
        const unsubscribers = setupListeners(appId, userId, listeners, onInitialLoadComplete);

        // 回傳一個清理函式
        // 當元件卸載或依賴項改變時，React 會自動呼叫這個函式
        return () => {
            // 遍歷並呼叫所有取消監聽的函式，以斷開與 Firebase 的連線，防止記憶體洩漏
            unsubscribers.forEach(unsub => unsub());
        };
    }, [isReadyToListen, userId, appId, onInitialLoadComplete]); // 依賴項陣列：當這裡的任何一個值改變時，effect 會重新執行

    // 3. 回傳所有資料狀態
    return { poolAccounts, teamMembers, pendingInvitations, records };
};

