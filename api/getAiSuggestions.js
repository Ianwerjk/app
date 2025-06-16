
// 這是 Vercel 雲函數的標準寫法
export default async function handler(request, response) {
  // 只允許 POST 請求
  if (request.method !== 'POST') {
    return response.status(405).json({ error: '僅允許 POST 方法' });
  }

  // 從前端傳來的請求中，解析出 prompt
  const { prompt } = request.body;
  
  // 從 Vercel 的環境變數中，安全地讀取您儲存的 API 金鑰
  const geminiApiKey = process.env.GEMINI_API_KEY;

  // 如果沒有設定金鑰，返回錯誤訊息
  if (!geminiApiKey) {
    return response.status(500).json({ error: '管理員尚未設定 Gemini API 金鑰。' });
  }

  // 準備呼叫 Google Gemini API
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;
  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }]
  };

  try {
    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('Google API Error:', errorBody);
      return response.status(geminiResponse.status).json({ error: `Google API 請求失敗: ${geminiResponse.statusText}` });
    }

    const result = await geminiResponse.json();
    
    // 從 Google 的回傳結果中，取出我們需要的文字
    const text = result.candidates[0].content.parts[0].text;

    // 將成功的結果回傳給前端
    return response.status(200).json({ text: text });

  } catch (error) {
    console.error('Handler Error:', error);
    return response.status(500).json({ error: '雲端函數執行時發生內部錯誤。' });
  }
}
