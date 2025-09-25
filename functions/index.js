const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

/**
 * v1 觸發型函式：在新使用者註冊時，為其建立所有必要的初始資料。
 */
exports.onUserCreate = functions.auth.user().onCreate(async (user) => {
    const { uid, email } = user;
    
    functions.logger.info(`新使用者註冊成功 (v1): ${uid}, Email: ${email}`);
    
    const appId = "default-app-id";
    const name = email.split('@')[0];

    const newTeamMemberData = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        role: '行銷專員',
        avatar: `https://placehold.co/100x100/e0f2fe/075985?text=${name.charAt(0).toUpperCase()}`,
        status: '離線',
        userId: uid,
    };

    const initialRecords = [{
        type: "deposit",
        description: "新用戶獎勵",
        date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
        amount: 0.00,
        status: "成功",
        userId: uid,
    }];

    const batch = db.batch();
    
    const recordsRef = db.collection(`artifacts/${appId}/users/${uid}/records`);
    initialRecords.forEach(record => batch.set(recordsRef.doc(), record));

    const teamMemberRef = db.collection(`artifacts/${appId}/public/data/team_members`).doc();
    batch.set(teamMemberRef, newTeamMemberData);

    // [核心修正] 移除建立預設貓池帳號的舊邏輯
    // const initialPoolAccounts = [ ... ];
    // const poolAccountsRef = db.collection(`artifacts/${appId}/users/${uid}/poolAccounts`);
    // initialPoolAccounts.forEach(account => batch.set(poolAccountsRef.doc(), account));

    try {
        await batch.commit();
        functions.logger.info(`成功為使用者 ${uid} 初始化所有資料。`);
    } catch (error) {
        functions.logger.error(`為使用者 ${uid} 初始化資料失敗:`, error);
    }
    
    return null;
});

/**
 * v1 排程函式：每日凌晨自動檢查並下架商品。
 */
exports.autoUnpublishProducts = functions.pubsub.schedule("0 0 * * *")
    .timeZone("Asia/Taipei")
    .onRun(async (context) => {
        functions.logger.info("執行每日排程任務：下架過期商品...");
        return null;
    });

/**
 * v1 可呼叫函式：建立唯一貓池帳號
 */
exports.createUniquePoolAccount = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', '您必須登入才能執行此操作。');
    }
    const uid = context.auth.uid;
    const appId = "default-app-id";
    const settingsDoc = await db.collection(`artifacts/${appId}/public/data/app_settings`).doc('global').get();
    if (!settingsDoc.exists) {
        throw new functions.https.HttpsError('not-found', '找不到系統設定。');
    }
    const catPoolPrice = settingsDoc.data().catPoolPrice || 5.00;
    
    const namePrefixes = ['Creative', 'Digital', 'Awesome', 'Super', 'Pro', 'Global'];
    const nameSuffixes = ['Creator', 'Mind', 'Guru', 'World', 'Expert', 'Hub'];
    const platforms = ['Instagram', 'TikTok', 'YouTube', 'Facebook 粉絲專頁', 'X (Twitter)'];
    
    let uniqueName = '';
    let isUnique = false;
    
    for (let i = 0; i < 10; i++) {
        const randomName = `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]}${nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]}${Math.floor(Math.random() * 100)}`;
        const existingAccount = await db.collectionGroup('poolAccounts').where('name', '==', randomName).get();
        if (existingAccount.empty) {
            uniqueName = randomName;
            isUnique = true;
            break;
        }
    }

    if (!isUnique) {
        throw new functions.https.HttpsError('internal', '無法生成唯一的帳號名稱，請稍後再試。');
    }
    
    const newAccountData = {
        name: uniqueName,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        avatar: `https://placehold.co/100x100/ede9fe/5b21b6?text=新`,
        createdAt: new Date(),
        userId: uid,
    };
    const newExpenseRecord = {
        type: 'expense',
        description: `費用: 購買貓池帳號 (${newAccountData.name})`,
        date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
        amount: -catPoolPrice,
        status: '成功',
        userId: uid,
    };

    try {
        await db.runTransaction(async (transaction) => {
            const poolAccountRef = db.collection(`artifacts/${appId}/users/${uid}/poolAccounts`).doc();
            const recordRef = db.collection(`artifacts/${appId}/users/${uid}/records`).doc();

            transaction.set(poolAccountRef, newAccountData);
            transaction.set(recordRef, newExpenseRecord);
        });
        functions.logger.info(`使用者 ${uid} 成功建立貓池帳號: ${uniqueName}`);
        return { success: true, message: `帳號 ${uniqueName} 已經建立！` };
    } catch (error) {
        functions.logger.error(`為使用者 ${uid} 建立貓池帳號失敗:`, error);
        throw new functions.https.HttpsError('internal', '建立帳號失敗，請稍後再試。');
    }
});