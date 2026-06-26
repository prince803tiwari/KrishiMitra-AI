import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Bot, User, RefreshCw, VolumeX } from 'lucide-react';

export default function VoiceAssistant({ refreshHistory }) {
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState('hindi');
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setTtsSupported(true);
    }
  }, []);

  const startRecording = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
        
        rec.onstart = () => {
          setIsRecording(true);
          setTranscript('');
          setResponse('');
        };
        
        rec.onresult = async (event) => {
          const resultText = event.results[0][0].transcript;
          setTranscript(resultText);
          await uploadTranscriptText(resultText);
        };
        
        rec.onerror = (err) => {
          console.error("Speech recognition error, falling back to MediaRecorder: ", err);
          fallbackToMediaRecorder();
        };
        
        rec.onend = () => {
          setIsRecording(false);
        };
        
        rec.start();
        setMediaRecorder(rec);
      } catch (e) {
        console.error("Failed to start Speech Recognition: ", e);
        await fallbackToMediaRecorder();
      }
    } else {
      await fallbackToMediaRecorder();
    }
  };

  const fallbackToMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      let chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunks, { type: mimeType });
        await uploadAudio(audioBlob, mimeType);
      };

      setAudioChunks([]);
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Microphone permission denied or unsupported. Using simulated transcription fallback.");
      setIsRecording(true);
      setTimeout(() => {
        stopRecording(true);
      }, 3000);
    }
  };

  const stopRecording = (simulated = false) => {
    if (simulated) {
      setIsRecording(false);
      const mockBlob = new Blob([new Uint8Array([0x00, 0x01, 0x02])], { type: 'audio/wav' });
      uploadAudio(mockBlob);
      return;
    }

    if (mediaRecorder) {
      try {
        if (mediaRecorder.stop) {
          mediaRecorder.stop();
        }
        if (mediaRecorder.stream) {
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error stopping recorder:", err);
      }
      setIsRecording(false);
    }
  };

  const uploadTranscriptText = async (text) => {
    setLoading(true);
    setResponse('');
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const formData = new FormData();
    formData.append("transcript_text", text);
    formData.append("language", language);
    formData.append("session_id", "default_farmer");

    try {
      const res = await fetch("http://localhost:8000/api/voice", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setResponse(data.voice_response);
        refreshHistory();
        speakText(data.voice_response);
      } else {
        setResponse(data.detail || "Error processing voice command.");
      }
    } catch (err) {
      setResponse("Unable to communicate with the voice server. Please verify your FastAPI backend.");
    } finally {
      setLoading(false);
    }
  };

  const uploadAudio = async (blob, mimeType) => {
    setLoading(true);
    setTranscript('');
    setResponse('');
    
    window.speechSynthesis?.cancel();
    setSpeaking(false);

    const type = mimeType || blob.type || 'audio/webm';
    const extension = type.includes('webm') ? 'webm' : type.includes('ogg') ? 'ogg' : 'wav';

    const formData = new FormData();
    formData.append("audio", blob, `farmer_voice.${extension}`);
    formData.append("language", language);
    formData.append("session_id", "default_farmer");

    try {
      const res = await fetch("http://localhost:8000/api/voice", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
        setTranscript(data.transcript);
        setResponse(data.voice_response);
        refreshHistory();
        speakText(data.voice_response);
      } else {
        setTranscript("[Failed to transcribe]");
        setResponse(data.detail || "Error processing voice command.");
      }
    } catch (err) {
      setTranscript("[Connection Error]");
      setResponse("Unable to communicate with the voice server. Please verify your FastAPI backend.");
    } finally {
      setLoading(false);
    }
  };

  const speakText = (text) => {
    if (!text || !ttsSupported) return;
    
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to select Hindi or English voice
    const voices = window.speechSynthesis.getVoices();
    const targetLang = language === 'hindi' ? 'hi-IN' : 'en-US';
    const voice = voices.find(v => v.lang.includes(targetLang));
    if (voice) utterance.voice = voice;
    
    utterance.lang = targetLang;
    utterance.rate = 0.95; // Slightly slower for farming clarity
    
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
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Mic className="text-emerald-400" size={32} />
          आवाज़ सहायक (Voice Assistant Agent)
        </h1>
        <p className="text-slate-400 mt-1">
          Low-literacy assistance support. Tap the mic, speak in Hindi or English, and listen to spoken advice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recording Center */}
        <div className="glass-panel p-8 lg:col-span-5 flex flex-col items-center justify-center space-y-6 text-center">
          <h2 className="text-lg font-bold text-white">Tap to Speak</h2>
          
          {/* Language selector */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-emerald-900/30">
            <button
              onClick={() => setLanguage('hindi')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                language === 'hindi' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setLanguage('english')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                language === 'english' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              English
            </button>
          </div>

          {/* Recording Button */}
          <div className="relative flex items-center justify-center">
            {isRecording && (
              <div className="absolute w-28 h-28 rounded-full border border-emerald-500/30 bg-emerald-500/5 animate-ping" />
            )}
            <button
              onClick={isRecording ? () => stopRecording(false) : startRecording}
              disabled={loading}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer ${
                isRecording 
                  ? 'bg-red-500 text-white border-4 border-red-400' 
                  : 'bg-emerald-500 text-white border-4 border-emerald-400 hover:bg-emerald-600'
              }`}
            >
              {isRecording ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-200">
              {isRecording ? "Listening... Tap to stop" : "Ready. Tap button to talk"}
            </p>
            <p className="text-xs text-slate-400">
              {language === 'hindi' 
                ? "उदाहरण: 'गेंहू में खाद कब डालें?'" 
                : "Example: 'When should I irrigate my maize field?'"}
            </p>
          </div>
        </div>

        {/* Transcription & Audio Output */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 space-y-6 h-full min-h-[300px]">
            <h2 className="text-lg font-bold text-white flex items-center justify-between border-b border-emerald-950/40 pb-3">
              <span>Assistant Response</span>
              {speaking ? (
                <button 
                  onClick={stopSpeaking}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                >
                  <VolumeX size={12} /> Mute
                </button>
              ) : (
                response && (
                  <button 
                    onClick={() => speakText(response)}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white transition cursor-pointer"
                  >
                    <Volume2 size={12} /> Play Audio
                  </button>
                )
              )}
            </h2>

            {loading ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-3">
                <RefreshCw size={24} className="animate-spin text-emerald-400" />
                <span className="text-xs">Transcribing and invoking Voice agent...</span>
              </div>
            ) : transcript || response ? (
              <div className="space-y-6 animate-slide-up">
                
                {/* Transcript */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Your Question</span>
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-emerald-950/20 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <User size={12} />
                    </div>
                    <p className="text-sm text-slate-300 italic">"{transcript}"</p>
                  </div>
                </div>

                {/* Reply */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Voice Reply</span>
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-emerald-950/30 flex items-start gap-2.5">
                    <div className="p-1 rounded bg-emerald-500/10 text-emerald-400 mt-0.5">
                      <Bot size={12} />
                    </div>
                    <p className="text-sm text-white font-medium leading-relaxed whitespace-pre-line">{response}</p>
                  </div>
                </div>

              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center">
                <Bot size={36} className="text-slate-600 mb-2 animate-pulse-slow" />
                <span className="text-xs font-semibold text-slate-400">Waiting for Voice input</span>
                <p className="text-[10px] text-slate-500 mt-1 max-w-xs">Transcripts and summaries will appear here after recording.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
