import React, { useState, useMemo, useCallback } from 'react';
import InviteMemberModal from '../components/InviteMemberModal';
import { useUserContext } from '../context/UserContext.jsx';
// [核心修正] 引入 AuthContext 以使用全域的提示功能
import { useAuthContext } from '../context/AuthContext.jsx';

const TeamPage = () => {
    // 1. 從 Context 取得所需的資料和函式
    const { teamMembers, pendingInvitations, handleInvite, appSettings, records } = useUserContext();
    const { showAlert } = useAuthContext();
    
    // 2. 管理此頁面自身的 UI 狀態
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    // 3. 定義輔助函式
    const getUserLevel = useCallback((memberId) => {
        if (!records) return { name: '推廣新星(初階)', color: 'bg-sky-100 text-sky-800' };
        
        // 注意：目前的架構下，`records` 只包含當前登入使用者的交易記錄。
        // 一個更完整的系統需要後端支援，才能查詢到下線成員的購買數量。
        // 這裡我們暫時假設所有成員的紀錄都在同一個地方，以演示功能。
        const purchaseCount = records.filter(r => r.userId === memberId && r.type === 'expense' && r.description.startsWith('費用: 購買貓池帳號')).length;
        
        const highTier = appSettings?.highTierThreshold ?? 100;
        const midTier = appSettings?.midTierThreshold ?? 20;

        if (purchaseCount >= highTier) return { name: '品牌大使(高階)', color: 'bg-indigo-100 text-indigo-800' };
        if (purchaseCount >= midTier) return { name: '行銷達人(中階)', color: 'bg-purple-100 text-purple-800' };
        return { name: '推廣新星(初階)', color: 'bg-sky-100 text-sky-800' };
    }, [records, appSettings]);

    // [核心修正] 新增點擊「詳情」按鈕的處理函式
    const onDetailsClick = useCallback((member) => {
        const level = getUserLevel(member.userId);
        const message = `成員詳情： ${member.name}\n\n` +
                      `目前階級： ${level.name}\n` +
                      `團隊角色： ${member.role}`;
        showAlert(message);
    }, [getUserLevel, showAlert]);


    // TreeNode 是一個遞迴的子元件，用來渲染團隊的樹狀結構
    const TreeNode = ({ member, isLast }) => {
        const [isOpen, setIsOpen] = useState(true);
        const hasChildren = member.children && member.children.length > 0;
        const level = getUserLevel(member.userId);

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
                             <span className={`mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${level.color}`}>
                                {level.name}
                            </span>
                        </div>
                    </div>
                    {/* [核心修正] 為按鈕加上 onClick 事件 */}
                    <button 
                        onClick={() => onDetailsClick(member)}
                        className="py-1 px-3 rounded-md font-semibold text-sm transition-colors duration-300 bg-gray-100 text-gray-700 hover:bg-gray-200 flex-shrink-0">
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

    // 4. 使用更穩固的演算法來建構樹狀圖
    const treeData = useMemo(() => {
        const members = teamMembers || [];
        if (members.length === 0) return [];

        const memberMap = new Map();
        
        members.forEach(member => {
            memberMap.set(member.userId, { ...member, children: [] });
        });

        const rootNodes = [];
        
        memberMap.forEach(memberNode => {
            if (memberNode.referrerId && memberMap.has(memberNode.referrerId)) {
                const parentNode = memberMap.get(memberNode.referrerId);
                parentNode.children.push(memberNode);
            } else {
                rootNodes.push(memberNode);
            }
        });

        return rootNodes;
    }, [teamMembers]);

    // 5. 回傳最終的 JSX 結構
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
                        {treeData.length > 0 ? treeData.map((rootNode, index) => (
                            <TreeNode key={rootNode.id} member={rootNode} isLast={index === treeData.length - 1} />
                        )) : <p className="text-gray-500 py-4">沒有團隊成員可顯示。</p>}
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

