const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * 觸發型函式：在新使用者註冊時，為其建立所有必要的初始資料。
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    console.log(`新使用者註冊成功: ${user.uid}, Email: ${user.email}`);
    const { uid, email } = user;
    // 請確保這與您前端的 App ID 一致，或從環境變數讀取
    const appId = "default-app-id"; 

    // --- 準備要寫入資料庫的初始資料 ---
    
    // [核心修正] 為新使用者準備一個 team_members 文件
    const name = email.split('@')[0];
    const newTeamMemberData = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: '行銷專員', // 所有新用戶的預設角色
        avatar: `https://placehold.co/100x100/e0f2fe/075985?text=${name.charAt(0).toUpperCase()}`,
        status: '離線',
        userId: uid, // 儲存 Firebase Auth 的 UID
        // 新註冊的使用者沒有 referrerId
    };

    const initialRecords = [
        {
            type: "deposit",
            description: "新用戶獎勵",
            date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
            amount: 500.00,
            status: "成功",
            userId: uid,
        }
    ];

    const initialPoolAccounts = [
        {
            name: "TechGeek Reviews",
            platform: "X (Twitter)",
            avatar: "https://placehold.co/100x100/1f2937/ffffff?text=T",
            createdAt: new Date(),
            userId: uid,
        },
        {
            name: "美食日記",
            platform: "Facebook 粉絲專頁",
            avatar: "https://placehold.co/100x100/3b82f6/ffffff?text=F",
            createdAt: new Date(),
            userId: uid,
        },
    ];

    const batch = db.batch();
    
    // 1. 寫入初始的交易紀錄
    const recordsRef = db.collection(`artifacts/${appId}/users/${uid}/records`);
    initialRecords.forEach(record => batch.set(recordsRef.doc(), record));

    // 2. 寫入初始的貓池帳號
    const poolAccountsRef = db.collection(`artifacts/${appId}/users/${uid}/poolAccounts`);
    initialPoolAccounts.forEach(account => batch.set(poolAccountsRef.doc(), account));

    // 3. [核心修正] 將新使用者加入到公開的 team_members 列表中
    const teamMemberRef = db.collection(`artifacts/${appId}/public/data/team_members`).doc();
    batch.set(teamMemberRef, newTeamMemberData);

    try {
        await batch.commit();
        console.log(`成功為使用者 ${uid} 初始化所有資料。`);
    } catch (error) {
        console.error(`為使用者 ${uid} 初始化資料失敗:`, error);
    }
    return null;
});

/**
 * 排程函式：每日凌晨自動檢查並下架商品。
 */
exports.autoUnpublishProducts = functions.pubsub.schedule('0 0 * * *')
    .timeZone('Asia/Taipei')
    .onRun(async (context) => {
        // ... 此函式的邏輯保持不變 ...
        return null;
    });

/**
 * 可呼叫的 HTTPS 函式，僅供本地端測試使用。
 */
exports.testAutoUnpublish = functions.https.onCall(async (data, context) => {
    // ... 此函式的邏輯保持不變 ...
    return { success: true, message: "Test function executed." };
});

