import React, { useState, useEffect, useMemo } from 'react';
// [核心修正] 引入 UserContext Hook，以取得推播記錄
import { useUserContext } from '../context/UserContext.jsx';

// 一個獨立的、可重複使用的倒數計時邏輯 Hook
const useCountdown = (deadlineISOString) => {
    const calculateTimeLeft = () => {
        if (!deadlineISOString) return null;
        
        const targetDate = new Date(deadlineISOString).getTime();
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
        if (!deadlineISOString || timeLeft?.expired) return;
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer);
    }, [deadlineISOString, timeLeft?.expired]);

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

// [核心修正] 一個全新的、用來顯示剩餘推播次數的元件
const PushCountDisplay = ({ count, limit }) => {
    const remainingCount = limit - count;
    const isLimited = remainingCount <= 0;

    return (
        <div className="flex items-center text-sm font-medium text-gray-600" title={`今日剩餘推播次數`}>
            <i className={`fas fa-bullhorn mr-2 ${isLimited ? 'text-gray-400' : 'text-indigo-500'}`}></i>
            <span>剩餘次數: </span>
            <span className={`font-semibold ml-1 ${isLimited ? 'text-red-500' : 'text-gray-800'}`}>
                {remainingCount} / {limit}
            </span>
        </div>
    );
};


const ProductCard = ({ product, onGenerateClick }) => {
    // 1. 從 UserContext 取得推播記錄
    const { records } = useUserContext();
    const timeLeft = useCountdown(product.deadline);

    // 2. 計算此商品今日的推播次數
    const pushesToday = useMemo(() => {
        if (!records) return 0;
        const todayStr = new Date().toLocaleDateString('sv-SE');
        return records.filter(r =>
            r.type === 'commission' &&
            r.date?.startsWith(todayStr) &&
            r.platformDetails?.product === product.name
        ).length;
    }, [records, product.name]);

    const pushLimit = product.pushLimit ?? 100;

    const handleImageError = (e) => {
        const productName = e.target.alt || '商品';
        e.target.src = `https://placehold.co/600x400/e2e8f0/475569?text=${encodeURIComponent(productName)}`;
    };

    const getProductTag = () => {
        if (product.popularity && product.popularity >= 4) {
            return { text: '熱銷', color: 'bg-red-500' };
        }
        return product.tag;
    };
    
    const displayTag = getProductTag();

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <div className="relative">
                <img 
                    src={product.image || 'https://placehold.co/600x400/e2e8f0/475569?text=無圖片'} 
                    alt={product.name} 
                    className="w-full h-48 object-cover" 
                    onError={handleImageError}
                />
                {displayTag && (
                    <div className={`absolute top-2 left-2 ${displayTag.color} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                        {displayTag.text}
                    </div>
                )}
            </div>
            <div className="p-4 flex flex-col flex-grow">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate" title={product.name}>{product.name}</h3>
                    <p className="text-gray-500 text-sm mt-1 h-10 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.description}
                    </p>
                </div>

                <div className="flex-grow"></div>

                <div className="space-y-3 mt-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xl font-bold text-indigo-600">{product.price}</p>
                        {/* [核心修正] 將星級評分替換為剩餘推播次數 */}
                        <PushCountDisplay count={pushesToday} limit={pushLimit} />
                    </div>
                    
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

