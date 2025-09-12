import React from 'react';

// 編輯個人資料頁面
const EditProfilePage = ({ onBack }) => {
    return (
        <div className="p-4">
            <div className="relative flex items-center justify-center mb-6">
                <button 
                    onClick={onBack} 
                    className="absolute left-0 text-indigo-600 hover:text-indigo-800"
                    aria-label="返回上一頁"
                >
                    <i className="fas fa-arrow-left fa-lg"></i>
                </button>
                <h1 className="text-2xl font-bold text-gray-800">編輯個人資料</h1>
            </div>

            <div className="space-y-6">
                <div className="flex flex-col items-center pt-4">
                    <div className="relative">
                        <img className="h-24 w-24 rounded-full object-cover" src="https://placehold.co/100x100/e2e8f0/475569?text=頭像" alt="使用者頭像" />
                        <button className="absolute -bottom-1 -right-1 bg-indigo-600 h-8 w-8 rounded-full text-white flex items-center justify-center border-2 border-white">
                            <i className="fas fa-camera"></i>
                        </button>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">使用者名稱</label>
                            <input type="text" id="username" defaultValue="PromoMaster" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"/>
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">電子郵件</label>
                            <input type="email" id="email" defaultValue="promomaster@example.com" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50"/>
                        </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">人臉認證</h3>
                            <p className="text-sm text-gray-500">啟用後，登入或進行敏感操作時需要驗證。</p>
                        </div>
                        <div className="flex items-center">
                             <span className="text-sm font-medium text-gray-600 mr-4">未啟用</span>
                             <button className="py-2 px-4 rounded-md font-semibold text-sm transition-colors duration-300 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                                <i className="fas fa-camera mr-2"></i>啟用
                            </button>
                        </div>
                    </div>
                </div>


                <div className="pt-2">
                    <button className="w-full py-3 rounded-lg font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300">
                        儲存變更
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;

