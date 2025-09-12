import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, onSnapshot, writeBatch, doc, addDoc, deleteDoc } from "firebase/firestore";

let authInstance, firestore, currentAppId, user;

// --- 動態設定載入 ---
// 優先嘗試從 Vite 環境變數讀取，若失敗則回退到 Canvas 的全域變數
const getFirebaseConfig = () => {
    // 1. 嘗試 Vite 環境變數
    const viteConfig = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
    if (viteConfig.apiKey) {
        console.log("Firebase config loaded from Vite environment variables.");
        return viteConfig;
    }

    // 2. 回退到 Canvas 環境的全域變數
    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        try {
            console.log("Firebase config loaded from Canvas environment.");
            return JSON.parse(__firebase_config);
        } catch (e) {
            console.error("Failed to parse __firebase_config from Canvas environment:", e);
            return null;
        }
    }

    // 3. 找不到任何設定
    console.warn("Firebase configuration not found in Vite env or Canvas environment.");
    return null;
};

const firebaseConfig = getFirebaseConfig();

// --- Firebase 初始化 ---
// 只有在成功載入設定後才進行初始化
if (firebaseConfig) {
    try {
        const app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        firestore = getFirestore(app);
        currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
    } catch (e) {
        console.error("Firebase initialization failed:", e);
    }
}

/**
 * 初始化 Firebase 並處理使用者認證
 * @returns {Promise<object>}
 */
export const initializeFirebase = () => new Promise((resolve, reject) => {
    if (!authInstance) {
        const errorMessage = "Firebase is not configured correctly. Please check your .env file or the platform's environment settings.";
        console.error(errorMessage);
        return reject(new Error(errorMessage));
    }
    const unsubscribe = onAuthStateChanged(authInstance, async (authUser) => {
        unsubscribe(); // 取得首次認證狀態後就取消監聽
        if (authUser) {
            user = authUser;
            resolve({ authInstance, firestore, currentAppId, user });
        } else {
            try {
                const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                if (token) {
                    const userCredential = await signInWithCustomToken(authInstance, token);
                    user = userCredential.user;
                } else {
                    const userCredential = await signInAnonymously(authInstance);
                    user = userCredential.user;
                }
                resolve({ authInstance, firestore, currentAppId, user });
            } catch (error) {
                console.error("Sign in failed:", error);
                reject(error);
            }
        }
    }, reject);
});

/**
 * 設定 Firestore 的即時監聽器，並在資料為空時植入初始資料
 * @param {string} appId - 應用程式 ID
 * @param {string} userId - 使用者 ID
 * @param {Array<object>} listeners - 監聽器設定陣列
 * @param {Function} onInitialLoadComplete - 所有監聽器首次載入完成時的回呼
 * @returns {Array<Function>} - 一個包含所有取消監聽函式的陣列
 */
export const setupListeners = (appId, userId, listeners, onInitialLoadComplete) => {
    if (!firestore) throw new Error("Firestore is not initialized.");
    
    // [修正] 增加保護機制，確保 listeners 是一個陣列
    if (!Array.isArray(listeners)) {
        console.error("setupListeners expects 'listeners' to be an array, but received:", typeof listeners);
        if (typeof onInitialLoadComplete === 'function') {
            onInitialLoadComplete(); // 確保即使出錯，也能觸發完成回呼
        }
        return []; // 返回一個空的取消監聽陣列
    }

    let loadCount = 0;
    const totalListeners = listeners.length;

    const checkAllLoaded = () => {
        loadCount++;
        if (loadCount === totalListeners) {
            onInitialLoadComplete();
        }
    };

    return listeners.map(({ name, setter, initialData, isPublic }) => {
        const path = isPublic
            ? `artifacts/${appId}/public/data/${name}`
            : `artifacts/${appId}/users/${userId}/${name}`;

        const q = collection(firestore, path);

        return onSnapshot(q, async (querySnapshot) => {
            if (querySnapshot.empty && initialData && initialData.length > 0) {
                console.log(`Seeding '${name}'...`);
                const batch = writeBatch(firestore);
                initialData.forEach(item => {
                    const docRef = doc(collection(firestore, path));
                    const { id, ...data } = item;
                    batch.set(docRef, data);
                });
                await batch.commit();
                setter(initialData.map(item => ({ ...item, id: crypto.randomUUID() })));
            } else {
                setter(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            }
            if (loadCount < totalListeners) checkAllLoaded();
        }, (error) => {
            console.error(`Error fetching ${name}:`, error);
            if (loadCount < totalListeners) checkAllLoaded();
        });
    });
};

/**
 * 向指定的 Firestore 集合新增一筆文件
 * @param {string} path - 集合的路徑
 * @param {object} data - 要新增的資料
 * @param {boolean} returnRef - 是否返回文件的引用而非 ID
 * @returns {Promise<string|object>} - 新文件的 ID 或引用
 */
export const addData = async (path, data, returnRef = false) => {
    if (!firestore) throw new Error("Firestore is not initialized.");
    const docRef = await addDoc(collection(firestore, path), data);
    return returnRef ? docRef : docRef.id;
};

/**
 * 根據文件引用刪除 Firestore 中的文件
 * @param {object} docRef - 文件的引用
 */
export const deleteDataByRef = async (docRef) => {
    if (!firestore) throw new Error("Firestore is not initialized.");
    await deleteDoc(docRef);
};

