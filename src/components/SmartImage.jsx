import React, { useState, useEffect } from 'react';

const SmartImage = ({ src: initialSrc, alt, className }) => {
    // 1. 使用 state 管理圖片來源，並在外部傳入的 src 變化時更新
    const [imageSrc, setImageSrc] = useState(initialSrc);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        setImageSrc(initialSrc);
    }, [initialSrc]);

    // 2. 處理圖片載入失敗的函式
    const handleImageError = async () => {
        // [核心修正] 透過比較 imageSrc 和 initialSrc，我們可以判斷這是第一次載入失敗，
        // 還是 AI 生成後的圖片再次載入失敗，從而避免無限迴圈。
        if (imageSrc !== initialSrc) {
            setImageSrc(`https://placehold.co/600x400/e2e8f0/475569?text=圖片生成失敗`);
            return;
        }

        console.log(`圖片載入失敗: ${initialSrc}。嘗試 AI 生成新圖片...`);
        setIsGenerating(true);

        // 3. 呼叫 AI 生成圖片
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error("未設定 API 金鑰");
            }

            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
            const prompt = `一張專業、乾淨的商品照片：「${alt}」，白色的背景。`;

            const payload = {
                instances: [{ prompt: prompt }],
                parameters: { "sampleCount": 1 }
            };

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`AI 圖片生成 API 請求失敗，狀態碼：${response.status}`);
            }

            const result = await response.json();
            
            if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
                const newImageSrc = `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
                setImageSrc(newImageSrc);
            } else {
                throw new Error("AI 未能回傳有效的圖片資料。");
            }

        } catch (err) {
            console.error("AI 圖片生成失敗:", err);
            setImageSrc(`https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(alt)}`);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`relative ${className} bg-gray-100`}>
            {isGenerating && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 text-white">
                    <i className="fas fa-spinner fa-spin fa-2x"></i>
                    <p className="mt-2 text-sm font-semibold">AI 正在生成圖片...</p>
                </div>
            )}
            <img 
                // 使用 key 來強制 React 在 imageSrc 改變時，重新掛載 <img> 元素，
                // 這對確保 onError 事件能被穩定觸發非常重要。
                key={imageSrc}
                src={imageSrc} 
                alt={alt} 
                className="w-full h-full object-cover" 
                onError={handleImageError}
            />
        </div>
    );
};

export default SmartImage;

