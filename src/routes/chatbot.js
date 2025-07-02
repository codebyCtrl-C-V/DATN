const express = require("express");
const router = express.Router();
const axios = require("axios");
const dns = require("dns");
const fs = require("fs").promises;
const path = require("path");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const KNOWLEDGE_FILE = path.join(__dirname, "../../knowledge.json");

// Đọc knowledge base từ file JSON
const loadKnowledgeBase = async () => {
  try {
    const data = await fs.readFile(KNOWLEDGE_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.log("⚠️ Không tìm thấy file knowledge.json, tạo file mới...");
    return [];
  }
};

// Ghi knowledge base ra file JSON
const saveKnowledgeBase = async (data) => {
  try {
    await fs.writeFile(KNOWLEDGE_FILE, JSON.stringify(data, null, 2), "utf8");
    console.log("✅ Đã lưu knowledge base");
  } catch (error) {
    console.error("❌ Lỗi lưu knowledge base:", error);
  }
};

// Chuẩn hóa text (bỏ dấu, ký tự đặc biệt)
const normalizeText = (text) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/gi, "");

// Tìm kiếm gần đúng
const searchRelevantInfo = async (queryText) => {
  try {
    const knowledgeBase = await loadKnowledgeBase();
    const query = normalizeText(queryText);
    const relevantDocs = [];

    knowledgeBase.forEach((doc) => {
      let score = 0;
      const title = normalizeText(doc.title || "");
      const content = normalizeText(doc.content || "");
      const keywords = (doc.keywords || []).map(normalizeText);

      if (title.includes(query)) score += 3;
      if (content.includes(query)) score += 2;

      const queryWords = query.split(" ").filter((w) => w.length > 2);
      queryWords.forEach((word) => {
        if (title.includes(word)) score += 1;
        if (content.includes(word)) score += 0.5;
        if (keywords.some((k) => k.includes(word))) score += 1;
      });

      if (score > 0) {
        relevantDocs.push({ ...doc, relevanceScore: score });
      }
    });

    relevantDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    return relevantDocs.slice(0, 3);
  } catch (error) {
    console.error("❌ Lỗi tìm kiếm:", error);
    return [];
  }
};

// Thêm document mới
router.post("/api/knowledge", async (req, res) => {
  try {
    const { title, content, keywords = [], category = "general" } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title và content là bắt buộc" });
    }

    const knowledgeBase = await loadKnowledgeBase();
    const newId = Math.max(...knowledgeBase.map((doc) => doc.id), 0) + 1;

    const newDoc = {
      id: newId,
      title,
      content,
      keywords: Array.isArray(keywords)
        ? keywords
        : keywords.split(",").map((k) => k.trim()),
      category,
      createdAt: new Date().toISOString(),
    };

    knowledgeBase.push(newDoc);
    await saveKnowledgeBase(knowledgeBase);

    res.json({
      message: "Đã thêm vào knowledge base thành công",
      document: newDoc,
    });
  } catch (error) {
    console.error("❌ Lỗi API knowledge:", error);
    res.status(500).json({ error: "Lỗi thêm vào knowledge base" });
  }
});

// Lấy toàn bộ documents
router.get("/api/knowledge", async (req, res) => {
  try {
    const knowledgeBase = await loadKnowledgeBase();
    res.json(knowledgeBase);
  } catch (error) {
    console.error("❌ Lỗi lấy knowledge base:", error);
    res.status(500).json({ error: "Lỗi lấy knowledge base" });
  }
});

// Xóa document theo id
router.delete("/api/knowledge/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let knowledgeBase = await loadKnowledgeBase();
    knowledgeBase = knowledgeBase.filter((doc) => doc.id !== id);
    await saveKnowledgeBase(knowledgeBase);
    res.json({ message: "Đã xóa document thành công" });
  } catch (error) {
    console.error("❌ Lỗi xóa document:", error);
    res.status(500).json({ error: "Lỗi xóa document" });
  }
});

