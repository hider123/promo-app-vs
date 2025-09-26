import React from 'react';
import { useUserContext } from '../context/UserContext.jsx';

const FrontendExperimentPage = () => {
    // 1. 從 UserContext 取得 teamMembers 資料
    const { teamMembers } = useUserContext();

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800">前端讀取 team_members 實驗</h1>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold">原始資料 (Raw Data)</h2>
                <p className="mt-2 text-sm text-gray-600">
                    以下是前端 `UserContext` 目前從 Firebase 即時讀取到的 `team_members` 集合的完整內容。
                </p>
                <pre className="mt-4 p-4 bg-gray-100 rounded-md text-xs text-left overflow-auto">
                    {JSON.stringify(teamMembers, null, 2) || "讀取中... 或資料為空。"}
                </pre>
            </div>
        </div>
    );
};

export default FrontendExperimentPage;