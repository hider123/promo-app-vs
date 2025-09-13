import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, onSnapshot, writeBatch, doc, addDoc, deleteDoc } from "firebase/firestore";

// --- 全域變數 ---
// 為了防止重複初始化，我們將 Firebase 的實例儲存在模組層級的全域變數中
let app, authInstance, firestore, currentAppId;

// --- 動態設定載入 ---
/**
 * 動態地從環境中取得 Firebase 設定。
 * 優先順序：Vite 環境變數 > Canvas 全域變數。
 * @returns {object|null} Firebase 設定物件或 null。
 */
const getFirebaseConfig = () => {
    // 1. 嘗試從 Vite 環境變數讀取 (適用於本地開發)
    const viteConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    if (viteConfig.apiKey) {
        console.log("Firebase 設定已從 Vite 環境變數載入。");
        return viteConfig;
    }

    // 2. 回退到從 Canvas 環境的全域變數讀取
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        try {
            console.log("Firebase 設定已從 Canvas 環境載入。");
            return JSON.parse(__firebase_config);
        } catch (e) {
            console.error("從 Canvas 環境解析 __firebase_config 失敗:", e);
            return null;
        }
    }

    // 3. 找不到任何設定
    console.warn("在 Vite 或 Canvas 環境中均未找到 Firebase 設定。");
    return null;
};

const firebaseConfig = getFirebaseConfig();

/**
 * 初始化 Firebase 服務。
 * 這個函式只負責建立服務實例，並處理一次性的初始權杖登入。
 * 持續的認證狀態監聽由 useAuth Hook 處理。
 * @returns {Promise<object>} 一個包含 authInstance, firestore, currentAppId 的物件。
 */
export const initializeFirebase = async () => {
    if (!firebaseConfig) {
        const errorMessage = "未找到 Firebase 設定，請檢查您的環境變數。";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        if (!app) { // 使用 "if (!app)" 確保 Firebase App 只被初始化一次
            app = initializeApp(firebaseConfig);
            authInstance = getAuth(app);
            firestore = getFirestore(app);
            currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        }

        // 如果當前沒有使用者，則嘗試使用由 Canvas 提供的初始權杖進行一次性登入
        if (authInstance.currentUser === null) {
             const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
             if (token) {
                 await signInWithCustomToken(authInstance, token);
             }
        }
        
        // 直接回傳已初始化的服務實例
        return { authInstance, firestore, currentAppId };
    } catch (e) {
        console.error("Firebase 初始化失敗:", e);
        throw e; // 將錯誤向上拋出，讓呼叫它的地方 (useAuth Hook) 可以捕捉到
    }
};

/**
 * 設定多個 Firestore 集合的即時監聽器。
 * @param {string} appId - 應用程式 ID。
 * @param {string} userId - 使用者 ID。
 * @param {Array<object>} listeners - 監聽器設定陣列。
 * @param {Function} onInitialLoadComplete - 所有監聽器首次載入完成時的回呼。
 * @returns {Array<Function>} 一個包含所有取消監聽函式的陣列。
 */
export const setupListeners = (appId, userId, listeners, onInitialLoadComplete) => {
    // ... setupListeners 的邏輯保持不變 ...
};

/**
 * 向指定的 Firestore 集合新增一筆文件。
 * @param {string} path - 集合的路徑。
 * @param {object} data - 要新增的資料。
 * @param {boolean} returnRef - 是否返回文件的引用而非 ID。
 * @returns {Promise<string|object>} 新文件的 ID 或引用。
 */
export const addData = async (path, data, returnRef = false) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    const docRef = await addDoc(collection(firestore, path), data);
    return returnRef ? docRef : docRef.id;
};

/**
 * 根據文件引用刪除 Firestore 中的文件。
 * @param {object} docRef - 文件的引用。
 */
export const deleteDataByRef = async (docRef) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    await deleteDoc(docRef);
};

