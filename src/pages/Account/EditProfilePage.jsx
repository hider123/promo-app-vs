import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext.jsx';
import { useUserContext } from '../../context/UserContext.jsx';

const EditProfilePage = ({ onBack }) => {
    // 1. 從 Context 取得使用者資訊和功能
    const { userId, user, showAlert } = useAuthContext();
    const { updateUserProfile } = useUserContext();
    
    // 2. 使用 state 統一管理所有表單欄位
    const [formData, setFormData] = useState({
        username: 'PromoMaster',
        email: '',
        phone: '',
        referrerId: ''
    });
    const [copySuccess, setCopySuccess] = useState('');

    // 當 user 物件載入後，更新表單的預設 email (如果有的話)
    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }));
        }
    }, [user]);

    // 帳戶 ID 直接使用 Firebase 的 UID，確保唯一性
    const accountId = userId;

    // 4. 定義事件處理函式
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

        // [核心檢查機制] 在這裡檢查推薦人 ID 是否與帳戶 ID 相同
        if (formData.referrerId && formData.referrerId === accountId) {
            showAlert('您不能將自己設為推薦人。');
            return; // 如果相同，則中斷儲存流程
        }

        // 呼叫 Context 中的函式來儲存資料
        await updateUserProfile(formData);
    };

    // 統一所有輸入框的樣式
    const inputStyle = "mt-2 block w-full border border-gray-300 rounded-lg shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-lg p-3 bg-gray-100 focus:bg-white transition-colors";

    // 5. 回傳 JSX 結構
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
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputStyle} readOnly/>
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
                            value={formData.referrerId} 
                            onChange={handleChange}
                            placeholder="請輸入推薦人的帳戶 ID (可選)"
                            className={inputStyle}
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

