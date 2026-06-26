import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, HelpCircle } from 'lucide-react';

export default function FarmingAdvisor({ chatHistory, refreshHistory }) {
  const [message, setMessage] = useState('');
  const [soilType, setSoilType] = useState('loamy');
  const [season, setSeason] = useState('kharif');
  const [region, setRegion] = useState('maharashtra');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const presets = [
    "wheat के लिए NPK अनुपात क्या होना चाहिए?",
    "rainy season में कौन सी सब्जियां बोनी चाहिए?",
    "black soil के लिए जैविक खाद के विकल्प बताएं"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || message;
    if (!queryText.trim() || loading) return;

    if (!textToSend) setMessage('');
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/advisor/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: queryText,
          soil_type: soilType,
          season: season,
          region: region,
          session_id: "default_farmer"
        })
      });

      if (response.ok) {
        refreshHistory();
      }
    } catch (err) {
      console.error("Failed to send message: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      {/* Title */}
      <div className="shrink-0">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Bot className="text-emerald-400" size={32} />
          सलाहकार चैट (Smart Farming Advisor)
        </h1>
        <p className="text-slate-400 mt-1">
          Chat with your personal farming assistant. Select your soil, season, and region to get contextual guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Context panel */}
        <div className="glass-panel p-5 lg:col-span-3 space-y-5 flex flex-col shrink-0">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Farming Context</h2>
          
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Soil Type (मिट्टी का प्रकार)</label>
              <select 
                value={soilType} 
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="loamy">Loamy (दुमट मिट्टी)</option>
                <option value="clayey">Clayey (चिकनी मिट्टी)</option>
                <option value="sandy">Sandy (बलुआ मिट्टी)</option>
                <option value="black">Black (काली मिट्टी)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">Current Season (कृषि ऋतु)</label>
              <select 
                value={season} 
                onChange={(e) => setSeason(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="kharif">Kharif (Monsoon)</option>
                <option value="rabi">Rabi (Winter)</option>
                <option value="zaid">Zaid (Summer)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-400">State / Region (राज्य)</label>
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-lg px-2.5 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="maharashtra">Maharashtra</option>
                <option value="punjab">Punjab / Haryana</option>
                <option value="madhya_pradesh">Madhya Pradesh</option>
                <option value="bihar">Bihar / UP</option>
                <option value="andhra_pradesh">Andhra / Telangana</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-950/30 flex-1 flex flex-col justify-end space-y-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1"><HelpCircle size={12}/> Quick Questions</span>
            <div className="flex flex-col gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="text-left p-2 rounded-lg bg-slate-900/50 hover:bg-emerald-950/20 border border-emerald-950/30 text-[10px] text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat box */}
        <div className="glass-panel lg:col-span-9 flex flex-col h-full min-h-0">
          {/* Scrollable messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory && chatHistory.length > 0 ? (
              chatHistory.filter(c => c.sender !== 'voice').map((msg, i) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={i} 
                    className={`flex items-start gap-3 max-w-[85%] ${
                      isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isUser ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 border border-emerald-950/30 text-slate-300'
                    }`}>
                      {isUser ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      isUser 
                        ? 'bg-emerald-500 text-white rounded-tr-none' 
                        : 'bg-slate-900/40 border border-emerald-950/20 text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-line">{msg.message}</p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1.5 font-medium">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <Bot size={40} className="mb-3 text-slate-600 animate-bounce" />
                <p className="text-sm font-semibold">Start your agricultural discussion.</p>
                <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">Ask about fertilizers, sowing dates, pest treatments, or organic soil preparation.</p>
              </div>
            )}
            
            {loading && (
              <div className="flex items-start gap-3 max-w-[85%] mr-auto">
                <div className="p-2 rounded-lg bg-slate-900 border border-emerald-950/30 text-slate-300 shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-900/40 border border-emerald-950/20 text-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="p-3 border-t border-emerald-950/40 bg-slate-900/40 flex items-center gap-2 shrink-0"
          >
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your agricultural question here..."
              className="flex-1 bg-slate-950 border border-emerald-900/20 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm placeholder-slate-600"
            />
            <button 
              type="submit" 
              className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition cursor-pointer shrink-0 shadow-lg"
            >
              <Send size={16} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
