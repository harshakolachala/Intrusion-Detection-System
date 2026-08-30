import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  HelpCircle,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  Terminal,
  Trash2,
  User,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

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
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const promptSuggestions = [
    'Explain mitigations for a SYN Flood DDoS attack.',
    'What are the indicators of compromise for SQL Injection?',
    'How does FedSentry perform privacy-preserving Federated Learning?',
    'Analyze the PortScan reconnaissance attack vector.',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome-msg',
        sender: 'assistant',
        text: 'Hello Analyst! I am the FedSentry Assistant powered by a RAG-backed cybersecurity knowledge base. How can I assist you with threat analysis, MITRE ATT&CK techniques, incident mitigation, or packet intelligence today?',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExpanded(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isExpanded]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const response = await sendChatMessage({
        message: query,
        session_id: sessionId,
      });

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text:
          response.reply ||
          response.response ||
          response.message ||
          'I have analyzed the query against the FedSentry security knowledge base.',
        timestamp: new Date().toLocaleTimeString(),
        sources: response.sources || ['FedSentry RAG Engine', 'MITRE ATT&CK'],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chatbot API Error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: 'Unable to reach the RAG Chatbot Service. Please verify that the FastAPI backend is online and running.',
          timestamp: new Date().toLocaleTimeString(),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Conversation history cleared. Ready for new security queries.',
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <div
      className={`font-sans text-[var(--text-primary)] transition-all duration-300 ${
        isExpanded
          ? 'fixed inset-3 z-[250] flex h-auto max-w-none flex-col overflow-hidden rounded-[28px] bg-[var(--background)] p-2 shadow-2xl sm:inset-5'
          : 'relative mx-auto flex h-[calc(100vh-7rem)] max-w-7xl flex-col overflow-hidden px-1 pb-2'
      }`}
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-500/[0.055] blur-[90px]" />
        <div className="absolute -right-28 top-[-60px] h-80 w-80 rounded-full bg-cyan-400/[0.045] blur-[100px]" />
        <div className="absolute bottom-[-100px] left-[38%] h-72 w-72 rounded-full bg-violet-500/[0.035] blur-[100px]" />
      </div>

      {!isExpanded && (
        <header className="relative mb-4 shrink-0">
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-sm)] backdrop-blur-xl">
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
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="truncate text-xl font-black tracking-[-0.04em] sm:text-2xl">
                      AI Assistant Console
                    </h1>
                    <p className="mt-1 max-w-2xl text-sm leading-5 text-[var(--text-muted)] sm:text-xs">
                      Autonomous cybersecurity copilot for threat analysis, anomaly diagnostics,
                      incident response and intelligence.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2.5 sm:flex">
                  <Cpu className="h-3.5 w-3.5 text-blue-500" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-subtle)]">Intelligence</p>
                    <p className="text-sm font-bold text-[var(--text-secondary)]">RAG + LLM</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="group flex min-h-[40px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-xs font-semibold text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Clear History
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-[var(--border)] sm:grid-cols-4">
              {[
                [ShieldAlert, 'Threat Analysis', 'text-blue-500'],
                [Terminal, 'SOC Playbooks', 'text-cyan-500'],
                [Layers, 'MITRE ATT&CK', 'text-violet-500'],
                [CheckCircle2, 'Response Intelligence', 'text-emerald-500'],
              ].map(([Icon, label, color], index) => {
                const CapabilityIcon = Icon as React.ElementType;
                return (
                  <div
                    key={String(label)}
                    className={`flex items-center gap-2.5 px-4 py-2.5 ${index < 3 ? 'border-r border-[var(--border)]' : ''}`}
                  >
                    <CapabilityIcon className={`h-3.5 w-3.5 ${String(color)}`} />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">{String(label)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </header>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-md)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-muted)]/70 px-4 py-3.5 backdrop-blur-xl sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">FedSentry Copilot</span>
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <p className="truncate font-mono text-xs text-[var(--text-subtle)]">Session: {sessionId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 sm:flex">
              <span className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-xs font-semibold text-[var(--text-subtle)]">
                Secure Channel
              </span>
              <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                Encrypted
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((value) => !value)}
              className="flex h-9 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text-secondary)] shadow-[var(--shadow-xs)] transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
              title={isExpanded ? 'Minimize chatbot' : 'Maximize chatbot'}
              aria-label={isExpanded ? 'Minimize chatbot' : 'Maximize chatbot'}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden md:inline">{isExpanded ? 'Minimize' : 'Maximize'}</span>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="shrink-0 border-b border-[var(--border)] bg-blue-50/70 px-4 py-2 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
            Expanded reading mode · Press Esc or select Minimize to return to the normal console view.
          </div>
        )}

        <div className={`relative flex-1 overflow-y-auto ${isExpanded ? 'p-5 sm:p-8' : 'p-4 sm:p-6'}`}>
          <div className={`relative mx-auto space-y-5 ${isExpanded ? 'max-w-6xl' : 'max-w-none'}`}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_8px_22px_rgba(37,99,235,0.20)]">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`group relative overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-xs)] ${
                    isExpanded ? 'max-w-5xl' : 'max-w-3xl'
                  } ${
                    msg.sender === 'user'
                      ? 'rounded-tr-md bg-gradient-to-br from-blue-600 to-blue-500 text-white'
                      : msg.isError
                        ? 'rounded-tl-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/[0.08] dark:text-rose-300'
                        : 'rounded-tl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]'
                  }`}
                >
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
                      {msg.sender === 'user' ? 'SOC Analyst' : msg.isError ? 'System Error' : 'FedSentry Copilot'}
                    </span>
                    <span className="flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="h-2.5 w-2.5" />
                      {msg.timestamp}
                    </span>
                  </div>

                  <p className={`whitespace-pre-wrap break-words ${isExpanded ? 'text-[15px] leading-7' : 'text-sm leading-6'}`}>
                    {msg.text}
                  </p>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-[var(--border)] pt-3 text-xs text-[var(--text-subtle)]">
                      <span className="mr-1 font-semibold">Sources:</span>
                      {msg.sources.map((src, index) => (
                        <span
                          key={`${src}-${index}`}
                          className="rounded-lg border border-cyan-100 bg-cyan-50 px-2 py-1 font-bold text-cyan-600 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                  <Bot className="h-4 w-4 animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-tl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5">
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

        <div className="shrink-0 border-t border-[var(--border)] bg-[var(--surface-muted)]/60 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-thin">
            <div className="flex shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
              <HelpCircle className="h-3 w-3" />
              <span className="text-xs font-semibold">Quick Query</span>
            </div>

            {promptSuggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="group flex shrink-0 max-w-[320px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm font-medium text-[var(--text-muted)] shadow-[var(--shadow-xs)] transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:border-blue-500/30 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
              >
                <span className="truncate">{prompt}</span>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSendMessage();
          }}
          className="shrink-0 border-t border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4"
        >
          <div className="relative flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-1.5 shadow-[var(--shadow-sm)] transition focus-within:border-blue-400 focus-within:bg-[var(--surface)] focus-within:ring-4 focus-within:ring-blue-500/[0.08]">
            <div className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Terminal className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              placeholder="Ask FedSentry Copilot about threats, playbooks, or packet anomalies..."
              value={inputMessage}
              onChange={(event) => setInputMessage(event.target.value)}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-subtle)] disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="group flex min-h-[40px] shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 text-xs font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.18)] transition hover:from-blue-500 hover:to-cyan-500 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
            >
              <span className="hidden sm:inline">Send Query</span>
              <span className="sm:hidden">Send</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-[var(--text-subtle)]">RAG Knowledge Retrieval Active</span>
            </div>
            <span className="hidden text-xs font-medium text-[var(--text-subtle)] sm:inline">
              {isExpanded ? 'Esc to minimize · Enter to submit' : 'Enter to submit'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