// Chat endpoint sử dụng context
router.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Tin nhắn không được để trống." });
    }

    console.log(`🔍 Tìm kiếm thông tin cho: "${userMessage}"`);
    const relevantDocs = await searchRelevantInfo(userMessage);

    let context = "";
    if (relevantDocs.length > 0) {
      console.log(`✅ Tìm thấy ${relevantDocs.length} documents liên quan`);
      context = "Thông tin liên quan:\n\n";
      relevantDocs.forEach((doc, index) => {
        context += `${index + 1}. **${doc.title}**\n${doc.content}\n\n`;
      });
      context += "---\n\n";
    } else {
      console.log("⚠️ Không tìm thấy thông tin liên quan");
    }

    const enhancedPrompt = context
      ? `${context}Dựa trên thông tin trên, hãy trả lời câu hỏi một cách chi tiết và hữu ích: ${userMessage}\n\nNếu thông tin trên không đủ để trả lời, hãy trả lời dựa trên kiến thức chung nhưng ghi chú rằng đây là thông tin tổng quát.`
      : `Trả lời câu hỏi sau một cách hữu ích: ${userMessage}`;

    const requestData = {
      contents: [
        {
          role: "user",
          parts: [{ text: enhancedPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    console.log("🚀 Gọi Gemini API...");
    const startTime = Date.now();
    const response = await callGeminiAPI(requestData);
    const duration = Date.now() - startTime;
    console.log(`✅ API call hoàn thành trong ${duration}ms`);

    const candidates = response.data.candidates;
    const botMessage = candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (botMessage) {
      res.json({
        reply: botMessage,
        sources: relevantDocs.map((doc) => ({
          title: doc.title,
          score: doc.relevanceScore,
          category: doc.category,
        })),
        hasContext: relevantDocs.length > 0,
      });
    }

    // if (botMessage) {
    //   // Nếu không có tài liệu liên quan, lưu vào knowledge.json
    //   if (relevantDocs.length === 0) {
    //     const knowledgeBase = await loadKnowledgeBase();
    //     const newId = Math.max(...knowledgeBase.map((doc) => doc.id), 0) + 1;

    //     // Tạo từ khóa tự động từ câu hỏi
    //     const autoKeywords = userMessage
    //       .split(" ")
    //       .map((k) => k.toLowerCase().trim())
    //       .filter((k) => k.length > 2 && isNaN(k)); // Loại bỏ từ quá ngắn và số

    //     const newDoc = {
    //       id: newId,
    //       title: userMessage,
    //       content: botMessage,
    //       keywords: Array.from(new Set(autoKeywords)), // Loại trùng
    //       category: "auto-generated",
    //       createdAt: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().replace('Z', '+07:00'),
    //     };

    //     knowledgeBase.push(newDoc);
    //     await saveKnowledgeBase(knowledgeBase);
    //     console.log("💾 Đã lưu câu hỏi mới vào knowledge base:", userMessage);
    //   }

    //   // Trả lời về client
    //   res.json({
    //     reply: botMessage,
    //     sources: relevantDocs.map((doc) => ({
    //       title: doc.title,
    //       score: doc.relevanceScore,
    //       category: doc.category,
    //     })),
    //     hasContext: relevantDocs.length > 0,
    //   });
    // }
  } catch (error) {
    console.error("💥 Lỗi chatbot:", error);
    res
      .status(500)
      .json({ error: "Lỗi hệ thống chatbot", details: error.message });
  }
});

// Hàm gọi Gemini API
const GEMINI_ENDPOINTS = [
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
];

dns.setDefaultResultOrder("ipv4first");

const createGeminiAxios = () => {
  return axios.create({
    timeout: 20000,
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; NodeJS-App/1.0)",
    },
    family: 4,
    httpsAgent: new (require("https").Agent)({
      keepAlive: true,
      family: 4,
      timeout: 15000,
    }),
    lookup: (hostname, options, callback) => {
      dns.lookup(hostname, { family: 4, ...options }, callback);
    },
  });
};

const callGeminiAPI = async (data, maxRetries = 2) => {
  const geminiAxios = createGeminiAxios();
  for (
    let endpointIndex = 0;
    endpointIndex < GEMINI_ENDPOINTS.length;
    endpointIndex++
  ) {
    const endpoint = GEMINI_ENDPOINTS[endpointIndex];
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await geminiAxios.post(endpoint, data);
        return response;
      } catch (error) {
        if (error.code === "ETIMEDOUT" || error.code === "ECONNABORTED") break;
        if (
          !(
            endpointIndex === GEMINI_ENDPOINTS.length - 1 &&
            attempt === maxRetries
          )
        ) {
          if (attempt < maxRetries)
            await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
        } else throw error;
      }
    }
  }
};

module.exports = router;
