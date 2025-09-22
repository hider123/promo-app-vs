import React from 'react';

const QRCodeUpload = ({ imagePreview, onFileChange, onRemove, isProcessing, label }) => {
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

    const inputId = `qrcode-upload-${label}`;

    return (
        <div>
            <label className="block text-base font-medium text-gray-700">{label}</label>
            <div 
                className="mt-2 relative w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-2 cursor-pointer hover:border-indigo-500 bg-gray-50 transition-colors"
                onDrop={onDrop}
                onDragOver={onDragOver}
                onClick={() => document.getElementById(inputId).click()}
            >
                <input type="file" id={inputId} accept="image/*" onChange={onFileInputChange} className="hidden" disabled={isProcessing} />

                {imagePreview && !isProcessing && (
                    <>
                        <img src={imagePreview} alt="二維碼預覽" className="w-full h-full object-contain rounded-lg" />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation(); // 防止觸發外層的點擊事件
                                onRemove();
                            }}
                            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                            aria-label="移除圖片"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </>
                )}
                
                {isProcessing && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center rounded-lg text-white">
                        <i className="fas fa-spinner fa-spin fa-2x"></i>
                        <p className="mt-2 text-sm font-semibold">上傳中...</p>
                    </div>
                )}

                {!isProcessing && !imagePreview && (
                    <div className="text-gray-500">
                        <i className="fas fa-qrcode fa-3x"></i>
                        <p className="mt-2 text-sm font-semibold">點擊或拖曳上傳</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QRCodeUpload;