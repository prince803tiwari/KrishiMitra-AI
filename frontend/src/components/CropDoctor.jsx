import React, { useState } from 'react';
import { Sprout, Upload, Image as ImageIcon, Camera, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function CropDoctor({ refreshHistory }) {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState('');
  const [cropType, setCropType] = useState('tomato');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const triggerDiagnostic = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setError("Please upload or drag an image of the crop leaf first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("description", `Crop: ${cropType}. Symptoms: ${description}`);
    formData.append("session_id", "default_farmer");

    try {
      const response = await fetch("http://localhost:8000/api/diagnose", {
        method: "POST",
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        refreshHistory();
      } else {
        setError(data.detail || "Diagnosis failed. Please check the image integrity.");
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
          <Sprout className="text-emerald-400" size={32} />
          फसल चिकित्सक (Crop Doctor Agent)
        </h1>
        <p className="text-slate-400 mt-1">
          Upload an image of your crop leaf to diagnose diseases and receive tailored organic and chemical treatment instructions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Upload panel */}
        <form onSubmit={triggerDiagnostic} className="glass-panel p-6 lg:col-span-5 space-y-6">
          <h2 className="text-lg font-bold text-white">Diagnostic Inputs</h2>
          
          {/* Drag & Drop Area */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              imagePreview ? 'border-emerald-500/40 bg-emerald-950/5' : 'border-emerald-800/30 hover:border-emerald-500/30'
            }`}
            onClick={() => document.getElementById('leaf-upload-input').click()}
          >
            <input 
              id="leaf-upload-input" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <div className="space-y-4">
                <img 
                  src={imagePreview} 
                  alt="Leaf preview" 
                  className="max-h-48 mx-auto rounded-lg object-cover shadow-md"
                />
                <span className="text-xs text-emerald-400 font-medium block">Click or drag new file to replace</span>
              </div>
            ) : (
              <div className="space-y-3 py-6">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                  <Upload size={22} />
                </div>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">Drag & drop crop image here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPEG, PNG, WEBP up to 5MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Selector options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Crop Class</label>
              <select 
                value={cropType} 
                onChange={(e) => setCropType(e.target.value)}
                className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm"
              >
                <option value="tomato">Tomato (टमाटर)</option>
                <option value="cotton">Cotton (कपास)</option>
                <option value="wheat">Wheat (गेहूं)</option>
                <option value="rice">Rice (धान)</option>
                <option value="maize">Maize (मक्का)</option>
                <option value="general">Other / Unknown</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Leaf camera</label>
              <button 
                type="button" 
                onClick={() => alert("Leaf Camera capture requires a live mobile wrapper. Drag & drop works as alternative.")}
                className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl px-3 py-2 text-emerald-400 flex items-center justify-center gap-2 text-sm transition"
              >
                <Camera size={16} /> Open Camera
              </button>
            </div>
          </div>

          {/* Description input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Symptom Description</label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g. yellow spots on leaves, brown edges, holes in stem..."
              className="w-full bg-slate-900 border border-emerald-900/30 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 text-sm placeholder-slate-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 text-xs text-red-400 flex items-start gap-2">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing with Gemini...
              </>
            ) : (
              <>
                <Sprout size={18} />
                Diagnose Crop Health
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="glass-panel p-6 space-y-6 animate-slide-up border-emerald-500/20">
              <div className="flex items-center justify-between border-b border-emerald-950/40 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{result.crop_type} Diagnostic</h3>
                    <span className={`text-xs ${
                      result.severity === 'Severe' ? 'badge-red' : result.severity === 'Moderate' ? 'badge-amber' : 'badge-emerald'
                    }`}>
                      {result.severity} Severity
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-400">Diagnosed Issue: {result.disease_name}</p>
                </div>
                <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                  <ShieldCheck size={28} />
                </div>
              </div>

              {/* Main Analysis Output */}
              <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                {result.diagnosis.split('\n\n').map((para, idx) => {
                  if (para.startsWith('###') || para.startsWith('####')) {
                    const cleanTitle = para.replace(/^[#\s]+/, '');
                    return <h4 key={idx} className="text-base font-bold text-white mt-4">{cleanTitle}</h4>;
                  }
                  
                  // Format lists slightly cleaner
                  if (para.startsWith('-') || para.startsWith('*')) {
                    return (
                      <ul key={idx} className="list-disc list-inside space-y-1.5 pl-2 text-slate-300">
                        {para.split('\n').map((li, lIdx) => (
                          <li key={lIdx}>{li.replace(/^[\-\*\s]+/, '')}</li>
                        ))}
                      </ul>
                    );
                  }

                  return <p key={idx} className="whitespace-pre-line">{para}</p>;
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-emerald-950/40 flex items-center gap-3">
                <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
                <span className="text-xs text-slate-400">
                  Recommendation logged in history. Ensure weekly inspections to monitor spread.
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-500 flex flex-col items-center justify-center h-full min-h-[300px]">
              <ImageIcon size={48} className="text-slate-600 mb-4 animate-pulse-slow" />
              <h3 className="font-bold text-slate-300 text-lg">Diagnostics Result</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
                No active scan report. Please configure parameters, upload a crop leaf image, and run diagnostics to receive crop Doctor advisory.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
