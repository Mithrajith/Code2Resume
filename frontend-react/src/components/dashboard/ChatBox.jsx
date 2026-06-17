import { useState, useRef, useEffect, useCallback } from 'react';
import { chatStream } from '../../api/github';
import { generateResume } from '../../api/resume';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Copy, Check, RotateCw, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { useChatStore } from '../../store/chatStore';

export default function ChatBox() {
  const { messages, addMessage, updateLastAssistantMessage, setLoading, loading, clearMessages } = useChatStore();
  const [input, setInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    addMessage(userMessage);
    const currentInput = input;
    setInput('');
    setLoading(true);

    const isResumeRequest = /resume|cv|curriculum/i.test(currentInput);

    if (isResumeRequest) {
      try {
        const response = await generateResume(currentInput);
        if (response.success) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
          const token = localStorage.getItem('token');
          const downloadUrl = `${baseUrl}/download-resume/${response.filename}${token ? `?token=${token}` : ''}`;
          addMessage({
            role: 'assistant',
            content: `**${response.message}**\n\n[Download ${response.filename}](${downloadUrl})\n\nYou can compile this .tex file using [Overleaf](https://www.overleaf.com/) or a local LaTeX editor.`,
            timestamp: new Date().toISOString(),
          });
        } else {
          throw new Error(response.detail || 'Failed to generate resume');
        }
      } catch (error) {
        addMessage({ role: 'assistant', content: `Error: ${error.message}`, timestamp: new Date().toISOString(), isError: true });
      } finally {
        setLoading(false);
      }
    } else {
      addMessage({ role: 'assistant', content: '', timestamp: new Date().toISOString(), streaming: true });
      let fullText = '';

      abortRef.current = await chatStream(
        currentInput,
        (token) => {
          fullText += token;
          updateLastAssistantMessage((prev) => ({ ...prev, content: fullText }));
        },
        () => {
          updateLastAssistantMessage((prev) => ({ ...prev, streaming: false }));
          setLoading(false);
        },
        (error) => {
          updateLastAssistantMessage((prev) => ({
            ...prev,
            content: `Error: ${error.message}`,
            isError: true,
            streaming: false,
          }));
          setLoading(false);
        }
      );
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      if (!inline && match) {
        const codeIndex = `${node.position?.start.line}-${node.position?.start.column}`;
        return (
          <div className="relative group my-4">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg">
              <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
              <button onClick={() => handleCopyCode(codeString, codeIndex)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
                {copiedCode === codeIndex ? <><Check size={14} /><span>Copied!</span></> : <><Copy size={14} /><span>Copy</span></>}
              </button>
            </div>
            <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ margin: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>{codeString}</SyntaxHighlighter>
          </div>
        );
      }
      return <code className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-pink-600 dark:text-pink-400" {...props}>{children}</code>;
    },
    a({ children, href, ...props }) {
      return <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline" {...props}>{children}</a>;
    },
    p({ children, ...props }) {
      return <p className="mb-2 last:mb-0 leading-relaxed" {...props}>{children}</p>;
    },
    ul({ children, ...props }) {
      return <ul className="list-disc list-inside mb-2 space-y-1" {...props}>{children}</ul>;
    },
    ol({ children, ...props }) {
      return <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>{children}</ol>;
    },
    h1({ children, ...props }) {
      return <h1 className="text-xl font-bold mb-2" {...props}>{children}</h1>;
    },
    h2({ children, ...props }) {
      return <h2 className="text-lg font-bold mb-2" {...props}>{children}</h2>;
    },
    h3({ children, ...props }) {
      return <h3 className="text-base font-bold mb-2" {...props}>{children}</h3>;
    },
    strong({ children, ...props }) {
      return <strong className="font-semibold" {...props}>{children}</strong>;
    },
    blockquote({ children, ...props }) {
      return <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props}>{children}</blockquote>;
    },
  };

  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm" style={{ height: '520px' }}>
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold">AI Assistant</h2>
            <p className="text-xs text-white/70">Ask about your projects or generate resumes</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Clear chat">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={32} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">How can I help you?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">Ask me about your projects or request a resume generation</p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {['List all my ML projects', 'Generate ML engineer resume', 'Show my tech stack', 'What are my best projects?'].map((s) => (
                <button key={s} onClick={() => setInput(s)} className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={16} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-md'
                : msg.isError
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-bl-md'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
            }`}>
              {msg.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                  {msg.content ? (
                    <ReactMarkdown components={MarkdownComponents}>{msg.content}</ReactMarkdown>
                  ) : msg.streaming ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs">Thinking...</span>
                    </div>
                  ) : null}
                </div>
              )}
              {msg.role === 'assistant' && msg.content && !msg.streaming && (
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 resize-none rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            rows={1}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            {loading ? <RotateCw size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">AI responses are generated based on your analyzed GitHub projects</p>
      </form>
    </div>
  );
}
