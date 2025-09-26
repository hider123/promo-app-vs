import React from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
// [新增] 直接引入最底層的 Firebase 工具
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const AdminExperimentPage = () => {
    const { showAlert, appId } = useAuthContext();

    const runTest = async () => {
        const db = getFirestore();
        let results = "實驗結果：\\n\\n";
        
        try {
            // --- 測試 1: 讀取 app_settings ---
            const settingsRef = doc(db, `artifacts/${appId}/public/data/app_settings`, 'global');
            const settingsSnap = await getDoc(settingsRef);

            if (settingsSnap.exists()) {
                results += "✅ [成功] 已成功讀取 app_settings 文件。\\n";
                results += `   - 新帳號價格: US$${settingsSnap.data().catPoolPrice}\\n\\n`;
            } else {
                results += "❌ [失敗] 找不到 app_settings 文件！\\n\\n";
            }
        } catch (error) {
            results += `❌ [失敗] 讀取 app_settings 時發生錯誤: ${error.message}\\n\\n`;
        }

        try {
            // --- 測試 2: 讀取 team_members ---
            const membersRef = collection(db, `artifacts/${appId}/public/data/team_members`);
            const membersSnap = await getDocs(membersRef);

            if (membersSnap.empty) {
                 results += "⚠️ [注意] team_members 集合是空的，裡面沒有任何文件。\\n";
            } else {
                results += `✅ [成功] 已成功讀取 team_members 集合，共找到 ${membersSnap.size} 位成員。\\n`;
                membersSnap.forEach(doc => {
                    results += `   - 成員: ${doc.data().name} (UID: ${doc.data().userId})\\n`;
                });
            }
        } catch (error) {
             results += `❌ [失敗] 讀取 team_members 時發生錯誤: ${error.message}\\n`;
        }
        
        showAlert(results);
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800">後台資料讀取實驗</h1>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold">實驗目的</h2>
                <p className="mt-2 text-gray-600">
                    此頁面將繞開所有前端 Context 和 Hook，使用最原始的 Firebase 指令直接讀取 `app_settings` 和 `team_members` 集合，以驗證最底層的資料讀取功能是否正常。
                </p>

                <div className="mt-6 text-center">
                    <button 
                        onClick={runTest}
                        className="py-3 px-6 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        開始執行讀取測試
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminExperimentPage;