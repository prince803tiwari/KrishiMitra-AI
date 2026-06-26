import React, { useState } from 'react';
import { CloudSun, Search, AlertTriangle, Droplets, Thermometer, Wind, Eye } from 'lucide-react';

export default function WeatherIntelligence({ refreshHistory }) {
  const [location, setLocation] = useState('Nagpur');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeatherAdvisory = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`http://localhost:8000/api/weather?location=${encodeURIComponent(location)}&session_id=default_farmer`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        refreshHistory();
      } else {
        setError(data.detail || "Failed to fetch weather insights.");
      }
    } catch (err) {
      setError("Unable to connect to the backend server. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Mock forecast generator for rendering 3-day indicators
  const getMockForecast = (loc) => {
    const defaultData = [
      { day: "Tomorrow", temp: "33°C", rain: 75, status: "Rain Showers", irrigation: "NO" },
      { day: "Day after", temp: "30°C", rain: 80, status: "Heavy Rain", irrigation: "NO" },
      { day: "In 3 Days", temp: "32°C", rain: 20, status: "Partly Cloudy", irrigation: "YES" }
    ];
    
    const lowRain = [
      { day: "Tomorrow", temp: "34°C", rain: 10, status: "Sunny", irrigation: "YES (High)" },
      { day: "Day after", temp: "35°C", rain: 15, status: "Sunny", irrigation: "YES (High)" },
      { day: "In 3 Days", temp: "34°C", rain: 5, status: "Clear", irrigation: "YES (High)" }
    ];
    
    if (loc.toLowerCase() === 'indore') {
      return lowRain;
    }
    return defaultData;
  };

  const getMockStats = (loc) => {
    const db = {
      nagpur: { temp: "34°C", hum: "65%", wind: "14 km/h", soil: "42%", rain: 20 },
      ludhiana: { temp: "31°C", hum: "70%", wind: "18 km/h", soil: "65%", rain: 85 },
      indore: { temp: "30°C", hum: "55%", wind: "10 km/h", soil: "35%", rain: 10 },
      pune: { temp: "28°C", hum: "75%", wind: "12 km/h", soil: "50%", rain: 60 }
    };
    return db[loc.toLowerCase()] || { temp: "32°C", hum: "62%", wind: "12 km/h", soil: "45%", rain: 35 };
  };

  const locStats = getMockStats(location);
  const forecast = getMockForecast(location);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <CloudSun className="text-emerald-400" size={32} />
          मौसम बुद्धिमत्ता (Weather Intelligence Agent)
        </h1>
        <p className="text-slate-400 mt-1">
          Receive localized weather reports, rainfall probability analyses, and actionable schedules for irrigation and crop spraying.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Search Panel */}
        <div className="glass-panel p-6 lg:col-span-4 space-y-6">
          <h2 className="text-lg font-bold text-white">Enter Location</h2>
          
          <form onSubmit={fetchWeatherAdvisory} className="space-y-4">
            <div className="relative">
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="E.g., Nagpur, Ludhiana, Pune, Indore..."
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-xs text-red-400">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Fetching Weather...
                </>
              ) : (
                <>
                  <CloudSun size={18} />
                  Analyze Forecast
                </>
              )}
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Popular Hubs</span>
            <div className="flex flex-wrap gap-2">
              {['Nagpur', 'Ludhiana', 'Indore', 'Pune', 'Vijayawada'].map((hub) => (
                <button
                  key={hub}
                  onClick={() => { setLocation(hub); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950/40 border border-emerald-900/20 hover:border-emerald-500/30 text-xs text-slate-300 transition cursor-pointer"
                >
                  {hub}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advisory Panel */}
        <div className="lg:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-6 animate-slide-up">
              
              {/* Stat Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/30 text-center">
                  <Thermometer className="mx-auto mb-2 text-emerald-400" size={20} />
                  <span className="text-xs text-slate-400 block font-medium">Temperature</span>
                  <span className="text-lg font-bold text-white mt-1 block">{locStats.temp}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/30 text-center">
                  <Droplets className="mx-auto mb-2 text-emerald-400" size={20} />
                  <span className="text-xs text-slate-400 block font-medium">Humidity</span>
                  <span className="text-lg font-bold text-white mt-1 block">{locStats.hum}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/30 text-center">
                  <Wind className="mx-auto mb-2 text-emerald-400" size={20} />
                  <span className="text-xs text-slate-400 block font-medium">Wind Speed</span>
                  <span className="text-lg font-bold text-white mt-1 block">{locStats.wind}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-950/30 text-center">
                  <Eye className="mx-auto mb-2 text-emerald-400" size={20} />
                  <span className="text-xs text-slate-400 block font-medium">Soil Moisture</span>
                  <span className="text-lg font-bold text-white mt-1 block">{locStats.soil}</span>
                </div>
              </div>

              {/* Weather report text */}
              <div className="glass-panel p-6 border-emerald-500/20">
                <h3 className="text-lg font-bold text-white mb-4 border-b border-emerald-950/40 pb-2">
                  Agricultural Advisory for {result.location}
                </h3>
                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                  {result.advisory.split('\n\n').map((para, idx) => (
                    <p key={idx} className="whitespace-pre-line">{para}</p>
                  ))}
                </div>
              </div>

              {/* Forecast grid */}
              <div className="glass-panel p-6">
                <h3 className="text-lg font-bold text-white mb-4">3-Day Agricultural Forecast</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {forecast.map((f, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-900/50 border border-emerald-950/20 text-center space-y-2">
                      <span className="text-xs font-bold text-slate-400 block">{f.day}</span>
                      <span className="text-2xl font-extrabold text-white block mt-1">{f.temp}</span>
                      <span className="text-xs text-slate-300 font-semibold block">{f.status}</span>
                      
                      {/* Rain bar */}
                      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mt-2">
                        <div 
                          className={`h-full ${f.rain > 60 ? 'bg-red-500' : f.rain > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${f.rain}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block">Rain Prob: {f.rain}%</span>
                      
                      <div className="pt-2 border-t border-emerald-950/20 mt-2">
                        <span className="text-[10px] text-slate-400 block">Irrigate:</span>
                        <span className={`text-[10px] font-bold ${f.irrigation === 'NO' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {f.irrigation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <CloudSun size={48} className="text-slate-600 mb-4 animate-pulse-slow" />
              <h3 className="font-bold text-slate-300 text-lg">Weather Intelligence</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                No location queried. Type an agricultural district or city in the input panel and press 'Analyze' to load weather advisories.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
