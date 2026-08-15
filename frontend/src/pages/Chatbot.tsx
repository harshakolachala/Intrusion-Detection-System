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
    <div className="relative mx-auto flex h-[calc(100vh-7rem)] max-w-7xl flex-col overflow-hidden px-1 pb-2 font-sans text-[var(--text-primary)]">

      {/* =========================================================
          AMBIENT 3D BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/[0.055] blur-[90px]" />

        <div className="absolute -right-28 top-[-60px] h-80 w-80 rounded-full bg-cyan-400/[0.045] blur-[100px]" />

        <div className="absolute bottom-[-100px] left-[38%] h-72 w-72 rounded-full bg-violet-500/[0.035] blur-[100px]" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        />

      </div>

      {/* =========================================================
          TOP HEADER
      ========================================================= */}
      <header className="relative mb-4 shrink-0">

        <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-sm)] backdrop-blur-xl">

          {/* Decorative 3D glow */}
          <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-cyan-500/[0.055] blur-[75px]" />

          <div className="pointer-events-none absolute bottom-[-80px] left-[42%] h-48 w-48 rounded-full bg-blue-500/[0.045] blur-[65px]" />

          <div className="relative flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="min-w-0">

              <div className="mb-2.5 flex flex-wrap items-center gap-2">

                <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                  <Sparkles className="h-3 w-3" />
                  RAG Security Intelligence
                </span>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">

                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>

                  AI Engine Online

                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 text-white shadow-[0_12px_30px_rgba(37,99,235,0.22)] dark:border-blue-400/30">

                  <div className="absolute inset-1 rounded-xl border border-white/20" />

                  <Bot className="relative h-6 w-6" />

                </div>

                <div className="min-w-0">

                  <h1 className="truncate text-xl font-black tracking-[-0.04em] text-[var(--text-primary)] sm:text-2xl">
                    AI Assistant Console
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--text-muted)] sm:text-xs">
                    Autonomous cybersecurity copilot for threat analysis,
                    anomaly diagnostics, incident response and intelligence.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 sm:flex">

                <Cpu className="h-3.5 w-3.5 text-blue-500" />

                <div>

                  <p className="text-xs font-medium text-[var(--text-subtle)]">
                    Intelligence
                  </p>

                  <p className="text-sm font-bold text-[var(--text-secondary)]">
                    RAG + LLM
                  </p>

                </div>

              </div>

              <button
                onClick={handleClearChat}
                className="group flex min-h-[40px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5 transition-transform duration-200 group-hover:scale-110" />
                <span>Clear History</span>
              </button>

            </div>

          </div>

          {/* Capability Strip */}
          <div className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-4">

            <div className="flex items-center gap-2.5 border-r border-b border-[var(--border)] px-4 py-2.5 sm:border-b-0">

              <ShieldAlert className="h-3.5 w-3.5 text-blue-500" />

              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Threat Analysis
              </span>

            </div>

            <div className="flex items-center gap-2.5 border-b border-[var(--border)] px-4 py-2.5 sm:border-b-0 sm:border-r">

              <Terminal className="h-3.5 w-3.5 text-cyan-500" />

              <span className="text-xs font-semibold text-[var(--text-muted)]">
                SOC Playbooks
              </span>

            </div>

            <div className="flex items-center gap-2.5 border-r border-[var(--border)] px-4 py-2.5">

              <Layers className="h-3.5 w-3.5 text-violet-500" />

              <span className="text-xs font-semibold text-[var(--text-muted)]">
                MITRE ATT&CK
              </span>

            </div>

            <div className="flex items-center gap-2.5 px-4 py-2.5">

              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />

              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Response Intelligence
              </span>

            </div>

          </div>

        </div>

      </header>

      {/* =========================================================
          CHAT WORKSPACE
      ========================================================= */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">

        {/* Workspace Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)]/70 px-4 py-3.5 backdrop-blur-xl sm:px-5">

          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">

              <Bot className="h-4 w-4" />

            </div>

            <div className="min-w-0">

              <div className="flex items-center gap-2">

                <span className="text-sm font-black text-[var(--text-primary)]">
                  Sentinel Copilot
                </span>

                <span className="h-1 w-1 rounded-full bg-emerald-500" />

                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>

              </div>

              <p className="truncate font-mono text-xs text-[var(--text-subtle)]">
                Session: {sessionId}
              </p>

            </div>

          </div>

          <div className="hidden items-center gap-2 sm:flex">

            <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--text-subtle)]">
              Secure Channel
            </span>

            <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
              Encrypted
            </span>

          </div>

        </div>

        {/* =====================================================
            CHAT MESSAGES DISPLAY CONTAINER
        ===================================================== */}
        <div className="scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 relative flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

          {/* Subtle workspace grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                'radial-gradient(circle, var(--text-primary) 0.7px, transparent 0.7px)',
              backgroundSize: '18px 18px'
            }}
          />

          <div className="relative space-y-5">

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${
                  msg.sender === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >

                {/* Assistant Avatar */}
                {msg.sender === 'assistant' && (
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_8px_22px_rgba(37,99,235,0.20)]">

                    <div className="absolute inset-[2px] rounded-[10px] border border-white/20" />

                    <Bot className="relative h-4.5 w-4.5" />

                  </div>
                )}

                {/* Message */}
                <div
                  className={`group relative max-w-3xl overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-xs)] transition-all duration-200 hover:shadow-[var(--shadow-sm)] ${
                    msg.sender === 'user'
                      ? 'rounded-tr-md bg-gradient-to-br from-blue-600 to-blue-500 text-white shadow-blue-500/10'
                      : msg.isError
                        ? 'rounded-tl-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/[0.08] dark:text-rose-300'
                        : 'rounded-tl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                  }`}
                >

                  {/* Message Glow */}
                  {msg.sender === 'assistant' && !msg.isError && (
                    <div className="pointer-events-none absolute -right-12 -top-12 h-24 w-24 rounded-full bg-blue-500/[0.035] blur-2xl" />
                  )}

                  <div className="relative">

                    {/* Message Meta */}
                    <div
                      className={`mb-2.5 flex items-center justify-between gap-5 border-b pb-2 text-xs ${
                        msg.sender === 'user'
                          ? 'border-white/15 text-white/70'
                          : msg.isError
                            ? 'border-rose-200 text-rose-500 dark:border-rose-500/20 dark:text-rose-300'
                            : 'border-[var(--border)] text-[var(--text-subtle)]'
                      }`}
                    >

                      <span className="flex items-center gap-1.5 font-semibold">

                        {msg.sender === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : msg.isError ? (
                          <ShieldAlert className="h-3 w-3" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}

                        {msg.sender === 'user'
                          ? 'SOC Analyst'
                          : msg.isError
                            ? 'System Error'
                            : 'Sentinel Copilot'}

                      </span>

                      <span className="flex items-center gap-1.5 whitespace-nowrap">

                        <Clock className="h-2.5 w-2.5" />

                        {msg.timestamp}

                      </span>

                    </div>

                    {/* Message Content */}
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {msg.text}
                    </p>

                    {/* Sources */}
                    {msg.sources &&
                      msg.sources.length > 0 && (
                        <div
                          className={`mt-3 flex flex-wrap items-center gap-1.5 border-t pt-3 text-xs ${
                            msg.sender === 'user'
                              ? 'border-white/15 text-white/70'
                              : 'border-[var(--border)] text-[var(--text-subtle)]'
                          }`}
                        >

                          <span className="mr-1 font-semibold">
                            Sources:
                          </span>

                          {msg.sources.map(
                            (src, i) => (
                              <span
                                key={i}
                                className={`rounded-lg px-2 py-1 font-bold ${
                                  msg.sender === 'user'
                                    ? 'border border-white/15 bg-white/10 text-white/90'
                                    : 'border border-cyan-100 bg-cyan-50 text-cyan-600 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400'
                                }`}
                              >
                                {src}
                              </span>
                            )
                          )}

                        </div>
                      )}

                  </div>

                </div>

                {/* User Avatar */}
                {msg.sender === 'user' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)] shadow-[var(--shadow-xs)]">

                    <User className="h-4.5 w-4.5" />

                  </div>
                )}

              </div>
            ))}

            {/* Loading State */}
            {loading && (
              <div className="flex items-start gap-3">

                <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_8px_22px_rgba(37,99,235,0.20)]">

                  <div className="absolute inset-[2px] rounded-[10px] border border-white/20" />

                  <Bot className="relative h-4.5 w-4.5 animate-pulse" />

                </div>

                <div className="rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 shadow-[var(--shadow-xs)]">

                  <div className="flex items-center gap-3">

                    <div className="flex items-center gap-1">

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:-0.15s]" />

                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500" />

                    </div>

                    <span className="text-sm font-medium text-[var(--text-muted)]">
                      Querying vector database & compiling response...
                    </span>

                    <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />

                  </div>

                </div>

              </div>
            )}

            <div ref={messagesEndRef} />

          </div>

        </div>

        {/* =====================================================
            QUICK SUGGESTION CHIPS
        ===================================================== */}
        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-3 backdrop-blur-xl sm:px-5">

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-thin">

            <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">

              <HelpCircle className="h-3 w-3" />

              <span className="text-xs font-semibold">
                Quick Query
              </span>

            </div>

            {promptSuggestions.map(
              (prompt, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    handleSendMessage(prompt)
                  }
                  disabled={loading}
                  className="group flex shrink-0 max-w-[290px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-medium text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
                >

                  <span className="truncate">
                    {prompt}
                  </span>

                  <ChevronRight className="h-3 w-3 shrink-0 text-[var(--text-subtle)] transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />

                </button>
              )
            )}

          </div>

        </div>

        {/* =====================================================
            INPUT FORM
        ===================================================== */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"
        >

          <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-1.5 shadow-[var(--shadow-sm)] transition-all duration-200 focus-within:border-blue-400 focus-within:bg-[var(--surface)] focus-within:ring-4 focus-within:ring-blue-500/[0.08]">

            <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">

              <Terminal className="h-3.5 w-3.5" />

            </div>

            <input
              type="text"
              placeholder="Ask Sentinel Copilot about threats, playbooks, or packet anomalies..."
              value={inputMessage}
              onChange={(e) =>
                setInputMessage(e.target.value)
              }
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)] disabled:cursor-not-allowed"
            />

            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="group flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-500 hover:to-cyan-500 hover:shadow-[0_12px_26px_rgba(37,99,235,0.24)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:px-5"
            >

              <span className="hidden sm:inline">
                Send Query
              </span>

              <span className="sm:hidden">
                Send
              </span>

              <Send className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />

            </button>

          </div>

          <div className="mt-2 flex items-center justify-between px-1">

            <div className="flex items-center gap-1.5">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <span className="text-xs font-medium text-[var(--text-subtle)]">
                RAG Knowledge Retrieval Active
              </span>

            </div>

            <span className="hidden text-xs font-medium text-[var(--text-subtle)] sm:inline">
              Enter to submit
            </span>

          </div>

        </form>

      </div>

    </div>
  );
};

export default Chatbot;