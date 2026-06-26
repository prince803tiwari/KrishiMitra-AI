import React, { useState } from 'react';
import { HeartHandshake, Search, ClipboardList, CheckCircle2, XCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function GovSchemes({ refreshHistory }) {
  const [query, setQuery] = useState('');
  const [landSize, setLandSize] = useState(1.5);
  const [ownsLand, setOwnsLand] = useState(true);
  const [isTaxpayer, setIsTaxpayer] = useState(false);
  const [jobType, setJobType] = useState('farmer');
  const [groupFarming, setGroupFarming] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkEligibility = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please input a scheme name or keyword (e.g., 'PM-Kisan', 'insurance', 'loan')");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const url = `http://localhost:8000/api/schemes?query=${encodeURIComponent(query)}&land_size_ha=${landSize}&owns_land=${ownsLand}&is_taxpayer=${isTaxpayer}&job_type=${jobType}&group_farming=${groupFarming}&session_id=default_farmer`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        refreshHistory();
      } else {
        setError(data.detail || "Failed to analyze scheme details.");
      }
    } catch (err) {
      setError("Unable to connect to the backend server. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <HeartHandshake className="text-emerald-400" size={32} />
          सरकारी योजनाएं (Government Scheme Agent)
        </h1>
        <p className="text-slate-400 mt-1">
          Search agricultural support schemes, check your eligibility instantly, and follow application guides.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Details */}
        <form onSubmit={checkEligibility} className="glass-panel p-6 lg:col-span-5 space-y-6">
          <h2 className="text-lg font-bold text-white">Search & Details Quiz</h2>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Scheme Search Keyword</label>
            <div className="relative">
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g. PM-Kisan, Fasal Bima, KCC..."
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Land Size (Hectares)</label>
              <input 
                type="number" 
                step="0.1"
                value={landSize}
                onChange={(e) => setLandSize(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Land ownership</label>
              <select 
                value={ownsLand ? "true" : "false"}
                onChange={(e) => setOwnsLand(e.target.value === "true")}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="true">Own Land (मालिक)</option>
                <option value="false">Tenant Farmer (बटाईदार)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Taxpayer Status</label>
              <select 
                value={isTaxpayer ? "true" : "false"}
                onChange={(e) => setIsTaxpayer(e.target.value === "true")}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="false">Non-Taxpayer</option>
                <option value="true">Taxpayer (करदाता)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Employment Type</label>
              <select 
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="farmer">Only Farming</option>
                <option value="government">Govt Employee</option>
                <option value="retired">Retired / Pensioner</option>
                <option value="professional">Professional (Doctor/Lawyer)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-emerald-950/20">
            <input 
              id="coop-checkbox"
              type="checkbox" 
              checked={groupFarming}
              onChange={(e) => setGroupFarming(e.target.checked)}
              className="w-4 h-4 accent-emerald-500"
            />
            <label htmlFor="coop-checkbox" className="text-xs text-slate-300 font-medium cursor-pointer">
              I am a member of a farming cooperative/group
            </label>
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
                Analyzing Eligibility...
              </>
            ) : (
              <>
                <HeartHandshake size={18} />
                Verify Eligibility
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel p-6 space-y-6 animate-slide-up border-emerald-500/20">
              
              {/* Header result */}
              <div className="flex items-center gap-3 border-b border-emerald-950/40 pb-4">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-400">
                  <ClipboardList size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Verification Report</h3>
                  <p className="text-xs text-slate-400">Analysis complete against MCP database guidelines</p>
                </div>
              </div>

              {/* Advisory Details */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                {result.advisory.split('\n\n').map((para, idx) => {
                  if (para.startsWith('###') || para.startsWith('####')) {
                    const cleanTitle = para.replace(/^[#\s]+/, '');
                    return <h4 key={idx} className="text-base font-bold text-white mt-4">{cleanTitle}</h4>;
                  }

                  if (para.startsWith('-') || para.startsWith('*') || para.match(/^\d+\./)) {
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                        {para.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^[\-\*\d\.\s]+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }

                  return <p key={idx} className="whitespace-pre-line">{para}</p>;
                })}
              </div>

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <HeartHandshake size={48} className="text-slate-600 mb-4 animate-pulse-slow" />
              <h3 className="font-bold text-slate-300 text-lg">Scheme Advisor</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                No active query results. Fill out your farming details, type a scheme name (e.g. 'PM-Kisan' or 'insurance') and check eligibility.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
