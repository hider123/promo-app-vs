import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, onSnapshot, writeBatch, doc, addDoc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// --- 全域變數 ---
// 為了防止重複初始化，我們將 Firebase 的實例儲存在模組層級的全域變數中
let app, authInstance, firestore, storage, currentAppId;

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
 * @returns {Promise<object>} 一個包含 authInstance, firestore, storage, currentAppId 的物件。
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
            storage = getStorage(app);
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
        return { authInstance, firestore, storage, currentAppId };
    } catch (e) {
        console.error("Firebase 初始化失敗:", e);
        throw e; // 將錯誤向上拋出，讓呼叫它的地方 (useAuth Hook) 可以捕捉到
    }
};

/**
 * 上傳檔案到 Firebase Storage 的通用函式。
 * @param {File} file - 要上傳的檔案。
 * @param {string} path - 儲存的路徑 (例如: 'products/')。
 * @param {Function} onProgress - 上傳進度的回呼函式。
 * @returns {Promise<string>} - 檔案的公開下載 URL。
 */
export const uploadFile = (file, path, onProgress) => {
    return new Promise((resolve, reject) => {
        if (!storage || !authInstance.currentUser) {
            return reject(new Error("權限不足：必須登入才能上傳檔案。"));
        }
        const storageRef = ref(storage, `${path}${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
            },
            (error) => {
                console.error("檔案上傳失敗:", error);
                reject(error);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL);
                });
            }
        );
    });
};

/**
 * 上傳 Base64 圖片資料到 Firebase Storage 的函式。
 * @param {string} base64String - Base64 格式的圖片資料。
 * @param {string} path - 儲存的路徑。
 * @param {string} fileName - 檔案名稱。
 * @returns {Promise<string>} - 檔案的公開下載 URL。
 */
export const uploadBase64AsFile = (base64String, path, fileName) => {
    return new Promise(async (resolve, reject) => {
        if (!storage || !authInstance.currentUser) {
            return reject(new Error("服務未就緒或未登入。"));
        }
        try {
            const response = await fetch(base64String);
            const blob = await response.blob();
            const file = new File([blob], `${fileName.replace(/\s+/g, '_') || 'image'}.png`, { type: 'image/png' });
            
            const storageRef = ref(storage, `${path}${Date.now()}_${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                () => {}, // 我們在這裡不需要進度回報
                (error) => reject(error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then(resolve);
                }
            );
        } catch (error) {
            reject(error);
        }
    });
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
    if (!firestore) throw new Error("Firestore is not initialized.");
    if (!Array.isArray(listeners)) {
        if (typeof onInitialLoadComplete === 'function') { onInitialLoadComplete(); }
        return [];
    }
    let loadCount = 0;
    const totalListeners = listeners.length;
    const checkAllLoaded = () => {
        loadCount++;
        if (loadCount === totalListeners) { onInitialLoadComplete(); }
    };

    return listeners.map(({ name, setter, initialData, isPublic, isSingleDoc, docId }) => {
        let query;
        const path = isPublic ? `artifacts/${appId}/public/data/${name}` : `artifacts/${appId}/users/${userId}/${name}`;
        
        if (isSingleDoc) {
            query = doc(firestore, path, docId);
        } else {
            query = collection(firestore, path);
        }

        return onSnapshot(query, async (snapshot) => {
            if (isSingleDoc) {
                if (!snapshot.exists() && initialData && initialData.length > 0) {
                    const { id, ...dataToSet } = initialData[0];
                    await setDoc(query, dataToSet);
                    setter(dataToSet);
                } else {
                    setter(snapshot.data());
                }
            } else {
                if (snapshot.empty && initialData && initialData.length > 0) {
                    const batch = writeBatch(firestore);
                    initialData.forEach(item => {
                        const docRef = doc(collection(firestore, path));
                        const { id, ...data } = item;
                        batch.set(docRef, data);
                    });
                    await batch.commit();
                    setter(initialData.map(item => ({ ...item, id: crypto.randomUUID() })));
                } else {
                    setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                }
            }
            if (loadCount < totalListeners) checkAllLoaded();
        }, (error) => {
            console.error(`Error fetching ${name}:`, error);
            if (loadCount < totalListeners) checkAllLoaded();
        });
    });
};

/**
 * 向指定的 Firestore 集合新增一筆文件。
 */
export const addData = async (path, data, returnRef = false) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    const docRef = await addDoc(collection(firestore, path), data);
    return returnRef ? docRef : docRef.id;
};

/**
 * 更新 Firestore 文件的通用函式。
 */
export const updateData = async (path, id, data) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    const docRef = doc(firestore, path, id);
    await updateDoc(docRef, data);
};

/**
 * 刪除 Firestore 文件的通用函式。
 */
export const deleteData = async (path, id) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    await deleteDoc(doc(firestore, path, id));
};

/**
 * 根據文件引用刪除 Firestore 中的文件。
 */
export const deleteDataByRef = async (docRef) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    await deleteDoc(docRef);
};

