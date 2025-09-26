import React from 'react';
import { useAdminContext } from '../../context/AdminContext.jsx';
import { useAuthContext } from '../../context/AuthContext.jsx';

const ExperimentPage = () => {
    // 1. 从 AdminContext 取得所有团队成员的资料
    const { allTeamMembers } = useAdminContext();
    // 2. 从 AuthContext 取得提示框功能
    const { showAlert } = useAuthContext();

    const handleReadMembers = () => {
        if (!allTeamMembers || allTeamMembers.length === 0) {
            showAlert("错误：在前端读取不到任何 team_members 资料。请确认 Cloud Function 是否已成功建立该集合。");
            return;
        }

        // 3. 将所有成员的名称组合成一个字串
        const memberNames = allTeamMembers.map(member => member.name).join('\\n- ');
        
        const message = `✅ 实验成功！已成功从前端读取 ${allTeamMembers.length} 位成员：\\n\\n- ${memberNames}`;
        
        // 4. 在提示框中显示所有成员的名称
        showAlert(message);
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800">最终侦错实验</h1>
            <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold">步骤 1：确认 Cloud Function 已执行</h2>
                <p className="mt-2 text-gray-600">
                    请先註册一个全新的测试帐号，以确保后端的 `onUserCreate` 函式已经被触发，并在 Firebase 中建立了 `team_members` 集合。
                </p>
                
                <h2 className="text-lg font-semibold mt-6">步骤 2：执行前端读取测试</h2>
                <p className="mt-2 text-gray-600">
                    确认 `team_members` 集合已存在後，点击下方按鈕。程式将会尝试从前端直接读取该集合的所有资料并显示出来。
                </p>

                <div className="mt-6 text-center">
                    <button 
                        onClick={handleReadMembers}
                        className="py-3 px-6 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                    >
                        读取所有用户名
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExperimentPage;