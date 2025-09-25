import React, { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUserContext } from '../../context/UserContext.jsx';

const EditProfilePage = ({ onBack }) => {
    const { userId, user } = useAuthContext();
    const { updateUserProfile, teamMembers } = useUserContext();
    
    const currentUserProfile = useMemo(() => 
        (teamMembers || []).find(member => member.userId === userId), 
    [teamMembers, userId]);

    const [formData, setFormData] = useState({
        username: '',
        phone: '',
        referrerId: ''
    });
    const [copySuccess, setCopySuccess] = useState('');

    useEffect(() => {
        if (currentUserProfile) {
            setFormData(prevData => ({
                username: prevData.username || currentUserProfile.name || '',
                phone: prevData.phone || currentUserProfile.phone || '',
                referrerId: currentUserProfile.referrerId || ''
            }));
        }
    }, [currentUserProfile]);

    const accountId = userId;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };
    
    const handleCopy = () => {
        if (!accountId) return;
        const textArea = document.createElement("textarea");
        textArea.value = accountId;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setCopySuccess('已複製！');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('複製失敗');
        }
        document.body.removeChild(textArea);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await updateUserProfile({
            name: formData.username,
            phone: formData.phone
        });
    };

    const inputStyle = "mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-lg p-3 bg-gray-100 focus:bg-white transition-colors";

    return (
        <div className="p-4">
            <div className="relative flex items-center justify-center mb-8">
                <button 
                    onClick={onBack} 
                    className="absolute left-0 text-indigo-600 hover:text-indigo-800"
                    aria-label="返回上一頁"
                >
                    <i className="fas fa-arrow-left fa-2x"></i>
                </button>
                <h1 className="text-5xl font-bold text-gray-900">編輯個人資料</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white p-5 rounded-xl shadow-sm space-y-6">
                    <div>
                        <label htmlFor="accountId" className="block text-xl font-bold text-gray-700">帳戶 ID</label>
                        <div className="mt-2 flex">
                            <input 
                                type="text" 
                                id="accountId" 
                                value={accountId || ''} 
                                readOnly 
                                className="w-full px-3 py-3 border border-gray-300 rounded-l-md bg-gray-200 text-gray-500 text-lg"
                            />
                            <button 
                                type="button" 
                                onClick={handleCopy}
                                className="px-4 py-3 border border-l-0 border-indigo-600 rounded-r-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-lg flex-shrink-0"
                            >
                                {copySuccess ? '已複製' : '複製'}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="username" className="block text-xl font-bold text-gray-700">使用者名稱</label>
                        <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} className={inputStyle}/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-xl font-bold text-gray-700">電子郵件</label>
                        <input type="email" id="email" name="email" value={user?.email || ''} className={`${inputStyle} bg-gray-200 text-gray-500 cursor-not-allowed`} readOnly/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-xl font-bold text-gray-700">電話號碼</label>
                        <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="請輸入您的電話號碼" className={inputStyle}/>
                    </div>
                     <div>
                        <label htmlFor="referrerId" className="block text-xl font-bold text-gray-700">推薦人 ID</label>
                        <input 
                            type="text" 
                            id="referrerId"
                            name="referrerId"
                            value={formData.referrerId || ''} 
                            readOnly
                            placeholder="經由推薦連結註冊後將自動綁定"
                            className={`${inputStyle} bg-gray-200 text-gray-500 cursor-not-allowed`}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button type="submit" className="w-full py-4 rounded-lg font-bold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 text-xl">
                        儲存變更
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;