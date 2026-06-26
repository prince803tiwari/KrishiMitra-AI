import React, { useEffect, useState } from 'react';
import { 
  Sprout, 
  CloudSun, 
  HeartHandshake, 
  Mic, 
  AlertTriangle, 
  Activity, 
  ArrowRight, 
  TrendingUp,
  ActivitySquare
} from 'lucide-react';

export default function Dashboard({ setActiveTab, history, activityLogs, stats }) {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Quick Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans flex items-center gap-2">
            नमस्ते, किसान मित्र! <span className="animate-pulse">🌾</span>
          </h1>
          <p className="text-slate-400 mt-1">
            Welcome to your intelligent agricultural agent network. Let's optimize your fields today.
          </p>
        </div>
        
        {/* Emergency Button */}
        <button 
          onClick={() => setActiveTab('emergency')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold border border-red-500/30 text-red-400 bg-red-950/20 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/10 cursor-pointer animate-pulse"
        >
          <AlertTriangle size={18} />
          आपातकालीन सहायता (Emergency Mode)
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Crop Diagnoses</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.cropScans || 0}</h3>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-2">
              <TrendingUp size={12} /> Active Monitoring
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sprout size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Rain Probability</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.rainProb || "75%"}</h3>
            <span className="text-amber-400 text-xs font-medium flex items-center gap-1 mt-2">
              <CloudSun size={12} /> Nagpur Region
            </span>
          </div>
          <div className="p-4 rounded-xl bg-amber-500/10 text-amber-400">
            <CloudSun size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Eligible Schemes</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.schemesMatched || 3}</h3>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-2">
              <HeartHandshake size={12} /> Government Subsidies
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
            <HeartHandshake size={24} />
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Agent Activities</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{activityLogs.length || 0}</h3>
            <span className="text-emerald-400 text-xs font-medium flex items-center gap-1 mt-2">
              <Activity size={12} /> Real-time routing
            </span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 text-emerald-400">
            <ActivitySquare size={24} />
          </div>
        </div>
      </div>

      {/* Main sections: Weather warning & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Weather Alert / Advice */}
        <div className="glass-panel p-6 lg:col-span-1 border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-lg mb-4">
            <AlertTriangle size={20} />
            <h2>कृषि मौसम चेतावनी (Weather Alert)</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 text-sm leading-relaxed text-amber-200">
              भारी वर्षा की चेतावनी! अगले 12 घंटों में भारी बारिश की संभावना है। यूरिया या उर्वरकों का छिड़काव अभी रोक दें। जल निकासी चैनलों को साफ रखें।
            </div>
            <div className="text-xs text-slate-400 leading-relaxed">
              <strong>Advisory</strong>: High rain probability indicates rapid soil nutrient leaching. Delay Scheduled drip irrigation until moisture levels drop below 40%.
            </div>
            <button 
              onClick={() => setActiveTab('weather')}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer text-sm"
            >
              See Detailed Forecast <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sprout size={20} className="text-emerald-400" />
              हालिया फसल स्कैन (Recent Crop Diagnostics)
            </h2>
            <button 
              onClick={() => setActiveTab('history')}
              className="text-xs text-emerald-400 hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {history.cropScans && history.cropScans.length > 0 ? (
              history.cropScans.slice(0, 3).map((scan, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-emerald-950/30 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{scan.crop_type}</span>
                      <span className={`text-[10px] uppercase font-bold ${
                        scan.severity === 'Severe' ? 'badge-red' : scan.severity === 'Moderate' ? 'badge-amber' : 'badge-emerald'
                      }`}>
                        {scan.severity}
                      </span>
                    </div>
                    <p className="text-xs text-red-300 font-medium">{scan.disease_name}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-md">{scan.treatment}</p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium shrink-0">
                    {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-slate-500 text-sm">
                No diagnoses scanned yet. Go to Crop Doctor to analyze a leaf.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-bold text-white mb-4">त्वरित सुविधाएँ (Quick Assistance Navigation)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setActiveTab('doctor')}
            className="p-4 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 text-center hover:border-emerald-500/30 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Sprout size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Crop Doctor</span>
          </button>

          <button 
            onClick={() => setActiveTab('weather')}
            className="p-4 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 text-center hover:border-emerald-500/30 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <CloudSun size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Weather Intel</span>
          </button>

          <button 
            onClick={() => setActiveTab('schemes')}
            className="p-4 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 text-center hover:border-emerald-500/30 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <HeartHandshake size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Gov Schemes</span>
          </button>

          <button 
            onClick={() => setActiveTab('voice')}
            className="p-4 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/10 text-center hover:border-emerald-500/30 transition cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
              <Mic size={20} />
            </div>
            <span className="text-xs font-semibold text-slate-200 block">Voice Assistant</span>
          </button>
        </div>
      </div>
    </div>
  );
}
