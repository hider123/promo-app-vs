import React, { useState } from 'react';

const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
    // 1. 管理表單狀態
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('推廣新星');
    // 使用我們更新後的階級名稱
    const roles = ['品牌大使', '行銷達人', '推廣新星'];

    // 2. 處理表單提交
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) return;
        onInvite({ email, role });
        // 提交後重設表單
        setEmail('');
        setRole('推廣新星');
    };

    if (!isOpen) return null;

    // 3. 回傳 JSX 結構
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="modal-overlay-transition absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="modal-content-transition bg-white w-11/12 max-w-md mx-auto rounded-lg shadow-xl z-10">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-800">邀請新成員</h3>
                        <p className="text-sm text-gray-500 mt-1">被邀請者將會收到一封電子郵件。</p>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700">電子郵件</label>
                                <input 
                                    type="email" 
                                    id="invite-email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com" 
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700">角色</label>
                                <select 
                                    id="invite-role" 
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300">
                            取消
                        </button>
                        <button type="submit" className="py-2 px-4 rounded-md font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300" disabled={!email}>
                            送出邀請
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InviteMemberModal;

