import React, { useState, useEffect, useCallback } from 'react';
import { useAdminContext } from '../context/AdminContext.jsx';

// 一個專為此元件設計的、帶有 AI 救援功能的圖片顯示元件
const ScoutImage = ({ src, alt, onGenerated }) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => { setImageSrc(src); }, [src]);

    const handleImageError = async () => {
        if (imageSrc !== src) { return; }
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
    const { handleAddProduct } = useAdminContext();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [scoutedProducts, setScoutedProducts] = useState([]);

    // 當 ScoutImage 成功生成新圖片時，此函式會被呼叫來更新我們的商品列表狀態
    const handleGeneratedImage = (index, newBase64Url) => {
        setScoutedProducts(prev => {
            const newProducts = [...prev];
            // 更新特定商品的 image_url 為新的 base64 資料
            newProducts[index] = { ...newProducts[index], image_url: newBase64Url };
            return newProducts;
        });
    };

    const fetchAIProducts = useCallback(async (searchKeyword) => {
        setIsLoading(true);
        setError(null);
        setScoutedProducts([]);

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            setError("錯誤：未設定 Gemini API 金鑰。請檢查您的 .env 檔案，並確認已重新啟動伺服器。");
            setIsLoading(false);
            return;
        }

        const userQuery = `身為一位專業的電商產品研究員，請根據以下關鍵字，在全球網路上搜尋三款最受歡迎、評價最高的相關產品，並為每款產品提供一張高品質的圖片 URL。請以繁體中文回傳。關鍵字：「${searchKeyword}」`;
        
        const schema = {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    description: { type: "STRING" },
                    price: { type: "NUMBER" },
                    category: { type: "STRING" },
                    image_url: { type: "STRING", format: "uri" }
                },
                required: ["name", "description", "price", "category", "image_url"]
            }
        };

        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const payload = {
                contents: [{ parts: [{ text: userQuery }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                },
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                const errorMessage = errorBody?.error?.message || `API 請求失敗，狀態碼：${response.status}`;
                throw new Error(errorMessage);
            }

            const result = await response.json();
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                const parsedJson = JSON.parse(text);
                setScoutedProducts(parsedJson);
            } else {
                throw new Error("AI 未能回傳有效的商品資料。");
            }
        } catch (err) {
            console.error("AI 商品搜尋失敗:", err);
            setError(err.message || "搜尋時發生錯誤，請稍後再試。");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen && keyword) {
            fetchAIProducts(keyword);
        }
    }, [isOpen, keyword, fetchAIProducts]);

    // [核心修正] 傳入商品在陣列中的索引，而不是商品物件本身
    const handleAddAndClose = (productIndex) => {
        // 從最新的 scoutedProducts 狀態中，取得正確的商品資料
        const productToAdd = scoutedProducts[productIndex];
        handleAddProduct(productToAdd);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
            <div className="bg-white w-11/12 max-w-lg mx-auto rounded-lg shadow-xl z-10">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-800">AI 商品偵察員</h3>
                    <p className="text-sm text-gray-500 mt-1">正在為您搜尋關於「{keyword}」的熱門商品...</p>
                    <div className="mt-6 border rounded-lg max-h-96 overflow-y-auto">
                        {isLoading && ( <div className="text-center p-12"><i className="fas fa-spinner fa-spin fa-3x text-indigo-600"></i><p className="mt-4">AI 正在為您搜尋中...</p></div> )}
                        {error && <div className="p-4 text-red-600 bg-red-100 text-center font-semibold">{error}</div>}
                        {!isLoading && scoutedProducts.length > 0 && (
                            <ul className="divide-y divide-gray-200">
                                {scoutedProducts.map((product, index) => (
                                    <li key={index} className="p-4 flex items-center justify-between">
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
                                        <button 
                                            // [核心修正] 傳入索引 (index)
                                            onClick={() => handleAddAndClose(index)}
                                            className="ml-4 py-2 px-4 rounded-md font-semibold text-sm bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                                        >
                                            新增此商品
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                         {!isLoading && !error && scoutedProducts.length === 0 && ( <div className="text-center p-12 text-gray-500"><p>找不到相關商品，請試試其他關鍵字。</p></div> )}
                    </div>
                </div>
                 <div className="bg-gray-50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-md font-medium bg-gray-200 hover:bg-gray-300">關閉</button>
                </div>
            </div>
        </div>
    );
};

export default AIScoutModal;

