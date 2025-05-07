const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Hàm thêm tin nhắn vào khung chat
function formatMessage(text) {
  // Nếu có các dòng bắt đầu bằng "- ", xử lý thành danh sách
  if (text.includes("- ")) {
    const lines = text.split("\n").filter(line => line.trim() !== "");
    const listItems = lines.map(line => {
      if (line.trim().startsWith("- ")) {
        return `<li>${line.trim().substring(2)}</li>`;
      } else {
        return `<p>${line}</p>`;
      }
    });
    return `<ul>${listItems.join("")}</ul>`;
  }

  // Nếu không có dấu gạch đầu dòng, giữ nguyên và xuống dòng
  return text.replace(/\n/g, "<br>");
}

// Hàm thêm tin nhắn
function addMessage(text, isUser) {
  const msgElem = document.createElement("div");
  msgElem.classList.add("message", isUser ? "user-msg" : "bot-msg");
  msgElem.innerHTML = isUser ? text : formatMessage(text);
  chatMessages.appendChild(msgElem);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Ghi vào localStorage
  saveChat();
}

// Lưu toàn bộ tin nhắn vào localStorage
function saveChat() {
  const messages = Array.from(chatMessages.children).map(msg => ({
    text: msg.innerHTML,
    isUser: msg.classList.contains("user-msg"),
  }));
  localStorage.setItem("chatMessages", JSON.stringify(messages));
}

// Khi tải trang, load lại
function loadChat() {
  const stored = JSON.parse(localStorage.getItem("chatMessages")) || [];
  stored.forEach(msg => {
    const msgElem = document.createElement("div");
    msgElem.classList.add("message", msg.isUser ? "user-msg" : "bot-msg");
    msgElem.innerHTML = msg.text;
    chatMessages.appendChild(msgElem);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

loadChat(); // gọi khi trang được load


// Bắt sự kiện click nút Gửi
sendBtn.addEventListener("click", async () => {
  const message = userInput.value.trim();
  if (!message) return;
  addMessage(message, true); // Hiển thị tin nhắn của người dùng
  userInput.value = ""; // Xóa ô input

  try {
    // Gọi API /api/chat
    const response = await fetch("/chatbot/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message }),
    });
    const data = await response.json();
    if (data.reply) {
      addMessage(data.reply, false); // Hiển thị tin nhắn bot
    } else if (data.error) {
      addMessage("Lỗi: " + data.error, false);
    }
  } catch (error) {
    console.error("Lỗi khi gọi API /api/chat:", error);
    addMessage("Không thể kết nối đến máy chủ.", false);
  }
});

// (Tuỳ chọn) Bắt phím Enter để gửi
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendBtn.click();
    e.preventDefault();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const chatToggleBtn = document.getElementById("chat-toggle-btn");
  const chatContainer = document.getElementById("chat-container");

  chatToggleBtn.addEventListener("click", () => {
    chatContainer.classList.toggle("hidden");
  });
});


