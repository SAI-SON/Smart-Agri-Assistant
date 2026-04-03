import { useState, useRef, useEffect } from 'react';
import { chatWithExpert } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { Send, Bot, User, Sparkles, Trash2, Leaf } from 'lucide-react';
import './Chat.css';

const suggestedQuestions = [
  'Which crop is best for this season in Punjab?',
  'My tomato leaves are turning yellow. Why?',
  'Best organic fertilizer for rice?',
  'How to increase wheat yield?',
  'When should I harvest sugarcane?',
  'What government schemes are available for farmers?',
];

export default function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.displayName || 'Farmer'}! 🌾 I'm your AI Agriculture Expert. Ask me anything about farming, crops, diseases, fertilizers, or market insights. I'm here to help you grow better!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await chatWithExpert(msg, messages);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t process your request. Please try again. 🙏',
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! 🌱 How can I help you with farming today?`,
    }]);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <strong key={i}>{line.replace(/\*\*/g, '')}</strong>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        return <li key={i}>{line.replace(/^[-•]\s/, '')}</li>;
      }
      if (line.startsWith('# ')) {
        return <h4 key={i}>{line.replace(/^#\s/, '')}</h4>;
      }
      if (line.match(/^\d+\.\s/)) {
        return <li key={i} style={{ listStyleType: 'decimal' }}>{line.replace(/^\d+\.\s/, '')}</li>;
      }
      if (line.trim() === '') return <br key={i} />;
      return <p key={i}>{line}</p>;
    });
  };

  return (
    <div className="chat-page">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <div className="chat-avatar-bot">
            <Leaf size={20} />
          </div>
          <div>
            <h2>Agri AI Expert</h2>
            <span className="online-status">
              <span className="online-dot"></span>
              Online • Powered by Gemini
            </span>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={clearChat}>
          <Trash2 size={16} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? (
                <div className="avatar-bot"><Bot size={16} /></div>
              ) : (
                <div className="avatar-user"><User size={16} /></div>
              )}
            </div>
            <div className="msg-content">
              <div className="msg-bubble">
                {formatMessage(msg.content)}
              </div>
              <span className="msg-time">
                {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant">
            <div className="msg-avatar">
              <div className="avatar-bot"><Bot size={16} /></div>
            </div>
            <div className="msg-content">
              <div className="msg-bubble typing">
                <div className="typing-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="suggestions">
          <p className="suggestions-label"><Sparkles size={14} /> Try asking:</p>
          <div className="suggestion-chips">
            {suggestedQuestions.map((q, i) => (
              <button key={i} className="suggestion-chip" onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input-wrap">
        <div className="chat-input-container">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about farming..."
            rows={1}
            className="chat-input"
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="chat-disclaimer">AI responses are for guidance. Always consult local agriculture experts for critical decisions.</p>
      </div>
    </div>
  );
}
