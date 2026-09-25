import { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { useToast } from '../components/Toast';
import { Bot, Send, Droplets, Cloud, Leaf, User, Sprout } from 'lucide-react';
import { getAIResponse } from '../services/aiService';
import type { AIMessage } from '../types';

const suggestions = [
  'My tomato leaves are turning yellow.',
  'How much water does my crop need today?',
  'What diseases are common in this weather?',
  'Check my soil nutrition levels.',
  'Is it a good time to fertilize?',
  'What pests should I watch for?',
];

export default function AIAdvisor() {
  const { state, dispatch, currentFarm, latestSoil, farmCrops, addNotification } = useApp();
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = state.aiMessages.filter(m => m.conversationId === 'conv-1');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: AIMessage = {
      id: crypto.randomUUID(), conversationId: 'conv-1', sender: 'user',
      message: text, timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_AI_MESSAGE', payload: userMsg });
    setInput('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));

    const response = getAIResponse(text, { farm: currentFarm, crops: farmCrops, soilRecord: latestSoil, location: currentFarm?.location });
    const aiMsg: AIMessage = {
      id: crypto.randomUUID(), conversationId: 'conv-1', sender: 'ai',
      message: response.message, timestamp: new Date().toISOString(),
      causes: response.causes, actions: response.actions,
    };
    dispatch({ type: 'ADD_AI_MESSAGE', payload: aiMsg });
    addNotification('AI Advisor Response', 'Your AI advisor has responded to your query.', 'info');
    setLoading(false);
  };

  const handleQuickAction = (action: string) => sendMessage(action);

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 73px)' }}>
      {/* Header */}
      <div className="p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--primary)' }}>
              <Bot size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>AI Farm Advisor</h1>
              <div className="flex items-center gap-1.5 text-xs" style={{ color: '#16A34A' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-dot" />
                Online · Analyzing {currentFarm?.name || 'your farm'}
              </div>
            </div>
          </div>
          <div className="hidden sm:flex gap-2">
            {[['Crop Analysis', Leaf, '#2D6A2F'], ['Weather', Cloud, '#7C3AED'], ['Irrigation', Droplets, '#0891B2']].map(([label, Icon, color]: any) => (
              <button key={label} onClick={() => handleQuickAction(`Give me ${label.toLowerCase()} advice for my farm.`)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: `${color}18`, color }}>
                <Icon size={13} />{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--secondary)' }}>
                <Bot size={32} style={{ color: 'var(--primary)' }} />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ fontFamily: 'Manrope, sans-serif', color: 'var(--foreground)' }}>No conversations yet</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Ask your AI advisor anything about your farm, crops, soil, or weather.</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.slice(0, 4).map(s => (
                  <button key={s} onClick={() => sendMessage(s)} className="px-3 py-2 rounded-lg text-sm border transition-colors"
                    style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: msg.sender === 'ai' ? 'var(--primary)' : 'var(--secondary)' }}>
                {msg.sender === 'ai' ? <Bot size={16} className="text-white" /> : <User size={16} style={{ color: 'var(--muted-foreground)' }} />}
              </div>
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={{
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--card)',
                    color: msg.sender === 'user' ? 'white' : 'var(--foreground)',
                    border: msg.sender === 'ai' ? '1px solid var(--border)' : 'none',
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                  }}>
                  {msg.message}
                </div>
                {msg.causes && msg.causes.length > 0 && (
                  <div className="mt-3 p-4 rounded-xl border w-full" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                    <div className="text-xs font-bold mb-2" style={{ color: '#92400E' }}>POSSIBLE CAUSES</div>
                    <ul className="space-y-1">
                      {msg.causes.map((c, i) => <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#78350F' }}><span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />{c}</li>)}
                    </ul>
                  </div>
                )}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 p-4 rounded-xl border w-full" style={{ background: '#F0FDF4', borderColor: '#BBF7D0' }}>
                    <div className="text-xs font-bold mb-2" style={{ color: '#166534' }}>RECOMMENDED ACTIONS</div>
                    <ul className="space-y-1">
                      {msg.actions.map((a, i) => <li key={i} className="text-sm flex items-start gap-2" style={{ color: '#14532D' }}><span className="mt-1 flex-shrink-0 text-green-500">✓</span>{a}</li>)}
                    </ul>
                  </div>
                )}
                <span className="text-xs mt-1 px-1" style={{ color: 'var(--muted-foreground)' }}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)' }}>
                <Bot size={16} className="text-white" />
              </div>
              <div className="px-4 py-3 rounded-2xl border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--primary)', animationDelay: `${i * 0.15}s` }} />)}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {messages.length > 0 && (
        <div className="px-4 sm:px-6 py-2 overflow-x-auto">
          <div className="max-w-4xl mx-auto flex gap-2 pb-1">
            {suggestions.slice(0, 4).map(s => (
              <button key={s} onClick={() => sendMessage(s)} className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs border transition-colors"
                style={{ background: 'var(--secondary)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 sm:p-6 border-t" style={{ borderColor: 'var(--border)', background: 'var(--card)' }}>
        <div className="max-w-4xl mx-auto flex gap-3">
          <input ref={inputRef} type="text" className="input-field flex-1" placeholder="Ask about your crops, soil, weather, or get farming advice..."
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)} />
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading}
            className="btn-primary px-4 py-2" style={{ opacity: !input.trim() || loading ? 0.5 : 1 }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
