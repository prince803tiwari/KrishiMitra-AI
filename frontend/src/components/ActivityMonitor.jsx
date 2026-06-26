import React, { useEffect, useState } from 'react';
import { Activity, RefreshCw, Cpu, Server, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ActivityMonitor({ activityLogs, refreshLogs }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshLogs();
    setRefreshing(false);
  };

  // Compute metrics
  const totalCalls = activityLogs.length;
  const avgLatency = totalCalls > 0 
    ? Math.round(activityLogs.reduce((acc, curr) => acc + curr.latency_ms, 0) / totalCalls) 
    : 0;
  const successRate = totalCalls > 0 
    ? Math.round((activityLogs.filter(log => log.status === 'SUCCESS').length / totalCalls) * 100) 
    : 100;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title & Refresh */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Activity className="text-emerald-400" size={32} />
            एजेंट गतिविधि मॉनिटर (Agent Activity Monitor)
          </h1>
          <p className="text-slate-400 mt-1">
            Track multi-agent reasoning, latency statistics, execution paths, and collaborative workflow logs in real time.
          </p>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold bg-slate-900 border border-emerald-900/30 hover:border-emerald-500/30 text-slate-300 transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh Metrics
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Cpu size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Total Agent Invocations</span>
            <span className="text-2xl font-black text-white mt-1 block">{totalCalls}</span>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Average Latency</span>
            <span className="text-2xl font-black text-white mt-1 block">{avgLatency} ms</span>
          </div>
        </div>

        <div className="glass-panel p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Server size={24} />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Success Rate</span>
            <span className="text-2xl font-black text-white mt-1 block">{successRate}%</span>
          </div>
        </div>
      </div>

      {/* Activity Timeline logs */}
      <div className="glass-panel p-6">
        <h2 className="text-lg font-bold text-white mb-4">Multi-Agent Workflow Execution Logs</h2>
        
        <div className="space-y-4">
          {activityLogs && activityLogs.length > 0 ? (
            activityLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-5 rounded-xl bg-slate-900/60 border border-emerald-950/20 space-y-3"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-950/20 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{log.agent_name}</span>
                    <span className={`text-[9px] uppercase font-black ${
                      log.status === 'SUCCESS' ? 'badge-emerald' : 'badge-red'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12}/> {log.latency_ms}ms</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Collaboration graph representation */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Reasoning Path</span>
                  <div className="p-2 rounded bg-slate-950/80 font-mono text-[11px] text-emerald-400 flex items-center gap-2 overflow-x-auto">
                    <Cpu size={12} className="shrink-0"/>
                    <span className="whitespace-nowrap">{log.collaboration_flow}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Action Details</span>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {log.details}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No agent logs tracked. Interact with Crop Doctor or chat with the advisor to generate logs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
