import { useState, useEffect, useRef } from "react";
import apiClient from "../api/client";
import { Bot, X, Send, Sparkles, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "../assets/styles/components/chatbot.scss";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: '**Uplink Established.** I am Narada AI. I can analyze your infrastructure telemetry. Try asking: *"Is my node production-api online?"*',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const msgsEndRef = useRef(null);

  const scrollToBottom = () => {
    msgsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(1).map((m) => ({
        role: m.role === "bot" ? "assistant" : "user",
        text: m.text,
      }));

      const res = await apiClient.post("/ai/chat", { message: userMsg, history });
      if (res.success) {
        setMessages((prev) => [...prev, { role: "bot", text: res.response || res.data?.reply }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "ERR: Neural link interrupted. AI core unreachable.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="narada-chatbot-wrapper" style={{ display: 'none' }}>
      {/* TRIGGER BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chatbot-trigger ${isOpen ? "active" : ""}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              <Bot size={28} />
              <div className="ping-ring"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbot-window"
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.95,
              transformOrigin: "bottom right",
            }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {/* HEADER */}
            <div className="chat-header">
              <div className="header-left">
                <div className="status-dot"></div>
                <Sparkles size={16} className="sparkle" />
                <span>NARADA CORE v1.0</span>
              </div>
              <Terminal size={14} className="terminal-icon" />
            </div>

            {/* MESSAGES */}
            <div className="chat-body">
              {messages.map((msg, idx) => (
                <div key={idx} className={`msg-row ${msg.role}`}>
                  {msg.role === "bot" && (
                    <div className="bot-avatar">
                      <Bot size={14} />
                    </div>
                  )}
                  <div
                    className="msg-bubble"
                    dangerouslySetInnerHTML={{
                      __html: msg.text.replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              ))}
              {loading && (
                <div className="msg-row bot">
                  <div className="bot-avatar">
                    <Bot size={14} />
                  </div>
                  <div className="msg-bubble loading">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}
              <div ref={msgsEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="chat-footer">
              <div className="input-container">
                <textarea
                  placeholder="Inquire system status..."
                  rows="1"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <button
                  className="send-btn"
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Chatbot;
