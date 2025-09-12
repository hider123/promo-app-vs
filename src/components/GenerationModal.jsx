import React, { useState, useEffect, useCallback } from 'react';
// [修正] 直接從 firebase/config 匯入 addData 函式
import { addData } from '../firebase/config';

// [修正] 移除 db prop，因為不再需要從 App.jsx 傳遞
const GenerationModal = ({ product, isOpen, onClose, onPushSuccess, poolAccounts, userId, appId, pushedToday }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [generatedText, setGeneratedText] = useState('');
    const [activePlatform, setActivePlatform] = useState('Amazon');
    
    const [modalView, setModalView] = useState('generate');
    const [selectedAccountId, setSelectedAccountId] = useState(null);

    const [pushSuccess, setPushSuccess] = useState(false);
    const [pushAccount, setPushAccount] = useState(null);
    const [pushProgress, setPushProgress] = useState(0);

    const [recordReady, setRecordReady] = useState(false);
    
    const availableAccounts = (poolAccounts || []).filter(acc => !pushedToday.has(acc.name));

    const generateAIContent = useCallback((prod, platform) => {
        if (!prod) return '';
        const { name, description } = prod;
        const productName = name.replace(/高效能|智慧|人體工學|輕量化/g, '');
        const openings = ["✨ 發現好物！", "真心推薦！", "🔥 每日精選", "🚀 提升生活品質的好物", "各位觀眾！ 주목！"];
        const adjectives = ["超棒的", "令人驚豔的", "CP值超高的", "質感一流的", "功能強大的"];
        const closings = ["絕對是物超所值！", "快來看看吧！", "錯過就太可惜了！", "立即入手，體驗不一樣的生活。", "這錢花得太值得了！"];
        const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
        let content = '';
        switch (platform) {
            case 'Shopee':
                content = `蝦皮用戶看過來！${randomItem(['🔥', '🎉', '🛍️'])} 這款「${name}」正在特價中！\n\n✅ ${description.split('，')[0]}\n✅ ${description.split('，')[1] || '設計精美'}\n\n${randomItem(closings)} 手刀下單去 👉 [您的蝦皮連結]\n\n#蝦皮購物 #每日推薦 #${productName.replace(/\s+/g, '')}`;
                break;
            case 'ePay':
                content = `使用 ePay 支付「${name}」享獨家優惠！\n\n${description}，現在購買正是時候。\n\n體驗無現金支付的便利，${randomItem(closings)}\n\n#ePay #行動支付 #智慧生活`;
                break;
            case 'Amazon':
            default:
                content = `${randomItem(openings)} 我最近發現了這款${randomItem(adjectives)}「${name}」。\n\n它的「${description}」特色真的解決了我的日常困擾。\n\n${randomItem(closings)}\n\n#Amazon好評 #開箱 #${productName.replace(/\s+/g, '')}`;
                break;
        }
        return content;
    }, []);
    
    const startGenerationProcess = useCallback(() => {
        if (!product) return;
        setIsLoading(true);
        setTimeout(() => {
            setGeneratedText(generateAIContent(product, activePlatform));
            setIsLoading(false);
        }, 800);
    }, [product, activePlatform, generateAIContent]);

    const handleConfirmPush = () => {
        const selectedAcc = poolAccounts.find(acc => acc.id === selectedAccountId);
        if (!selectedAcc) return;

        setPushAccount(selectedAcc);
        setModalView('pushing');
    };

    useEffect(() => {
        if (isOpen && modalView === 'generate') {
            startGenerationProcess();
        }
    }, [isOpen, modalView, startGenerationProcess]);

    useEffect(() => {
        if (modalView !== 'pushing' || !pushAccount) return;
        
        setPushSuccess(false);
        setPushProgress(0);
        setRecordReady(false); 

        const interval = setInterval(() => {
            setPushProgress(prev => {
                if (prev >= 98) {
                    clearInterval(interval);
                    setPushSuccess(true);
                    setRecordReady(true);
                    return 100;
                }
                return prev + 10;
            });
        }, 200);
        
        return () => clearInterval(interval);

    }, [modalView, pushAccount]);

    useEffect(() => {
        if (recordReady && pushAccount) {
            const priceValue = parseFloat(product.price.replace(/NT\$|,/g, ''));
            const commissionValue = (priceValue * 0.05);

            const newRecord = {
                type: 'commission',
                description: `佣金: ${product.name}`,
                date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Taipei' }).slice(0, 16).replace('T', ' '),
                amount: commissionValue,
                status: '成功',
                platformDetails: {
                    product: product.name,
                    account: pushAccount.name,
                    platform: pushAccount.platform,
                    targetPlatform: activePlatform
                }
            };
            
            // [修正] 直接呼叫從 config 匯入的 addData 函式
            addData(`artifacts/${appId}/users/${userId}/records`, newRecord)
                .then(() => {
                    setTimeout(() => {
                        onPushSuccess();
                    }, 1500);
                })
                .catch(error => console.error("Error adding record to Firestore: ", error))
                .finally(() => setRecordReady(false));
        }
    }, [recordReady, pushAccount, product, userId, appId, onPushSuccess, activePlatform]);


    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setModalView('generate');
                setSelectedAccountId(null);
                setPushSuccess(false);
                setActivePlatform('Amazon');
                setIsLoading(true);
                setPushAccount(null);
                setPushProgress(0);
                setRecordReady(false); 
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handlePlatformChange = (platform) => {
        setActivePlatform(platform);
        setGeneratedText(generateAIContent(product, platform));
    };

    const renderContent = () => {
        if (modalView === 'pushing') {
            return (
                 <div className="text-center py-10 px-4">
                    {pushSuccess ? (
                        <>
                            <i className="fas fa-check-circle fa-3x text-green-500"></i>
                            <h4 className="text-xl font-semibold mt-4">推播成功！</h4>
                            <p className="text-gray-600 mt-2">文案已成功發佈至：</p>
                            <div className="mt-4 inline-flex items-center bg-gray-100 rounded-lg p-2">
                                {pushAccount && <img src={pushAccount.avatar} className="w-8 h-8 rounded-full" alt={pushAccount.name}/>}
                                <span className="ml-3 font-semibold text-gray-800">{pushAccount ? pushAccount.name : ''}</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <i className="fas fa-spinner fa-spin fa-3x text-indigo-600"></i>
                            <h4 className="text-xl font-semibold mt-4">推播進行中...</h4>
                            {pushAccount && (
                                <div className="mt-4 inline-flex items-center bg-gray-100 rounded-lg p-2">
                                    <img src={pushAccount.avatar} className="w-8 h-8 rounded-full" alt={pushAccount.name}/>
                                    <span className="ml-3 font-semibold text-gray-800">{pushAccount.name}</span>
                                </div>
                            )}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                                <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${pushProgress}%`, transition: 'width 0.2s' }}></div>
                            </div>
                        </>
                    )}
                </div>
            );
        }
        
        if (modalView === 'selectAccount') {
             return (
                <>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">選擇一個帳號進行推播</h4>
                    <div className="max-h-64 overflow-y-auto account-list-scroll border-t border-b divide-y">
                        {availableAccounts.length > 0 ? availableAccounts.map(account => (
                            <div
                                key={account.id}
                                onClick={() => setSelectedAccountId(account.id)}
                                className={`p-3 flex items-center cursor-pointer transition-colors ${selectedAccountId === account.id ? 'bg-indigo-100' : 'hover:bg-gray-50'}`}
                            >
                                <img src={account.avatar} alt={account.name} className="w-10 h-10 rounded-full object-cover mr-4" />
                                <div className="flex-1 min-w-0">
                                    <h5 className="font-semibold text-gray-800 truncate">{account.name}</h5>
                                    <p className="text-sm text-gray-500">{account.platform}</p>
                                </div>
                                {selectedAccountId === account.id && (
                                    <i className="fas fa-check-circle text-indigo-600 text-xl"></i>
                                )}
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500">
                                <i className="fas fa-ghost fa-2x mb-2"></i>
                                <p>所有帳號今日皆已推播！</p>
                            </div>
                        )}
                    </div>
                </>
            );
        }

        if (isLoading) {
            return (
                <div className="text-center py-10">
                    <i className="fas fa-spinner fa-spin fa-3x text-indigo-600"></i>
                    <p className="mt-4 text-gray-600">AI 正在為您創作中...</p>
                </div>
            );
        }

        return (
            <>
                <div className="mb-4">
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                        {['Amazon', 'Shopee', 'ePay'].map(p => {
                            let iconClass = '';
                            if (p === 'Amazon') iconClass = 'fab fa-amazon';
                            else if (p === 'Shopee') iconClass = 'fas fa-shopping-cart';
                            else if (p === 'ePay') iconClass = 'fas fa-credit-card';
                            
                            return (
                                <button 
                                    key={p} 
                                    onClick={() => handlePlatformChange(p)}
                                    className={`flex-1 py-2 px-2 rounded-md text-sm font-semibold transition-all ${activePlatform === p ? 'bg-white text-indigo-600 shadow-sm' : 'bg-transparent text-gray-600'}`}>
                                    <i className={`${iconClass} mr-1.5`}></i>{p}
                                </button>
                            );
                        })}
                    </div>
                </div>
                <textarea value={generatedText} onChange={(e) => setGeneratedText(e.target.value)} rows="8" className="w-full p-3 text-gray-700 bg-gray-100 border border-gray-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                <p className="text-xs text-gray-500 mt-2 text-center">💡 提醒：發佈時請記得加上 <span className="font-semibold text-indigo-600">#廣告</span> 標籤。</p>
            </>
        );
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-end ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`modal-overlay-transition absolute inset-0 bg-black ${isOpen ? 'bg-opacity-60' : 'bg-opacity-0'}`} onClick={onClose}></div>
            <div className={`modal-content-transition bg-white w-full rounded-t-2xl shadow-xl transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                 <div className="p-4">
                    <div className="w-10 h-1.5 bg-gray-300 rounded-full mx-auto mb-3"></div>
                </div>
                
                <div className="p-4 pt-0">
                    {renderContent()}
                </div>

                {!isLoading && modalView === 'generate' && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 gap-3">
                        <button 
                            onClick={startGenerationProcess} 
                            className="py-2.5 px-5 rounded-lg font-medium transition-all duration-300 ease-in-out bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex-grow"
                            aria-label="重新生成文案"
                        >
                            <i className="fas fa-random mr-2"></i>
                            重新生成
                        </button>
                        <button onClick={() => setModalView('selectAccount')} className="py-2.5 px-5 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 relative flex-grow">
                            <i className="fas fa-paper-plane mr-2"></i>文案推播
                        </button>
                    </div>
                )}
                 {!isLoading && modalView === 'selectAccount' && (
                    <div className="flex items-center justify-between p-4 border-t border-gray-200 gap-3">
                        <button onClick={() => setModalView('generate')} className="py-2.5 px-5 rounded-lg font-medium transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 w-1/3">
                            <i className="fas fa-arrow-left"></i> 上一步
                        </button>
                        <button onClick={handleConfirmPush} disabled={!selectedAccountId || availableAccounts.length === 0} className="py-2.5 px-5 rounded-lg font-medium transition-colors bg-indigo-600 text-white hover:bg-indigo-700 relative w-2/3 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                            確認送出
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GenerationModal;

