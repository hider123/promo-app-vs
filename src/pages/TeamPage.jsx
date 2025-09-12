import React, { useState, useMemo } from 'react';
import InviteMemberModal from '../components/InviteMemberModal';

// 團隊管理頁面
const TeamPage = ({ teamMembers, pendingInvitations, handleInvite }) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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

    // TreeNode 是一個遞迴元件，用來渲染團隊結構
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

    // 使用 useMemo 來避免每次渲染都重新計算樹狀結構
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

    return (
        <div className="space-y-6 p-4">
            <InviteMemberModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={(inviteData) => {
                    handleInvite(inviteData);
                    setIsInviteModalOpen(false);
                }}
            />
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">團隊管理</h1>
                <button 
                    onClick={() => setIsInviteModalOpen(true)}
                    className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700">
                    <i className="fas fa-user-plus mr-2"></i>邀請新成員
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-2">團隊結構圖</h2>
                <ul>
                    {treeData ? <TreeNode member={treeData} isLast={true} /> : <p className="text-gray-500 py-4">沒有團隊成員可顯示。</p>}
                </ul>
            </div>
            
            {(pendingInvitations && pendingInvitations.length > 0) && (
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

             <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">團隊設定</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="team-name" className="block text-sm font-medium text-gray-700">團隊名稱</label>
                        <input type="text" id="team-name" defaultValue="我的優秀團隊" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"/>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamPage;

