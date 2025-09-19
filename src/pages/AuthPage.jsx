import React, { useState } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { useAuthContext } from '../context/AuthContext.jsx';

// 卡通風格 Logo
const CartoonLogo = () => (
    <div className="bg-white p-2 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] inline-block">
        <svg className="w-12 h-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            <rect x="8" y="8" width="8" height="8" rx="1"></rect>
            <path d="M12 7V5m0 14v-2"></path>
            <path d="M17 12h2M5 12h2"></path>
        </svg>
    </div>
);


export default function AuthPage() {
    // 1. 從 AuthContext 取得 auth 物件和 showAlert 函式
    const { auth, showAlert } = useAuthContext();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Google Font 字體注入
    const FontInjector = () => (
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        `}</style>
    );
    
    // 2. 處理認證操作
    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!auth) {
            setError("認證服務尚未準備就緒，請稍後再試。");
            return;
        }

        setIsLoading(true);
        setError('');

        if (!isLogin && password.length < 6) {
            setError('密碼長度至少需要 6 個字元。');
            setIsLoading(false);
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            setError('兩次輸入的密碼不一致。');
            setIsLoading(false);
            return;
        }

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                await signOut(auth); // 立即登出，讓使用者手動登入
                showAlert(
                    '🎉 註冊成功！\n現在請用您的新帳號登入。',
                    () => {
                        setIsLogin(true);
                        setEmail('');
                        setPassword('');
                        setConfirmPassword('');
                    }
                );
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/email-already-in-use':
                    setError('這個 Email 已經是我們的夥伴了！');
                    break;
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError('Email 或密碼好像不太對喔？');
                    break;
                case 'auth/invalid-email':
                    setError('這個 Email 格式怪怪的喔～');
                    break;
                default:
                    setError('糟糕！發生了一些未知錯誤。');
                    console.error("Firebase Auth Error:", err);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // 3. 回傳 JSX 結構
    return (
        <>
            <FontInjector />
            <div className="flex items-center justify-center min-h-screen bg-purple-50 font-['Nunito',_sans-serif] p-4 relative overflow-hidden">
                <div className="absolute -top-16 -left-16 w-48 h-48 bg-yellow-200 rounded-full opacity-50"></div>
                <div className="absolute -bottom-24 -right-12 w-72 h-72 bg-blue-200 rounded-full opacity-50"></div>

                <div className="w-full max-w-md p-8 space-y-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-black">
                    <div className="text-center">
                        <CartoonLogo />
                        <h1 className="mt-4 text-4xl font-black text-gray-900 tracking-tight">歡迎來到 Promo!</h1>
                        <p className="mt-2 text-lg text-gray-600 font-bold">
                            {isLogin ? '很高興你回來了！' : '一起加入我們吧！'}
                        </p>
                    </div>

                    <div className="flex bg-gray-200/70 p-1.5 rounded-2xl border-2 border-black">
                        <button
                            onClick={() => { setIsLogin(true); setError(''); }}
                            className={`flex-1 py-3 font-bold text-lg text-center transition-all duration-300 rounded-xl ${isLogin ? 'bg-white text-purple-600 shadow-md border-2 border-black' : 'text-gray-500'}`}
                        >
                            登入
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(''); }}
                            className={`flex-1 py-3 font-bold text-lg text-center transition-all duration-300 rounded-xl ${!isLogin ? 'bg-white text-purple-600 shadow-md border-2 border-black' : 'text-gray-500'}`}
                        >
                            註冊
                        </button>
                    </div>
                    
                    {error && (
                        <div className="p-4 text-base font-bold text-red-800 bg-red-100 border-2 border-red-800 rounded-lg text-center" role="alert">
                            {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleAuthAction} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-lg font-bold text-gray-700 mb-1.5">電子郵件</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-yellow-300 focus:outline-none transition-all text-lg"
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-lg font-bold text-gray-700 mb-1.5">密碼</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-black rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-yellow-300 focus:outline-none transition-all text-lg"
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        
                        {!isLogin && (
                            <div>
                                <label htmlFor="confirmPassword" className="block text-lg font-bold text-gray-700 mb-1.5">確認密碼</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-black rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-yellow-300 focus:outline-none transition-all text-lg"
                                    required
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                        
                        {isLogin && (
                            <div className="text-base text-right">
                                <a href="#" className="font-bold text-purple-600 hover:text-purple-800">
                                    忘記密碼？
                                </a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-4 px-4 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xl font-black text-white bg-purple-600 hover:bg-purple-700 focus:outline-none transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:bg-purple-300 disabled:shadow-none disabled:translate-y-0"
                        >
                            {isLoading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {isLoading ? '處理中...' : (isLogin ? '登入 !' : '建立帳號 !')}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}

