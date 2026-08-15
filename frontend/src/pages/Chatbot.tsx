import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  User, 
  RefreshCw, 
  ShieldAlert, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { Loading, ErrorState } from '../components/Loading';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: string[];
  isError?: boolean;
}

export const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId] = useState<string>(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Default Quick Prompts for SOC Analysts
  const promptSuggestions = [
    "Explain mitigations for a SYN Flood DDoS attack.",
    "What are the indicators of compromise for SQL Injection?",
    "How does SentinelAI perform privacy-preserving Federated Learning?",
    "Analyze the PortScan reconnaissance attack vector."
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Initial Welcome Message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'assistant',
          text: "Hello Analyst! I am SentinelAI Assistant powered by a RAG-backed cybersecurity knowledge base. How can I assist you with threat analysis, MITRE ATT&CK techniques, or incident mitigation today?",
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    }
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: query,
        session_id: sessionId
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.reply || response.response || response.message || "I have analyzed the query against our security knowledge base.",
        timestamp: new Date().toLocaleTimeString(),
        sources: response.sources || ['SentinelAI RAG Engine', 'MITRE ATT&CK v14']
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chatbot API Error:", err);
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        sender: 'assistant',
        text: "Unable to reach the RAG Chatbot Service. Please verify that the FastAPI backend is online and running.",
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: "Conversation history cleared. Ready for new security queries.",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 max-w-6xl mx-auto h-[calc(100vh-7rem)] flex flex-col">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 shrink-0">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">AI Assistant Console</h1>
            <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>RAG SECURITY KNOWLEDGE BASE</span>
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Autonomous security copilot for anomaly diagnostics, playbooks, and threat intel</p>
        </div>

        <button
          onClick={handleClearChat}
          className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition-all text-xs font-mono flex items-center space-x-2 self-start sm:self-auto"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear History</span>
        </button>
      </div>

      {/* CHAT MESSAGES DISPLAY CONTAINER */}
      <div className="flex-1 bg-[#0d1427] border border-slate-800/80 rounded-2xl shadow-xl p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20 border border-blue-400/30">
                <Bot className="w-5 h-5" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none font-sans shadow-md'
                  : msg.isError
                  ? 'bg-rose-950/30 border border-rose-500/30 text-rose-300 rounded-tl-none font-mono'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none font-sans shadow-md'
              }`}
            >
              <div className="flex items-center justify-between space-x-4 border-b border-white/10 pb-1 text-[10px] opacity-75 font-mono">
                <span className="font-bold uppercase tracking-wider">
                  {msg.sender === 'user' ? 'SOC Analyst' : 'Sentinel Copilot'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              <p className="whitespace-pre-wrap">{msg.text}</p>

              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-cyan-400">
                  <span className="text-slate-500">Knowledge Context:</span>
                  {msg.sources.map((src, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 font-mono font-bold border border-slate-700 text-xs">
                <User className="w-5 h-5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl rounded-tl-none space-y-2 text-xs font-mono text-cyan-400 flex items-center space-x-3">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Querying vector database & compiling response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION CHIPS */}
      <div className="flex flex-wrap items-center gap-2 pt-1 shrink-0">
        <span className="text-[11px] font-mono text-slate-400 flex items-center space-x-1">
          <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
          <span>Quick Suggestions:</span>
        </span>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-mono transition-all text-left truncate max-w-xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-3 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask Sentinel Copilot about threats, playbooks, or packet anomalies..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={loading}
          className="flex-1 bg-[#0d1427] border border-slate-800 rounded-xl px-4 py-3 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all shadow-inner"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-40 text-white font-mono font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center space-x-2 border border-blue-400/30"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;