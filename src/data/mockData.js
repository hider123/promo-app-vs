// src/data/mockData.js

// 模擬的商品資料
export const initialProducts = [
    {
        id: 'B08P5J5Y4X',
        name: '高效能無線降噪耳機',
        description: '沉浸式音效，40小時續航',
        price: 'NT$2,499',
        rating: 4.8,
        image: 'https://placehold.co/600x400/e2e8f0/475569?text=商品圖片1',
        tag: { text: '熱銷', color: 'bg-red-500' }
    },
    {
        id: 'B09G8T4V3Z',
        name: '智慧自動掃地機器人',
        description: '雷射導航，吸拖一體',
        price: 'NT$8,990',
        rating: 4.9,
        image: 'https://placehold.co/600x400/e2e8f0/475569?text=商品圖片2',
        tag: null
    },
    {
        id: 'B07Y8W3X4Y',
        name: '人體工學辦公椅',
        description: '全網布設計，可調式扶手',
        price: 'NT$4,500',
        rating: 4.7,
        image: 'https://placehold.co/600x400/e2e8f0/475569?text=商品圖片3',
        tag: null
    },
    {
        id: 'B083K6L9L9',
        name: '輕量化防水登山背包',
        description: '40L大容量，背負系統佳',
        price: 'NT$1,880',
        rating: 4.6,
        image: 'https://placehold.co/600x400/e2e8f0/475569?text=商品圖片4',
        tag: { text: '新品', color: 'bg-green-500' }
    }
];

// 貓池假資料
export const initialPoolAccountsData = [
    { name: 'Travel_Lover_99', platform: 'Instagram', avatar: 'https://placehold.co/100x100/fecaca/991b1b?text=T', createdAt: new Date(Date.now() - 3600000 * 2) },
    { name: '美食日記', platform: 'Facebook 粉絲專頁', avatar: 'https://placehold.co/100x100/dbeafe/1e3a8a?text=美', createdAt: new Date(Date.now() - 3600000) },
    { name: 'TechGeek Reviews', platform: 'X (Twitter)', avatar: 'https://placehold.co/100x100/d1fae5/064e3b?text=T', createdAt: new Date() },
];

// 團隊成員假資料
export const initialTeamMembersData = [
    { name: '艾蜜莉', role: '首席顧問', avatar: 'https://placehold.co/100x100/fecaca/991b1b?text=艾', status: '在線' },
    { name: '陳大文', role: '推廣經理', avatar: 'https://placehold.co/100x100/dbeafe/1e3a8a?text=陳', status: '離線' },
    { name: '林小美', role: '行銷專員', avatar: 'https://placehold.co/100x100/d1fae5/064e3b?text=林', status: '在線' },
];

// 紀錄假資料
export const initialRecordsData = [
    { type: 'deposit', description: '初始測試餘額', date: '2025-09-12 08:30', amount: 1000.00, status: '成功' },
    { type: 'commission', description: '佣金: 高效能無線降噪耳機', date: '2025-09-12 09:28', amount: 125.00, status: '成功', platformDetails: { product: '高效能無線降噪耳機', account: 'Travel_Lover_99', platform: 'Instagram', targetPlatform: 'Amazon'} },
    { type: 'commission', description: '佣金: 智慧自動掃地機器人', date: '2025-09-11 11:15', amount: 449.50, status: '成功', platformDetails: { product: '智慧自動掃地機器人', account: '美食日記', platform: 'Facebook 粉絲專頁', targetPlatform: 'Shopee'} },
];

