import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  CloudSun, 
  HeartHandshake, 
  Bot, 
  Mic, 
  AlertTriangle, 
  Activity, 
  ClipboardList, 
  LayoutDashboard,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import CropDoctor from './components/CropDoctor';
import WeatherIntelligence from './components/WeatherIntelligence';
import GovSchemes from './components/GovSchemes';
import FarmingAdvisor from './components/FarmingAdvisor';
import VoiceAssistant from './components/VoiceAssistant';
import ActivityMonitor from './components/ActivityMonitor';
import HistoryDashboard from './components/HistoryDashboard';
import EmergencyMode from './components/EmergencyMode';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState({ healthy: false, apiConfigured: false });
  
  // History State
  const [history, setHistory] = useState({
    crop_scans: [],
    weather_logs: [],
    scheme_logs: [],
    chat_history: []
  });
  
  // Agent Activities State
  const [activityLogs, setActivityLogs] = useState([]);

  // Fetch all database states
  const refreshData = async () => {
    try {
      // 1. Fetch Health
      const healthRes = await fetch("http://localhost:8000/api/health");
      if (healthRes.ok) {
        const hData = await healthRes.json();
        setHealthStatus({ healthy: true, apiConfigured: hData.gemini_api_configured });
      }

      // 2. Fetch History
      const historyRes = await fetch("http://localhost:8000/api/history?session_id=default_farmer");
      if (historyRes.ok) {
        const histData = await historyRes.json();
        setHistory(histData);
        
        // If history is completely empty (first start), trigger a DB seed
        if (histData.crop_scans.length === 0 && histData.chat_history.length === 0) {
          await fetch("http://localhost:8000/api/seed", { method: "POST" });
          // Refetch
          const seedRefetch = await fetch("http://localhost:8000/api/history?session_id=default_farmer");
          if (seedRefetch.ok) setHistory(await seedRefetch.json());
        }
      }

      // 3. Fetch Activity logs
      const logsRes = await fetch("http://localhost:8000/api/logs/activity");
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivityLogs(logsData);
      }
    } catch (err) {
      console.warn("Unable to fetch data from backend. Make sure the FastAPI backend is running.");
    }
  };

  useEffect(() => {
    refreshData();
    // Poll logs every 15 seconds to keep the Activity Monitor live
    const interval = setInterval(refreshData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Compute summary stats
  const stats = {
    cropScans: history.crop_scans ? history.crop_scans.length : 0,
    rainProb: history.weather_logs && history.weather_logs.length > 0 ? `${history.weather_logs[0].rain_probability}%` : "75%",
    schemesMatched: history.scheme_logs ? history.scheme_logs.filter(s => s.eligible).length : 2
  };

  const navItems = [
    { id: 'dashboard', label: 'डैशबोर्ड (Dashboard)', icon: LayoutDashboard },
    { id: 'doctor', label: 'क्रॉप डॉक्टर (Crop Doctor)', icon: Sprout },
    { id: 'weather', label: 'मौसम सलाहकार (Weather Intel)', icon: CloudSun },
    { id: 'schemes', label: 'सरकारी योजनाएं (Gov Schemes)', icon: HeartHandshake },
    { id: 'advisor', label: 'फसल सलाहकार (Farming Advisor)', icon: Bot },
    { id: 'voice', label: 'आवाज़ सहायक (Voice Assistant)', icon: Mic },
    { id: 'activity', label: 'एजेंट लॉग्स (Activity Monitor)', icon: Activity },
    { id: 'history', label: 'यूज़र इतिहास (History Dashboard)', icon: ClipboardList }
  ];

  return (
    <div className="min-h-screen flex bg-background text-slate-100 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-20 w-64 bg-slate-900 border-r border-emerald-950/40 p-4 flex flex-col justify-between transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="space-y-6">
          {/* Logo / Title */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-inner border border-emerald-500/20">
              <Sprout size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block">KrishiMitra AI</span>
              <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase">Agents for Good</span>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === item.id 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            {/* Divider */}
            <div className="h-px bg-emerald-950/20 my-2" />
            
            {/* Red Emergency Tab */}
            <button
              onClick={() => { setActiveTab('emergency'); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold border border-red-500/30 transition cursor-pointer ${
                activeTab === 'emergency' 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-red-950/10 text-red-400 hover:bg-red-500 hover:text-white'
              }`}
            >
              <AlertTriangle size={16} className="animate-pulse" />
              <span>आपातकालीन मोड (Emergency)</span>
            </button>
          </nav>
        </div>

        {/* User Info & API Status */}
        <div className="space-y-4 pt-4 border-t border-emerald-950/20">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-emerald-950/20 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-400">Agent Network Status</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                healthStatus.healthy ? 'bg-emerald-500 animate-ping' : 'bg-red-500'
              }`} />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                {healthStatus.healthy ? "Connected" : "Offline"}
              </span>
            </div>
          </div>
          <div className="text-[9px] text-slate-500 text-center">
            Farmer Session: default_farmer
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Header bar */}
        <header className="h-16 border-b border-emerald-950/40 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 lg:hidden cursor-pointer"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h2 className="font-extrabold text-sm text-slate-300 uppercase tracking-widest hidden md:block">
              Agricultural Multi-Agent Hub
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-slate-400">
              API Status: {healthStatus.apiConfigured ? '🟢 Live Gemini' : '🟡 Simulated Fallback'}
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              setActiveTab={setActiveTab} 
              history={history} 
              activityLogs={activityLogs} 
              stats={stats} 
            />
          )}
          {activeTab === 'doctor' && <CropDoctor refreshHistory={refreshData} />}
          {activeTab === 'weather' && <WeatherIntelligence refreshHistory={refreshData} />}
          {activeTab === 'schemes' && <GovSchemes refreshHistory={refreshData} />}
          {activeTab === 'advisor' && <FarmingAdvisor chatHistory={history.chat_history} refreshHistory={refreshData} />}
          {activeTab === 'voice' && <VoiceAssistant refreshHistory={refreshData} />}
          {activeTab === 'activity' && <ActivityMonitor activityLogs={activityLogs} refreshLogs={refreshData} />}
          {activeTab === 'history' && <HistoryDashboard history={history} refreshHistory={refreshData} />}
          {activeTab === 'emergency' && <EmergencyMode refreshHistory={refreshData} />}
        </main>
      </div>

    </div>
  );
}
