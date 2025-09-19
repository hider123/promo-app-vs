import React from 'react';

// 這個元件只負責「圖片上傳」的 UI 和互動
const ImageUpload = ({ onFileChange, imagePreview, isProcessing, uploadProgress, statusText }) => {
    const handleProcessFile = (file) => {
        if (!file || isProcessing) return;
        onFileChange(file);
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleProcessFile(e.dataTransfer.files[0]);
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onFileInputChange = (e) => {
        handleProcessFile(e.target.files[0]);
    };

    return (
        <div className="space-y-4">
             <label className="block text-sm font-medium text-gray-700">步驟 1: 上傳商品照片</label>
             <div 
                className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-4 cursor-pointer hover:border-indigo-500 bg-gray-50 transition-colors"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => document.getElementById('image-upload-input').click()}
             >
                <input type="file" id="image-upload-input" accept="image/*" onChange={onFileInputChange} className="hidden" disabled={isProcessing} />
                {imagePreview && <img src={imagePreview} alt="預覽" className="absolute inset-0 w-full h-full object-cover rounded-lg" />}
                
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg">
                        <div className="w-16 h-16 relative">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-gray-600" strokeWidth="10" stroke="currentColor" fill="transparent" r="40" cx="50" cy="50" />
                                <circle
                                    className="text-indigo-500"
                                    strokeWidth="10"
                                    strokeDasharray="251.2"
                                    strokeDashoffset={`calc(251.2 - (251.2 * ${uploadProgress}) / 100)`}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="40" cx="50" cy="50"
                                    style={{ transition: 'stroke-dashoffset 0.3s' }}
                                />
                            </svg>
                             <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                                {Math.round(uploadProgress)}%
                            </span>
                        </div>
                        <p className="mt-4 text-white font-semibold">{statusText}</p>
                    </div>
                )}

                {!isProcessing && !imagePreview && (
                    <div className="text-gray-500">
                        <i className="fas fa-cloud-upload-alt fa-3x"></i>
                        <p className="mt-2 font-semibold">{statusText}</p>
                    </div>
                )}
             </div>
        </div>
    );
};

export default ImageUpload;
