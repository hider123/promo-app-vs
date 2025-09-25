import React, { useState, useMemo, useCallback } from 'react';
// [移除] 不再需要 InviteMemberModal
// import InviteMemberModal from '../components/InviteMemberModal';
import { useUserContext } from '../context/UserContext.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';

const TeamPage = () => {
    const { showAlert, userId } = useAuthContext();
    const { teamMembers, appSettings, records } = useUserContext();
    
    // [移除] isInviteModalOpen 狀態已不再需要
    // const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const referralLink = useMemo(() => {
        if (!userId) return '';
        return `${window.location.origin}${window.location.pathname}?ref=${userId}`;
    }, [userId]);

    const handleCopyLink = useCallback(() => {
        navigator.clipboard.writeText(referralLink).then(() => {
            showAlert('✅ 推薦連結已成功複製！');
        }, () => {
            showAlert('複製失敗，請手動複製。');
        });
    }, [referralLink, showAlert]);

    const getUserLevel = useCallback((memberId) => {
        if (!records) return { name: '推廣新星(初階)', color: 'bg-sky-100 text-sky-800' };
        
        const purchaseCount = records.filter(r => r.userId === memberId && r.type === 'expense' && r.description.startsWith('費用: 購買貓池帳號')).length;
        
        const highTier = appSettings?.highTierThreshold ?? 100;
        const midTier = appSettings?.midTierThreshold ?? 20;

        if (purchaseCount >= highTier) return { name: '品牌大使(高階)', color: 'bg-indigo-100 text-indigo-800' };
        if (purchaseCount >= midTier) return { name: '行銷達人(中階)', color: 'bg-purple-100 text-purple-800' };
        return { name: '推廣新星(初階)', color: 'bg-sky-100 text-sky-800' };
    }, [records, appSettings]);

    const onDetailsClick = useCallback((member) => {
        const level = getUserLevel(member.userId);
        const message = `成員詳情： ${member.name}\n\n` +
                      `目前階級： ${level.name}\n` +
                      `團隊角色： ${member.role}`;
        showAlert(message);
    }, [getUserLevel, showAlert]);

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

    const treeData = useMemo(() => {
        const members = teamMembers || [];
        if (members.length === 0 || !userId) return [];

        const memberMap = new Map();
        
        members.forEach(member => {
            memberMap.set(member.userId, { ...member, children: [] });
        });

        memberMap.forEach(memberNode => {
            if (memberNode.referrerId && memberMap.has(memberNode.referrerId)) {
                const parentNode = memberMap.get(memberNode.referrerId);
                parentNode.children.push(memberNode);
            }
        });

        const currentUserNode = memberMap.get(userId);

        return currentUserNode ? [currentUserNode] : [];

    }, [teamMembers, userId]);

    return (
        <>
            {/* [移除] InviteMemberModal 已移除 */}
            <div className="space-y-6 p-4">
                <div className="flex items-baseline justify-between">
                    <h1 className="text-3xl font-bold text-gray-800">團隊管理</h1>
                    {/* [移除] 邀請新成員按鈕已移除 */}
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800">我的專屬推薦連結</h2>
                    <p className="text-sm text-gray-500 mt-1">分享此連結給朋友，他們註冊後就會成為您的下線成員。</p>
                    <div className="mt-3 flex items-center gap-2 bg-gray-100 p-2 rounded-lg">
                        <i className="fas fa-link text-gray-400"></i>
                        <input 
                            type="text" 
                            value={referralLink} 
                            readOnly 
                            className="w-full bg-transparent text-gray-700 text-sm focus:outline-none"
                        />
                        <button 
                            onClick={handleCopyLink}
                            className="py-1.5 px-4 rounded-md font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 flex-shrink-0"
                        >
                            複製
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">我的團隊結構</h2>
                    <ul>
                        {treeData.length > 0 ? treeData.map((rootNode, index) => (
                            <TreeNode key={rootNode.id} member={rootNode} isLast={index === treeData.length - 1} />
                        )) : <p className="text-gray-500 py-4">您目前沒有任何下線成員。</p>}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default TeamPage;