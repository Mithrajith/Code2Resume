import { useState, useRef, useEffect } from 'react';
import { chatStream } from '../../api/github';
import { generateResume } from '../../api/resume';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Send, Copy, Check, RotateCw, Bot, User, Sparkles } from 'lucide-react';

export default function ChatBox() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);

  const handleCopyCode = (code, index) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(index);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = message;
    setMessage('');
    setLoading(true);

    const isResumeRequest = /resume|cv|curriculum/i.test(currentMessage);

    if (isResumeRequest) {
      try {
        const response = await generateResume(currentMessage);
        if (response.success) {
          const aiMessage = {
            role: 'assistant',
            content: `✅ **${response.message}**\n\n📥 [Download ${response.filename}](/download/${response.filename})\n\nYou can compile this .tex file using [Overleaf](https://www.overleaf.com/) or a local LaTeX editor.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        } else {
          throw new Error(response.detail || 'Failed to generate resume');
        }
      } catch (error) {
        const errorMessage = {
          role: 'assistant',
          content: `❌ Error: ${error.message}`,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setLoading(false);
      }
    } else {
      const aiMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: new Date(), streaming: true }]);

      let fullText = '';
      await chatStream(
        currentMessage,
        (token) => {
          fullText += token;
          setMessages(prev => {
            const updated = [...prev];
            updated[aiMessageIndex] = {
              ...updated[aiMessageIndex],
              content: fullText
            };
            return updated;
          });
        },
        () => {
          setMessages(prev => {
            const updated = [...prev];
            updated[aiMessageIndex] = {
              ...updated[aiMessageIndex],
              streaming: false
            };
            return updated;
          });
          setLoading(false);
        },
        (error) => {
          setMessages(prev => {
            const updated = [...prev];
            updated[aiMessageIndex] = {
              role: 'assistant',
              content: `❌ Error: ${error.message}`,
              timestamp: new Date(),
              isError: true,
              streaming: false
            };
            return updated;
          });
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
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
              <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
              <button
                onClick={() => handleCopyCode(codeString, codeIndex)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {copiedCode === codeIndex ? (
                  <>
                    <Check size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0
              }}
            >
              {codeString}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code className="bg-gray-100 text-red-600 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    a({ children, href, ...props }) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
          {...props}
        >
          {children}
        </a>
      );
    },
    p({ children, ...props }) {
      return (
        <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
          {children}
        </p>
      );
    },
    ul({ children, ...props }) {
      return (
        <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
          {children}
        </ul>
      );
    },
    ol({ children, ...props }) {
      return (
        <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
          {children}
        </ol>
      );
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
    em({ children, ...props }) {
      return <em className="italic" {...props}>{children}</em>;
    },
    blockquote({ children, ...props }) {
      return (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2" {...props}>
          {children}
        </blockquote>
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">AI Assistant</h2>
            <p className="text-sm text-white/80">Ask about your projects or generate resumes</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-4">
              <Bot size={32} className="text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">How can I help you?</h3>
            <p className="text-gray-500 max-w-sm">
              Ask me about your projects or request a resume generation
            </p>
            <div className="flex flex-wrap gap-2 mt-6 justify-center">
              {[
                'List all my ML projects',
                'Generate ML engineer resume',
                'Show my tech stack',
                'What are my best projects?'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setMessage(suggestion)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                  : msg.isError
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none">
                  {msg.content ? (
                    <ReactMarkdown components={MarkdownComponents}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : msg.streaming ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : null}
                </div>
              )}

              {msg.role === 'assistant' && msg.content && !msg.streaming && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/50">
                  <span className="text-xs text-gray-400">
                    {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-end gap-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none bg-white text-sm"
            rows={1}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {loading ? (
              <RotateCw size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          AI responses are generated based on your analyzed GitHub projects
        </p>
      </form>
    </div>
  );
}
