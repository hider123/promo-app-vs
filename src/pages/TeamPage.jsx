import React, { useState, useMemo } from 'react';
import InviteMemberModal from '../components/InviteMemberModal';
// [修正] 更新為正確的相對路徑，只返回一層目錄
import { useUserContext } from '../context/UserContext.jsx';

const TeamPage = () => {
    // 1. 從 Context 取得所需的資料和函式
    const { teamMembers, pendingInvitations, handleInvite } = useUserContext();
    
    // 2. 管理此頁面自身的 UI 狀態 (彈出視窗的開關)
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // 3. 定義輔助函式 (Helper Function)，根據角色回傳對應的樣式
    const getRoleStyles = (role) => {
        switch (role) {
            case '首席顧問':
                return 'bg-indigo-100 text-indigo-800';
            case '資深總監':
                return 'bg-purple-100 text-purple-800';
            case '推廣經理':
                return 'bg-sky-100 text-sky-800';
            case '行銷專員':
            default:
                return 'bg-teal-100 text-teal-800';
        }
    };

    // 4. 定義一個遞迴的子元件 (Sub-component)，用來渲染樹狀結構
    const TreeNode = ({ member, isLast }) => {
        const [isOpen, setIsOpen] = useState(true);
        const hasChildren = member.children && member.children.length > 0;

        return (
            <li className="relative pl-6">
                <span className="absolute left-0 top-6 h-px w-4 bg-gray-300" aria-hidden="true"></span>
                {!isLast && <span className="absolute left-0 top-6 h-full w-px bg-gray-300" aria-hidden="true"></span>}

                <div className="flex items-center justify-between py-3">
                    <div className="flex items-center">
                        {hasChildren && (
                            <button onClick={() => setIsOpen(!isOpen)} className="mr-2 text-gray-400 hover:text-gray-800 w-6 h-6 flex items-center justify-center">
                                 <i className={`fas fa-chevron-right text-xs transition-transform ${isOpen ? 'rotate-90' : ''}`}></i>
                            </button>
                        )}
                        <div style={{ marginLeft: !hasChildren ? '24px' : '0' }}>
                            <p className="font-medium text-gray-800">{member.name}</p>
                             <span className={`mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${getRoleStyles(member.role)}`}>
                                {member.role}
                            </span>
                        </div>
                    </div>
                    <button className="py-1 px-3 rounded-md font-semibold text-sm transition-colors duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 flex-shrink-0">
                        詳情
                    </button>
                </div>
                
                {isOpen && hasChildren && (
                     <ul className="pl-6">
                         {(member.children || []).map((child, index) => (
                             <TreeNode key={child.id || index} member={child} isLast={index === member.children.length - 1} />
                         ))}
                     </ul>
                )}
            </li>
        );
    };

    // 5. 計算衍生資料 (Derived Data)，將扁平的團隊列表轉換為樹狀結構
    const treeData = useMemo(() => {
        const memberList = teamMembers || [];
        const admin = memberList.find(m => m.role === '首席顧問');
        if (!admin) {
            return memberList.length > 0 ? { ...memberList[0], children: memberList.slice(1) } : null;
        }
        const otherMembers = memberList.filter(m => m.role !== '首席顧問');
        return {
            ...admin,
            children: otherMembers
        };
    }, [teamMembers]);

    // 6. 回傳最終的 JSX 結構
    return (
        <>
            <InviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={(inviteData) => {
                    handleInvite(inviteData);
                    setIsInviteModalOpen(false);
                }}
            />
            <div className="space-y-6 p-4">
                <div className="flex items-baseline justify-between pr-16">
                    <h1 className="text-3xl font-bold text-gray-800">團隊管理</h1>
                    <button 
                        onClick={() => setIsInviteModalOpen(true)}
                        className="flex items-center py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700">
                        <i className="fas fa-user-plus mr-2"></i>邀請新成員
                    </button>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">團隊結構圖</h2>
                    <ul>
                        {treeData ? <TreeNode member={treeData} isLast={true} /> : <p className="text-gray-500 py-4">沒有團隊成員可顯示。</p>}
                    </ul>
                </div>
                
                {(pendingInvitations || []).length > 0 && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">待處理的邀請</h2>
                        <ul className="divide-y divide-gray-200">
                            {pendingInvitations.map(inv => (
                                <li key={inv.id} className="flex items-center justify-between py-3">
                                    <div className="flex items-center">
                                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                                            <i className="fas fa-envelope text-gray-400"></i>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800 truncate">{inv.email}</p>
                                            <p className="text-sm text-gray-500">{inv.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">{inv.status}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </>
    );
};

export default TeamPage;

