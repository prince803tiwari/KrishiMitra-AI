import React, { useState } from 'react';
import { ClipboardList, Trash2, Sprout, CloudSun, HeartHandshake, Bot, ShieldCheck } from 'lucide-react';

export default function HistoryDashboard({ history, refreshHistory }) {
  const [activeSubTab, setActiveSubTab] = useState('scans');

  const wipeHistory = async () => {
    if (!confirm("Are you sure you want to wipe all history logs and activities? This will reset the database.")) {
      return;
    }
    
    try {
      const response = await fetch("http://localhost:8000/api/seed", {
        method: "POST"
      });
      if (response.ok) {
        alert("Database has been reset to default mock logs.");
        refreshHistory();
      }
    } catch (err) {
      alert("Error resetting database.");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Clear */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="text-emerald-400" size={32} />
            इतिहास डैशबोर्ड (User History Dashboard)
          </h1>
          <p className="text-slate-400 mt-1">
            Browse and review your past diagnoses, weather inquiries, government scheme evaluations, and chat logs.
          </p>
        </div>
        
        <button
          onClick={wipeHistory}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white transition cursor-pointer text-sm"
        >
          <Trash2 size={16} />
          Reset History
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-emerald-900/20 max-w-lg">
        <button
          onClick={() => setActiveSubTab('scans')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'scans' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sprout size={14} /> Crop Scans
        </button>
        <button
          onClick={() => setActiveSubTab('weather')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'weather' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CloudSun size={14} /> Weather
        </button>
        <button
          onClick={() => setActiveSubTab('schemes')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'schemes' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HeartHandshake size={14} /> Schemes
        </button>
        <button
          onClick={() => setActiveSubTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'chats' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot size={14} /> Chat Log
        </button>
      </div>

      {/* Subtab Contents */}
      <div className="glass-panel p-6">
        
        {/* Scans */}
        {activeSubTab === 'scans' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Crop Leaf Diagnosis Archive</h3>
            {history.crop_scans && history.crop_scans.length > 0 ? (
              history.crop_scans.map((scan) => (
                <div key={scan.id} className="p-4 rounded-xl bg-slate-900/50 border border-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-950/20 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{scan.crop_type}</span>
                      <span className={`text-[9px] uppercase font-bold ${
                        scan.severity === 'Severe' ? 'badge-red' : scan.severity === 'Moderate' ? 'badge-amber' : 'badge-emerald'
                      }`}>
                        {scan.severity}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(scan.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold">Diagnosis: {scan.disease_name}</p>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-3 rounded-lg border border-emerald-950/10">
                    {scan.treatment}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">No diagnostic history available.</div>
            )}
          </div>
        )}

        {/* Weather */}
        {activeSubTab === 'weather' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Weather Inquiries Log</h3>
            {history.weather_logs && history.weather_logs.length > 0 ? (
              history.weather_logs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-slate-900/50 border border-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-950/20 pb-2">
                    <span className="font-bold text-white text-sm">{log.location}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-300">
                    <span>Temp: <strong>{log.temperature}°C</strong></span>
                    <span>Rain Probability: <strong>{log.rain_probability}%</strong></span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-emerald-950/10">
                    {log.recommendations}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">No weather history logs available.</div>
            )}
          </div>
        )}

        {/* Schemes */}
        {activeSubTab === 'schemes' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Scheme Verification Log</h3>
            {history.scheme_logs && history.scheme_logs.length > 0 ? (
              history.scheme_logs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-slate-900/50 border border-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-950/20 pb-2">
                    <span className="font-bold text-white text-sm">{log.scheme_name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Eligibility check:</span>
                    <span className={`text-[10px] uppercase font-bold ${log.eligible ? 'badge-emerald' : 'badge-amber'}`}>
                      {log.eligible ? 'Eligible' : 'Not Eligible / Alternate suggested'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-emerald-950/10">
                    {log.notes}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">No scheme history logs available.</div>
            )}
          </div>
        )}

        {/* Chats */}
        {activeSubTab === 'chats' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-2">Smart Farming Advisor Chats</h3>
            {history.chat_history && history.chat_history.length > 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/50 border border-emerald-950/20 space-y-4">
                {history.chat_history.map((chat) => {
                  const isUser = chat.sender === 'user';
                  return (
                    <div key={chat.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-slate-500 font-semibold mb-0.5">
                        {isUser ? 'You' : 'Advisor'} • {new Date(chat.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <p className={`text-xs p-3 rounded-xl max-w-[85%] ${
                        isUser ? 'bg-emerald-500 text-white rounded-tr-none' : 'bg-slate-950/60 border border-emerald-950/20 text-slate-200 rounded-tl-none'
                      }`}>
                        {chat.message}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-sm">No advisory chat history available.</div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
