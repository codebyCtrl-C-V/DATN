const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

router.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: "Tin nhắn không được để trống." });
    }

    const response = await axios.post(
      GEMINI_API_URL,
      {
        contents: [
          // {
          //   role: "system",
          //   parts: [
          //     {
          //       text: `Bạn là một trợ lý AI tư vấn sản phẩm thực phẩm. 
          //   Hãy trả lời ngắn gọn, hữu ích, và thân thiện. Khi người dùng hỏi về sản phẩm, món ăn, thực đơn, giá cả hoặc dinh dưỡng, hãy cung cấp thông tin cụ thể và dễ hiểu.
          //   Nếu không chắc chắn, hãy nói rõ thay vì bịa ra.`,
          //     },
          //   ],
          // },
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const botMessage =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (botMessage) {
      res.json({ reply: botMessage });
    } else {
      res.status(500).json({ error: "Không có phản hồi từ Gemini." });
    }
  } catch (error) {
    console.error(
      "Lỗi khi gọi Gemini API:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Lỗi khi gọi Gemini API." });
  }
});

module.exports = router;
