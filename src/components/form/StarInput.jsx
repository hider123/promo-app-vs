import React from 'react';

// 這個元件只負責「星級評分」的 UI 和互動
const StarInput = ({ rating, setRating }) => (
    <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
            <i
                key={star}
                className={`fas fa-star cursor-pointer text-2xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}
                onClick={() => setRating(star)}
            />
        ))}
    </div>
);

export default StarInput;
