// --- 台灣縣市列表 ---
const TAIWAN_CITIES_FULL = [
  '臺北市', '新北市', '桃園市', '臺中市', '臺南市', '高雄市', 
  '基隆市', '新竹市', '嘉義市', 
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', 
  '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '臺東縣', 
  '澎湖縣', '金門縣', '連江縣'
];
const TAIWAN_CITIES_SIMPLE = [...new Set(TAIWAN_CITIES_FULL.map(city => city.replace(/[縣市]/, '')))];

// --- AI 標題生成服務 ---
export const generateTitleAI = (formData) => {
  return new Promise(resolve => {
      const getDayDescription = () => {
        if (!formData.eventDate) return "週末";
        const day = new Date(formData.eventDate).getDay();
        if (day === 5) return "週五放鬆夜";
        if (day >= 6 || day === 0) return "陽光週末";
        return "平日小確幸";
      };
      const titleTemplates = {
        "美食饗宴": [`舌尖上的${formData.city}：${getDayDescription()}美食馬拉松`, `吃貨集合！${formData.city}隱藏版巷弄美食探店`],
        "電影夜": [`${getDayDescription()}電影夜：大銀幕下的感動與震撼`, `${formData.city}戲院集合！不爆雷主題觀影團`],
        "運動健身": [`燃燒卡路里！${formData.city}${getDayDescription()}熱血運動會`, `揮灑汗水的時刻：${formData.city}球類運動揪團`],
        "戶外踏青": [`走進大自然：${formData.city}近郊秘境探索`, `${getDayDescription()}的陽光與微風，戶外健行趣`],
      };
      const titles = titleTemplates[formData.category] || [`${formData.city}的${formData.category}聚會`];
      const generatedTitle = titles[Math.floor(Math.random() * titles.length)];
      resolve(generatedTitle);
  });
};

// --- AI 文字生成服務 ---
export const generateDescriptionAI = (formData) => {
    return new Promise(resolve => {
        setTimeout(() => {
            const date = new Date(`${formData.eventDate}T${formData.eventTime}`);
            const formattedDate = date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' });
            const formattedTime = date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: true });
            let goal = "不論是結交新朋友、探索新興趣，還是單純地為生活增添一抹色彩，我們都期待與您一同創造難忘的獨特回憶，分享最真誠的快樂時光！";
            let agenda = "自由交流，輕鬆享受活動氛圍。";
            let notes = "請帶著一顆愉快的心前來！";

            if (formData.category === "電影夜") {
                goal = "您是否也曾被大銀幕上的光影深深吸引？...";
                agenda = `1. 集合相見歡\n2. 觀賞電影「${formData.title}」\n3. 映後心得交流（可自由參加）`;
                notes = "建議提早15分鐘到場取票或劃位，電影票請各自購買。";
            } else if (formData.category === "美食饗宴") {
                goal = "這不僅僅是一次聚餐，更是一場味蕾的冒險！...";
                agenda = `1. ${formData.location || formData.city}集合\n2. 餐廳/店家巡禮\n3. 用美食交流，認識新朋友`;
                notes = "請務必空著肚子來，並準備好您的相機！費用為均分。";
            } else if (formData.category === "運動健身") {
                goal = "是時候喚醒沉睡的身體，感受汗水淋漓的暢快了！...";
                agenda = `1. 暖身運動\n2. 主運動項目\n3. 緩和收操與交流`;
                notes = "請穿著適合運動的服裝與鞋子，並自備毛巾和水。";
            }

            const locationInfo = formData.eventType === 'online' ? `🔗 **活動連結**\n${formData.onlineLink || '(AI 將自動生成)'}\n\n` : `📍 **集合地點**\n${formData.location || formData.city}\n\n`;
            const plan = `✨ **活動名稱**\n${formData.title}\n\n...`; // (企劃內容)
            
            const onlineLink = formData.eventType === 'online' ? `https://meet.google.com/${Math.random().toString(36).substring(2, 12)}` : null;

            resolve({ plan, onlineLink });
        }, 1500);
    });
};

// --- AI 圖片生成服務 ---
export const generateImageAI = async (formData) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
  const categoryPrompts = {
    "美食饗宴": "a vibrant, professional photograph of a beautifully arranged gourmet food platter...",
    // ... 其他分類
  };
  const mainSubject = categoryPrompts[formData.category] || `an event about ${formData.title}`;
  const prompt = `Professional event poster style... The title of the event is "${formData.title}".`;
  const payload = { instances: [{ prompt }], parameters: { "sampleCount": 1 } };
  try {
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`API 請求失敗`);
    const result = await response.json();
    return result.predictions?.[0]?.bytesBase64Encoded || null;
  } catch (error) {
    console.error("AI 圖片生成失敗:", error);
    return null;
  }
};
