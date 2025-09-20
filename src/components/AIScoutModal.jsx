import React, { useState, useEffect, useCallback } from 'react';
import { useAdminContext } from '../context/AdminContext.jsx';

// 一個專為此元件設計的、帶有 AI 救援功能的圖片顯示元件
const ScoutImage = ({ src, alt, onGenerated }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => { setImageSrc(src); }, [src]);

    const handleImageError = async () => {
        if (imageSrc !== src) { return; } // 防止無限迴圈
        setIsGenerating(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("未設定 API 金鑰");
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const prompt = `一張專業、乾淨的商品照片：「${alt}」，白色的背景。`;
            const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API 請求失敗`);
            const result = await response.json();
            if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
                const newImageSrc = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setImageSrc(newImageSrc);
                onGenerated(newImageSrc); // 將新圖片資料回傳給父元件
            } else {
                throw new Error("AI 未能回傳有效的圖片資料。");
            }
        } catch (err) {
            console.error("AI 圖片生成失敗:", err);
            setImageSrc(`https://placehold.co/100x100/e2e8f0/475569?text=失敗`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-16 h-16 object-cover rounded-md mr-4 flex-shrink-0 relative bg-gray-100">
            {isGenerating && <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"><i className="fas fa-spinner fa-spin text-white"></i></div>}
            <img key={imageSrc} src={imageSrc} alt={alt} className="w-full h-full object-cover" onError={handleImageError} />
        </div>
    );
};

const AIScoutModal = ({ isOpen, onClose, keyword }) => {
    // 1. 從 Context 取得所需的函式
    const { handleAddMultipleProducts, showAlert } = useAdminContext();
    
    // 2. 管理此元件自身的 UI 狀態
    const [isLoading, setIsLoading] = useState(true);
    const [statusText, setStatusText] = useState('AI 正在為您搜尋中...');
    const [error, setError] = useState(null);
    const [scoutedProducts, setScoutedProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(new Set());

    // 3. 定義核心函式
    const handleGeneratedImage = (index, newBase64Url) => {
        setScoutedProducts(prev => {
            const newProducts = [...prev];
            newProducts[index] = { ...newProducts[index], image_url: newBase64Url };
            return newProducts;
        });
    };

    const fetchAIProducts = useCallback(async (searchKeyword) => {
        setIsLoading(true);
        setError(null);
        setScoutedProducts([]);
        setSelectedProducts(new Set());

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setError("錯誤：未設定 Gemini API 金鑰。");
            setIsLoading(false);
            return;
        }

        try {
            setStatusText('正在搜尋商品資訊...');
            const userQuery = `身為一位專業的電商產品研究員，請根據以下關鍵字，在全球網路上搜尋五款最受歡迎、評價最高的相關產品。請以繁體中文回傳。關鍵字：「${searchKeyword}」`;
            const schema = {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        name: { type: "STRING" },
                        description: { type: "STRING" },
                        price: { type: "NUMBER" },
                        category: { type: "STRING" },
                    },
                    required: ["name", "description", "price", "category"]
                }
            };
            const dataApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
            const dataPayload = { contents: [{ parts: [{ text: userQuery }] }], generationConfig: { responseMimeType: "application/json", responseSchema: schema }};
            const dataResponse = await fetch(dataApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataPayload) });
            if (!dataResponse.ok) throw new Error(`商品資料搜尋失敗 (${dataResponse.status})`);
            
            const dataResult = await dataResponse.json();
            const productDataList = JSON.parse(dataResult.candidates?.[0]?.content?.parts?.[0]?.text);
            if (!productDataList || productDataList.length === 0) throw new Error("AI 未能找到相關的商品資料。");
            
            setStatusText('正在為商品生成圖片...');
            const imageGenerationPromises = productDataList.map(async (product) => {
                const imageGenApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
                const prompt = `一張專業、乾淨的商品照片：「${product.name}」，白色的背景。`;
                const imagePayload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
                const imageResponse = await fetch(imageGenApiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(imagePayload) });
                if (!imageResponse.ok) return { ...product, image_url: null };
                const imageResult = await imageResponse.json();
                return { ...product, image_url: imageResult.predictions?.[0]?.bytesBase64Encoded ? `data:image/png;base64,${imageResult.predictions[0].bytesBase64Encoded}` : null };
            });
            const finalProducts = await Promise.all(imageGenerationPromises);
            setScoutedProducts(finalProducts);
        } catch (err) {
            console.error("AI 處理失敗:", err);
            setError(err.message || "處理時發生錯誤，請稍後再試。");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && keyword) {
            fetchAIProducts(keyword);
        }
    }, [isOpen, keyword, fetchAIProducts]);

    const handleSelectionChange = (product) => {
        setSelectedProducts(prev => {
            const newSelection = new Set(prev);
            const existingProduct = [...newSelection].find(p => p.name === product.name);
            if (existingProduct) {
                newSelection.delete(existingProduct);
            } else {
                newSelection.add(product);
            }
            return newSelection;
        });
    };

    const handleAddSelected = async () => {
        if (selectedProducts.size === 0) {
            showAlert('請至少選擇一個商品。');
            return;
        }
        await handleAddMultipleProducts(Array.from(selectedProducts));
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-lg mx-auto rounded-lg shadow-xl z-10">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">AI 商品偵察員</h3>
                    <p className="text-sm text-gray-500 mt-1">為您找到的「{keyword}」熱門商品如下：</p>
                    <div className="mt-6 border rounded-lg max-h-96 overflow-y-auto">
                        {isLoading && ( <div className="text-center p-12"><i className="fas fa-spinner fa-spin fa-3x text-indigo-600"></i><p className="mt-4 font-semibold">{statusText}</p></div> )}
                        {error && <div className="p-4 text-red-600 bg-red-100 text-center font-semibold">{error}</div>}
                        {!isLoading && scoutedProducts.length > 0 && (
                            <ul className="divide-y divide-gray-200">
                                {scoutedProducts.map((product, index) => {
                                    const isSelected = [...selectedProducts].some(p => p.name === product.name);
                                    return (
                                        <li key={index} className={`p-4 flex items-center justify-between transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}>
                                            <div className="flex items-center flex-1 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectionChange(product)}
                                                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-4"
                                                />
                                                <ScoutImage 
                                                    src={product.image_url} 
                                                    alt={product.name} 
                                                    onGenerated={(newUrl) => handleGeneratedImage(index, newUrl)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.description}</p>
                                                    <p className="text-sm text-indigo-600 font-medium mt-1">
                                                        約 US$ {product.price.toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                         {!isLoading && !error && scoutedProducts.length === 0 && ( <div className="text-center p-12 text-gray-500"><p>找不到相關商品，請試試其他關鍵字。</p></div> )}
                    </div>
                </div>
                 <div className="bg-gray-50 px-6 py-3 flex justify-between items-center rounded-b-lg">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300">關閉</button>
                    <button
                        onClick={handleAddSelected}
                        disabled={selectedProducts.size === 0}
                        className="py-2 px-4 rounded-md font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        <i className="fas fa-plus mr-2"></i>新增選中 ({selectedProducts.size}) 商品
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIScoutModal;

