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
        accountStatus: 'active', // 預設為正常狀態
        isVisible: true,       // 預設為顯示
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

    try {
        await batch.commit();
        functions.logger.info(`成功為使用者 ${uid} 初始化所有資料。`);
    } catch (error) {
        functions.logger.error(`為使用者 ${uid} 初始化資料失敗:`, error);
    }
    
    return null;
});

/**
 * v1 排程函式：每三小時自動檢查並下架商品。
 */
exports.autoUnpublishProducts = functions.pubsub.schedule("0 */3 * * *")
    .timeZone("Asia/Taipei")
    .onRun(async (context) => {
        functions.logger.info("開始執行每三小時的排程任務：下架過期商品...");
        
        const appId = "default-app-id";
        const now = new Date();
        const productsRef = db.collection(`artifacts/${appId}/public/data/products`);

        try {
            const query = productsRef
                .where('status', '==', 'published')
                .where('deadline', '<=', now.toISOString());
                
            const expiredProductsSnapshot = await query.get();

            if (expiredProductsSnapshot.empty) {
                functions.logger.info("沒有找到任何已過期的商品。任務結束。");
                return null;
            }

            const batch = db.batch();
            expiredProductsSnapshot.forEach(doc => {
                functions.logger.log(`準備下架商品: ${doc.id} (${doc.data().name})`);
                batch.update(doc.ref, { status: 'draft' });
            });

            await batch.commit();

            functions.logger.info(`成功下架了 ${expiredProductsSnapshot.size} 件過期商品。`);

        } catch (error) {
            functions.logger.error("下架過期商品時發生錯誤:", error);
        }
        
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


/**
 * v1 可呼叫函式：凍結/解凍/隱藏/顯示使用者
 */
exports.toggleUserStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
         throw new functions.https.HttpsError('unauthenticated', '此操作需要登入。');
    }

    const { docId, uid, action } = data;
    const appId = "default-app-id";
    const memberRef = db.collection(`artifacts/${appId}/public/data/team_members`).doc(docId);

    try {
        if (action === 'toggleFreeze') {
            const userRecord = await admin.auth().getUser(uid);
            const isDisabled = userRecord.disabled;
            
            await admin.auth().updateUser(uid, { disabled: !isDisabled });
            await memberRef.update({ accountStatus: !isDisabled ? 'frozen' : 'active' });
            
            return { success: true, message: `使用者 ${uid} 已成功${!isDisabled ? '凍結' : '解凍'}。` };
        
        } else if (action === 'toggleVisibility') {
            const memberDoc = await memberRef.get();
            const isVisible = memberDoc.data().isVisible ?? true;
            
            await memberRef.update({ isVisible: !isVisible });
            
            return { success: true, message: `使用者 ${uid} 的可見性已更新。` };
        
        } else {
            throw new functions.https.HttpsError('invalid-argument', '未知的操作。');
        }
    } catch (error) {
        functions.logger.error(`更新使用者 ${uid} 狀態失敗:`, error);
        throw new functions.https.HttpsError('internal', `操作失敗: ${error.message}`);
    }
});

/**
 * v1 可呼叫函式：取得所有認證使用者的 Email
 */
exports.getAllAuthUsers = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', '此操作需要登入。');
    }

    try {
        const userRecords = await admin.auth().listUsers(1000);
        const users = userRecords.users.map(user => ({
            uid: user.uid,
            email: user.email,
        }));
        return { users };
    } catch (error) {
        functions.logger.error("取得所有認證使用者失敗:", error);
        throw new functions.https.HttpsError('internal', '無法取得使用者列表。');
    }
});