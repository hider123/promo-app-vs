import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';

// 專為管理員設計的 Logo
const AdminLogo = () => (
    <div className="bg-white p-2 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
        <svg className="w-12 h-12 text-slate-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            <line x1="12" y1="1" x2="12" y2="4"></line>
            <line x1="18" y1="1" x2="18" y2="4"></line>
            <line x1="24" y1="10" x2="21" y2="10"></line>
        </svg>
    </div>
);

export default function AdminLoginPage({ auth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!auth) {
            setError("認證服務尚未準備就緒，請稍後再試。");
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // 登入成功後，App.jsx 中的監聽器會自動處理跳轉
        } catch (err) {
            setError('管理員帳號或密碼錯誤。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 font-['Nunito',_sans-serif] p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-3xl shadow-2xl border-4 border-black">
                <div className="text-center">
                    <AdminLogo />
                    <h1 className="mt-4 text-4xl font-black text-slate-900 tracking-tight">管理員登入</h1>
                    <p className="mt-2 text-lg text-slate-600 font-bold">請輸入您的管理員憑證。</p>
                </div>

                {error && (
                    <div className="p-3 text-sm font-bold text-red-800 bg-red-100 border-2 border-red-800 rounded-lg text-center" role="alert">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-lg font-bold text-gray-700 mb-1">管理員信箱</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black rounded-xl bg-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all text-lg"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-lg font-bold text-gray-700 mb-1">密碼</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-black rounded-xl bg-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all text-lg"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl font-black text-white bg-slate-800 hover:bg-slate-900 focus:outline-none transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:bg-slate-400"
                    >
                        {isLoading ? '登入中...' : '登入'}
                    </button>
                </form>
            </div>
        </div>
    );
}
