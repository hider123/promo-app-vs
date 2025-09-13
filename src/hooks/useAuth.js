import { useState, useEffect } from 'react';
import { initializeFirebase } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth'; // 引入 Firebase 的認證狀態監聽器

export const useAuth = () => {
    // --- 狀態定義 ---
    const [auth, setAuth] = useState(null);
    const [user, setUser] = useState(undefined); // [核心修正] 初始值設為 undefined，代表「狀態未知」
    const [appId, setAppId] = useState(null);
    const [initError, setInitError] = useState(null);

    // ---副作用 Hooks ---
    // Effect 1: 初始化 Firebase。這個 effect 只會在元件第一次掛載時執行一次。
    useEffect(() => {
        initializeFirebase()
            .then(({ authInstance, currentAppId }) => {
                // 初始化成功後，設定 auth 和 appId 狀態
                setAuth(authInstance);
                setAppId(currentAppId);
            })
            .catch((error) => {
                // 如果初始化失敗，則記錄錯誤
                console.error("Firebase a 初始化失敗:", error);
                setInitError("無法連接至雲端服務，請檢查您的網路連線或稍後再試。");
            });
    }, []); // 空的依賴陣列 [] 確保此 effect 只執行一次

    // Effect 2: 監聽認證狀態變化。這個 effect 會在 auth 物件準備就緒後執行。
    useEffect(() => {
        // 只有在 auth 物件成功初始化後，才設定監聽器
        if (auth) {
            // onAuthStateChanged 會回傳一個 unsubscribe 函式，用於之後的清理
            const unsubscribe = onAuthStateChanged(auth, (userState) => {
                // 當使用者的登入狀態改變時 (登入或登出)，這個回呼函式就會被觸發
                // userState 若使用者登入，會是 user 物件；若登出，則會是 null
                setUser(userState);
            });

            // 回傳清理函式：當元件卸載時，取消對認證狀態的監聽，以防止記憶體洩漏
            return unsubscribe;
        }
    }, [auth]); // 這個 effect 會在 auth 狀態改變時重新執行

    // --- 衍生狀態 ---
    // 只有當 user 狀態還是初始的 undefined 時，才代表應用程式正在載入
    const isLoading = user === undefined;

    // --- 回傳值 ---
    // 將所有需要的狀態和資訊回傳給 Context
    return { auth, user, userId: user?.uid, appId, isLoading, initError };
};

