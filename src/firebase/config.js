import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { getFirestore, collection, onSnapshot, writeBatch, doc, addDoc, deleteDoc, updateDoc, setDoc, query, where, collectionGroup } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

// --- 全域變數 ---
let app, authInstance, firestore, storage, currentAppId;

// --- 動態設定載入 ---
const getFirebaseConfig = () => {
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

    if (typeof __firebase_config !== 'undefined' && __firebase_config) {
        try {
            console.log("Firebase 設定已從 Canvas 環境載入。");
            return JSON.parse(__firebase_config);
        } catch (e) {
            console.error("從 Canvas 環境解析 __firebase_config 失敗:", e);
            return null;
        }
    }

    console.warn("在 Vite 或 Canvas 環境中均未找到 Firebase 設定。");
    return null;
};

const firebaseConfig = getFirebaseConfig();

export const initializeFirebase = async () => {
    if (!firebaseConfig) {
        const errorMessage = "未找到 Firebase 設定，請檢查您的環境變數。";
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    try {
        if (!app) { 
            app = initializeApp(firebaseConfig);
            authInstance = getAuth(app);
            firestore = getFirestore(app);
            storage = getStorage(app);
            currentAppId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        }

        if (authInstance.currentUser === null) {
             const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
             if (token) {
                 await signInWithCustomToken(authInstance, token);
             }
        }
        
        return { authInstance, firestore, storage, currentAppId };
    } catch (e) {
        console.error("Firebase 初始化失敗:", e);
        throw e;
    }
};

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

    return listeners.map(({ name, setter, initialData, isPublic, isSingleDoc, docId, queryConstraints, isCollectionGroup, seedOnEmpty }) => {
        let q;
        const path = isPublic ? `artifacts/${appId}/public/data/${name}` : `artifacts/${appId}/users/${userId}/${name}`;
        
        if (isSingleDoc) {
            q = doc(firestore, path, docId);
        } else if (isCollectionGroup) {
            const groupRef = collectionGroup(firestore, name);
            q = queryConstraints && queryConstraints.length > 0 ? query(groupRef, ...queryConstraints) : groupRef;
        } else {
            const collectionRef = collection(firestore, path);
            q = queryConstraints && queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;
        }

        return onSnapshot(q, async (snapshot) => {
            if (isSingleDoc) {
                if (!snapshot.exists() && seedOnEmpty && initialData && initialData.length > 0) {
                    const { id, ...dataToSet } = initialData[0];
                    await setDoc(q, dataToSet);
                    setter(dataToSet);
                } else {
                    setter(snapshot.data());
                }
            } else {
                if (snapshot.empty && seedOnEmpty && initialData && initialData.length > 0) {
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
 * 上傳檔案到 Firebase Storage 的通用函式。
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
                // [修正] 在呼叫 onProgress 之前，先檢查它是否存在且為一個函式
                if (typeof onProgress === 'function') {
                    onProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                }
            },
            (error) => reject(error),
            () => getDownloadURL(uploadTask.snapshot.ref).then(resolve)
        );
    });
};

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
                () => {},
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

export const addData = async (path, data, returnRef = false) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    const docRef = await addDoc(collection(firestore, path), data);
    return returnRef ? docRef : docRef.id;
};

export const updateData = async (path, id, data) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    const docRef = doc(firestore, path, id);
    await updateDoc(docRef, data);
};

export const setData = async (path, id, data, options = {}) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    const docRef = doc(firestore, path, id);
    await setDoc(docRef, data, options);
};

export const deleteData = async (path, id) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    await deleteDoc(doc(firestore, path, id));
};

export const deleteDataByRef = async (docRef) => {
    if (!firestore) throw new Error("Firestore 尚未初始化。");
    await deleteDoc(docRef);
};