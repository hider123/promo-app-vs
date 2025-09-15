import React, { useState, useEffect } from 'react';

// 一個獨立的、可重複使用的倒數計時邏輯 Hook
const useCountdown = (createdAt) => {
    const calculateTimeLeft = () => {
        if (!createdAt) return null;
        
        let creationDate;
        if (createdAt && typeof createdAt.toDate === 'function') {
            creationDate = createdAt.toDate();
        } else if (typeof createdAt === 'string') {
            creationDate = new Date(createdAt);
        } else {
            return null;
        }

        const targetDate = creationDate.getTime() + 2 * 24 * 60 * 60 * 1000;
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference <= 0) {
            return { expired: true };
        }

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
            expired: false,
        };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        if (!createdAt || timeLeft?.expired) return;

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [createdAt, timeLeft?.expired]);

    return timeLeft;
};

// 倒數計時的顯示元件
const CountdownTimer = ({ timeLeft }) => {
    if (!timeLeft) return null; 
    if (timeLeft.expired) {
        return (
            <div className="text-center text-sm font-bold text-red-500 py-2">
                <i className="fas fa-times-circle mr-2"></i>優惠已結束
            </div>
        );
    }
    return (
        <div className="text-center text-sm font-semibold text-gray-800 bg-gray-100 rounded-lg py-2">
            <i className="fas fa-clock mr-2 text-indigo-500"></i>
            <span>限時倒數: </span>
            <span className="font-mono">{timeLeft.days}天 {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
        </div>
    );
};

const ProductCard = ({ product, onGenerateClick }) => {
    const timeLeft = useCountdown(product.createdAt);

    const handleImageError = (e) => {
        const productName = e.target.alt || '商品';
        e.target.src = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(productName)}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <div className="relative">
                <img 
                    src={product.image || 'https://placehold.co/600x400/e2e8f0/475569?text=無圖片'} 
                    alt={product.name} 
                    className="w-full h-48 object-cover" 
                    onError={handleImageError}
                />
                {product.tag && (
                    <div className={`absolute top-2 ${product.tag.text === '熱銷' ? 'right-2' : 'left-2'} ${product.tag.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {product.tag.text}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                {/* 頂部內容: 標題和描述 */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 h-10 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.description}
                    </p>
                </div>

                {/* 這是一個彈性空間，會自動伸展，將下方的內容推至卡片底部 */}
                <div className="flex-grow"></div>

                {/* 底部內容 */}
                <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-indigo-600">{product.price}</p>
                        <div className="flex items-center text-yellow-400">
                            <i className="fas fa-star"></i>
                            <span className="ml-1 text-gray-600 font-medium">{product.rating}</span>
                        </div>
                    </div>
                    
                    {/* 給予固定高度，防止倒數計時器出現時畫面跳動 */}
                    <div className="h-9">
                        <CountdownTimer timeLeft={timeLeft} />
                    </div>

                    <button
                        className="w-full py-2 px-4 rounded-md font-semibold transition-colors duration-300 bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
                        onClick={() => onGenerateClick(product)}
                    >
                        <i className="fas fa-magic-wand-sparkles mr-2"></i>生成推廣文案
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;

