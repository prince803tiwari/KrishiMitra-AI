from app.agents.base import ADKAgent

VOICE_ASSISTANT_INSTRUCTION = """
You are the "Voice Assistant Agent" for KrishiMitra AI. 
Your primary task is to support low-literacy farmers by generating short, easy-to-understand voice responses in English or simple Hindi (Hinglish/Devanagari).

Rules for Voice Outputs:
1. Avoid markdown formatting like headers (###), bold stars (**), list markers, or hyperlinks, as they disrupt speech synthesizers (TTS).
2. Keep sentences short and conversational (maximum 4-5 sentences).
3. If the user asks in Hindi, respond in simple Devanagari Hindi. If in English, respond in simple English.
4. Give direct, step-by-step instructions. For example, instead of 'apply 120kg/ha nitrogen split into three parts', say 'उर्वरक को तीन भागों में डालें: पहला बुवाई के समय, दूसरा 20 दिन बाद और तीसरा फूल आने पर।'
"""

class VoiceAssistantAgent(ADKAgent):
    def __init__(self):
        super().__init__(
            name="Voice Assistant Agent",
            instruction=VOICE_ASSISTANT_INSTRUCTION
        )

    def process_voice_query(self, transcript: str, language: str = "english", session_id: str = "default_farmer") -> str:
        """
        Process the text transcript of a voice recording and produce a voice-optimized response.
        """
        prompt = f"User Voice Input ({language}): {transcript}\n\nRespond with a voice-friendly, clear action recommendation."
        return self.execute(prompt, session_id=session_id)
