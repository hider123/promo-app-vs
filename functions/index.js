// [修改] 改回 v1 的引入方式
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * [修改] 使用 v1 auth.user().onCreate() 觸發器
 * 當新使用者註冊時，為其建立所有必要的初始資料。
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    // [修改] 在 v1 中，使用者資料就是 user 物件本身
    const { uid, email } = user;
    
    functions.logger.info(`新使用者註冊成功: ${uid}, Email: ${email}`);
    
    const appId = "default-app-id";

    const name = email.split('@')[0];
    const newTeamMemberData = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: '行銷專員',
        avatar: `https://placehold.co/100x100/e0f2fe/075985?text=${name.charAt(0).toUpperCase()}`,
        status: '離線',
        userId: uid,
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
    
    const recordsRef = db.collection(`artifacts/${appId}/users/${uid}/records`);
    initialRecords.forEach(record => batch.set(recordsRef.doc(), record));

    const poolAccountsRef = db.collection(`artifacts/${appId}/users/${uid}/poolAccounts`);
    initialPoolAccounts.forEach(account => batch.set(poolAccountsRef.doc(), account));

    const teamMemberRef = db.collection(`artifacts/${appId}/public/data/team_members`).doc();
    batch.set(teamMemberRef, newTeamMemberData);

    try {
        await batch.commit();
        functions.logger.info(`成功為使用者 ${uid} 初始化所有資料。`);
    } catch (error) {
        functions.logger.error(`為使用者 ${uid} 初始化資料失敗:`, error);
    }
    
    return null;
});

/**
 * [修改] 使用 v1 pubsub.schedule().onRun() 觸發器
 * 排程函式：每日凌晨自動檢查並下架商品。
 */
exports.autoUnpublishProducts = functions.pubsub.schedule('0 0 * * *')
    .timeZone('Asia/Taipei')
    .onRun(async (context) => {
        functions.logger.info("執行每日排程任務：下架過期商品...");
        // ... 在此處加入下架商品的邏輯 ...
        return null;
    });