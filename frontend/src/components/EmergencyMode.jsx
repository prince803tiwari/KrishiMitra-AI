import React, { useState, useEffect } from 'react';
import { AlertTriangle, Upload, Eye, CloudSun, Sprout, Bot, Play, Square, Activity } from 'lucide-react';

export default function EmergencyMode({ refreshHistory }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('टमाटर के पौधे के पत्ते काले होकर गिर रहे हैं, कृपया उपाय बताएं।');
  const [location, setLocation] = useState('Nagpur');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const [speaking, setSpeaking] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerEmergency = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("कृपया निदान के लिए पत्ती की फोटो अपलोड करें (Please upload a leaf image first).");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("session_id", "default_farmer");

    try {
      const response = await fetch("http://localhost:8000/api/emergency", {
        method: "POST",
        body: formData
      });
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        refreshHistory();
      } else {
        setError(data.detail || "आपातकालीन सेवा कॉल विफल रही। (Emergency call failed.)");
      }
    } catch (err) {
      setError("बैकएंड सर्वर से कनेक्ट करने में असमर्थ। सुनिश्चित करें कि FastAPI चल रहा है।");
    } finally {
      setLoading(false);
    }
  };

  const speakPlan = () => {
    if (!result || !result.voice_script) return;
    
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(result.voice_script);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9; // clear, steady rate
    
    // Attempt to set a Hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.includes('hi-IN'));
    if (hindiVoice) utterance.voice = hindiVoice;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="p-6 rounded-2xl border border-red-500/30 bg-red-950/20 shadow-lg flex items-start gap-4">
        <div className="p-3 bg-red-500/10 text-red-400 rounded-full shrink-0 animate-pulse">
          <AlertTriangle size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white font-sans">
            आपातकालीन मोड (Farmer Emergency Mode)
          </h1>
          <p className="text-red-200/80 text-sm mt-1 leading-relaxed">
            यह मोड स्वचालित रूप से क्रॉप डॉक्टर, मौसम सलाहकार और फसल विशेषज्ञ एजेंटों की रिपोर्ट को एक एकीकृत, त्वरित योजना (Hindi Action Plan) में मिलाकर आवाज़ के साथ पेश करता है।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Form Inputs */}
        <form onSubmit={triggerEmergency} className="glass-panel p-6 lg:col-span-5 space-y-6">
          <h2 className="text-lg font-bold text-white">Emergency Inputs</h2>

          {/* Leaf Upload */}
          <div 
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              imagePreview ? 'border-red-500/30 bg-red-950/5' : 'border-emerald-800/30 hover:border-red-500/30'
            }`}
            onClick={() => document.getElementById('emergency-upload-input').click()}
          >
            <input 
              id="emergency-upload-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="space-y-3">
                <img 
                  src={imagePreview} 
                  alt="Emergency preview" 
                  className="max-h-40 mx-auto rounded-lg object-cover"
                />
                <span className="text-xs text-red-400 font-bold block">तस्वीर बदलें (Change Photo)</span>
              </div>
            ) : (
              <div className="space-y-3 py-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">पत्ती की फोटो अपलोड करें</p>
                  <p className="text-[10px] text-slate-400 mt-1">Upload leaf photo</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">समस्या का विवरण (Hindi Description)</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="उदाहरण: पत्तों पर काले धब्बे आ गए हैं..."
              className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-red-500 text-sm placeholder-slate-500"
            />
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">स्थान (Location)</label>
            <input 
              type="text" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Nagpur, Ludhiana, Pune..."
              className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 text-sm"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-xs text-red-400">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Orchestrating Specialized Agents...
              </>
            ) : (
              <>
                <AlertTriangle size={18} />
                आपातकालीन योजना बनाएं (Generate Emergency Plan)
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="space-y-6 animate-slide-up">
              
              {/* Orchestrator workflow live logs */}
              <div className="p-4 rounded-xl bg-black border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <Activity size={14} className="animate-pulse" />
                  <span>Agent Collaboration Flow Logs</span>
                </div>
                <div className="font-mono text-[10px] text-emerald-400 space-y-1 max-h-28 overflow-y-auto">
                  {result.workflow_logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              </div>

              {/* Final Action Plan Hindi */}
              <div className="glass-panel p-6 border-red-500/20 space-y-4">
                <div className="flex items-center justify-between border-b border-emerald-950/40 pb-3">
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Bot size={22} className="text-red-400" />
                    एकीकृत कार्य योजना (Integrated Action Plan)
                  </h3>
                  
                  {speaking ? (
                    <button 
                      onClick={stopSpeaking}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                    >
                      <Square size={12} /> Mute
                    </button>
                  ) : (
                    <button 
                      onClick={speakPlan}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                    >
                      <Play size={12} /> योजना सुनें (Listen Plan)
                    </button>
                  )}
                </div>

                <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                  {result.final_action_plan_hindi.split('\n\n').map((para, idx) => {
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

            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px] border-red-500/10">
              <AlertTriangle size={48} className="text-red-500/30 mb-4 animate-pulse-slow" />
              <h3 className="font-bold text-slate-300 text-lg">Emergency Plan Result</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                No emergency plan active. Please upload a leaf image and describe the issues in Hindi to trigger multi-agent orchestration.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
