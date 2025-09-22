import React, { useState, useEffect } from 'react';
import { useUserContext } from '../../context/UserContext.jsx';
import { uploadFile } from '../../firebase/config.js';
import imageCompression from 'browser-image-compression';
// [修正] 更新 import 路徑，以符合您新的檔案位置
import QRCodeUpload from '../../components/QRCodeUpload.jsx';

// 收款方式設定頁面
const WithdrawalSettingsPage = ({ onBack }) => {
    const { paymentInfo, handleUpdatePaymentInfo } = useUserContext();

    const [activeTab, setActiveTab] = useState('alipay');
    const [formData, setFormData] = useState({
        alipay: { account: '', qrCodeUrl: '' },
        wechat: { account: '', qrCodeUrl: '' },
        bankcard: { number: '', name: '', bankName: '' }
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isAlipayProcessing, setIsAlipayProcessing] = useState(false);
    const [isWechatProcessing, setIsWechatProcessing] = useState(false);

    useEffect(() => {
        if (paymentInfo) {
            const newFormData = {
                alipay: { ...formData.alipay, ...paymentInfo.alipay },
                wechat: { ...formData.wechat, ...paymentInfo.wechat },
                bankcard: { ...formData.bankcard, ...paymentInfo.bankcard },
            };
            setFormData(newFormData);
        }
    }, [paymentInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [name]: value
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await handleUpdatePaymentInfo(formData);
        setIsSaving(false);
    };

    const handleQRCodeUpload = async (file, method) => {
        if (!file) return;

        const setProcessing = method === 'alipay' ? setIsAlipayProcessing : setIsWechatProcessing;
        setProcessing(true);

        try {
            const compressedFile = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 800 });
            const downloadURL = await uploadFile(compressedFile, 'qrcodes/');
            
            setFormData(prev => ({
                ...prev,
                [method]: { ...prev[method], qrCodeUrl: downloadURL }
            }));

        } catch (error) {
            console.error('二維碼上傳失敗:', error);
        } finally {
            setProcessing(false);
        }
    };
    
    const handleRemoveQRCode = (method) => {
        setFormData(prev => ({
            ...prev,
            [method]: { ...prev[method], qrCodeUrl: '' }
        }));
    };

    const inputClass = "mt-2 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base py-2.5 px-4 bg-gray-50";

    const renderFormContent = () => {
        switch (activeTab) {
            case 'alipay':
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="alipay-account" className="block text-base font-medium text-gray-700">支付寶帳號 (手機或信箱)</label>
                            <input type="text" name="account" id="alipay-account" value={formData.alipay.account || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <QRCodeUpload 
                            label="收款二維碼 (可選)"
                            imagePreview={formData.alipay.qrCodeUrl}
                            onFileChange={(file) => handleQRCodeUpload(file, 'alipay')}
                            onRemove={() => handleRemoveQRCode('alipay')}
                            isProcessing={isAlipayProcessing}
                        />
                    </div>
                );
            case 'wechat':
                return (
                     <div className="space-y-6">
                        <div>
                            <label htmlFor="wechat-account" className="block text-base font-medium text-gray-700">微信號</label>
                            <input type="text" name="account" id="wechat-account" value={formData.wechat.account || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <QRCodeUpload 
                            label="收款二維碼 (可選)"
                            imagePreview={formData.wechat.qrCodeUrl}
                            onFileChange={(file) => handleQRCodeUpload(file, 'wechat')}
                            onRemove={() => handleRemoveQRCode('wechat')}
                            isProcessing={isWechatProcessing}
                        />
                    </div>
                );
            case 'bankcard':
                return (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="bank-name" className="block text-base font-medium text-gray-700">真實姓名</label>
                            <input type="text" name="name" id="bank-name" value={formData.bankcard.name || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="bank-number" className="block text-base font-medium text-gray-700">銀行卡號</label>
                            <input type="text" name="number" id="bank-number" value={formData.bankcard.number || ''} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="bank-bankName" className="block text-base font-medium text-gray-700">開戶銀行</label>
                            <input type="text" name="bankName" id="bank-bankName" value={formData.bankcard.bankName || ''} onChange={handleChange} className={inputClass} placeholder="例如：中國信託商業銀行" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const TabButton = ({ tabId, label, icon }) => (
        <button
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-base font-semibold border-b-4 transition-colors ${activeTab === tabId ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
        >
            <i className={icon}></i>
            {label}
        </button>
    );

    return (
        <div className="p-4 space-y-6">
            <div className="relative flex items-center justify-center">
                <button onClick={onBack} className="absolute left-0 text-indigo-600 hover:text-indigo-800" aria-label="返回上一頁">
                    <i className="fas fa-arrow-left fa-lg"></i>
                </button>
                <h1 className="text-3xl font-bold text-gray-800">收款方式設定</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg">
                <div className="border-b border-gray-200">
                    <nav className="flex" aria-label="Tabs">
                        <TabButton tabId="alipay" label="支付寶" icon="fab fa-alipay" />
                        <TabButton tabId="wechat" label="微信" icon="fab fa-weixin" />
                        <TabButton tabId="bankcard" label="銀行卡" icon="fas fa-credit-card" />
                    </nav>
                </div>
                
                <div className="p-6">
                    {renderFormContent()}
                </div>

                <div className="bg-gray-50 px-6 py-4 rounded-b-xl">
                     <button
                        type="submit"
                        disabled={isSaving || isAlipayProcessing || isWechatProcessing}
                        className="w-full py-3 text-lg rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {isSaving ? '儲存中...' : '儲存設定'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default WithdrawalSettingsPage;