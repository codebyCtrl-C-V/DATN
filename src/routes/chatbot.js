const express = require("express");
const router = express.Router();
const axios = require("axios");
const dns = require('dns');
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Thử các endpoint khác nhau
const GEMINI_ENDPOINTS = [
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
];

// Force IPv4 cho toàn bộ ứng dụng
dns.setDefaultResultOrder('ipv4first');

// Cấu hình axios với nhiều options
const createGeminiAxios = () => {
  return axios.create({
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; NodeJS-App/1.0)",
    },
    // Force IPv4
    family: 4,
    // Cấu hình retry và keepAlive
    httpsAgent: new (require('https').Agent)({
      keepAlive: true,
      family: 4, // Force IPv4
      timeout: 15000,
    }),
    // Cấu hình DNS
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4, ...options }, callback);
    }
  });
};

// Hàm gọi API với fallback endpoints
const callGeminiAPI = async (data, maxRetries = 2) => {
  const geminiAxios = createGeminiAxios();
  
  for (let endpointIndex = 0; endpointIndex < GEMINI_ENDPOINTS.length; endpointIndex++) {
    const endpoint = GEMINI_ENDPOINTS[endpointIndex];
    console.log(`Thử endpoint ${endpointIndex + 1}: ${endpoint.split('?')[0]}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Endpoint ${endpointIndex + 1}, Lần thử ${attempt}/${maxRetries}`);
        
        const response = await geminiAxios.post(endpoint, data);
        console.log(`✅ Thành công với endpoint ${endpointIndex + 1}`);
        return response;
        
      } catch (error) {
        console.error(`❌ Endpoint ${endpointIndex + 1}, Lần ${attempt} thất bại:`, {
          code: error.code,
          message: error.message,
          status: error.response?.status
        });
        
        // Nếu là lỗi IPv6/timeout, thử endpoint khác ngay
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
          console.log(`🔄 Lỗi timeout, chuyển sang endpoint khác...`);
          break; // Thoát khỏi retry loop, thử endpoint tiếp theo
        }
        
        // Nếu không phải lần thử cuối của endpoint cuối
        if (!(endpointIndex === GEMINI_ENDPOINTS.length - 1 && attempt === maxRetries)) {
          if (attempt < maxRetries) {
            const waitTime = 2000 * attempt;
            console.log(`⏳ Chờ ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } else {
          // Đây là lần thử cuối cùng
          throw error;
        }
      }
    }
  }
};

router.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    if (!userMessage) {
      return res.status(400).json({ error: "Tin nhắn không được để trống." });
    }

    if (!GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY không được cấu hình");
      return res.status(500).json({ error: "Cấu hình API key chưa đúng." });
    }

    const requestData = {
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };

    console.log("🚀 Bắt đầu gọi Gemini API...");
    const startTime = Date.now();
    
    const response = await callGeminiAPI(requestData);
    
    const duration = Date.now() - startTime;
    console.log(`✅ API call hoàn thành trong ${duration}ms`);

    const candidates = response.data.candidates;
    if (!candidates || candidates.length === 0) {
      return res.status(500).json({ error: "Không nhận được phản hồi từ Gemini." });
    }

    const botMessage = candidates[0]?.content?.parts?.[0]?.text?.trim();

    if (botMessage) {
      res.json({ reply: botMessage });
    } else {
      res.status(500).json({ error: "Phản hồi từ Gemini không hợp lệ." });
    }

  } catch (error) {
    console.error("💥 Lỗi cuối cùng:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });

    // Xử lý lỗi cụ thể
    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      return res.status(408).json({ 
        error: "Kết nối bị timeout. Có thể do vấn đề mạng hoặc chặn IPv6. Vui lòng thử lại." 
      });
    }

    if (error.response?.status === 429) {
      return res.status(429).json({ 
        error: "Quá nhiều yêu cầu. Vui lòng chờ một chút." 
      });
    }

    if (error.response?.status === 403 || error.response?.status === 401) {
      return res.status(403).json({ 
        error: "API key không hợp lệ hoặc hết quota." 
      });
    }

    res.status(500).json({ 
      error: "Lỗi kết nối tới Gemini AI. Vui lòng thử lại sau." 
    });
  }
});

module.exports = router;