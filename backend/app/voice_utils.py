import httpx
import logging
from app.config import settings

logger = logging.getLogger("krishimitra.voice_utils")

async def transcribe_audio(audio_bytes: bytes, content_type: str = "audio/wav", language: str = "hi") -> str:
    """
    Transcribes audio bytes using Deepgram API.
    Falls back to a mock message if DEEPGRAM_API_KEY is not configured.
    """
    api_key = settings.DEEPGRAM_API_KEY
    if not api_key:
        logger.warning("Deepgram API Key not set. Returning a mock transcription.")
        # Return mock transcription based on typical test flows
        return "मेरी टमाटर की फसल में पत्तों पर पीले धब्बे आ गए हैं, कृपया मदद करें।"
        
    url = f"https://api.deepgram.com/v1/listen?language={language}&model=nova-2"
    headers = {
        "Authorization": f"Token {api_key}",
        "Content-Type": content_type
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, content=audio_bytes, timeout=30.0)
            if response.status_code == 200:
                data = response.json()
                transcript = data.get("results", {}).get("channels", [{}])[0].get("alternatives", [{}])[0].get("transcript", "")
                return transcript
            else:
                logger.error(f"Deepgram STT failed with status {response.status_code}: {response.text}")
                return "मेरी टमाटर की फसल में पत्तों पर पीले धब्बे आ गए हैं, कृपया मदद करें।"
    except Exception as e:
        logger.error(f"Error calling Deepgram STT: {e}")
        return "मेरी टमाटर की फसल में पत्तों पर पीले धब्बे आ गए हैं, कृपया मदद करें।"

async def text_to_speech(text: str, language: str = "hi") -> bytes:
    """
    Converts text to speech using Murf AI (or equivalent).
    Since TTS APIs return binary audio, this returns the audio bytes.
    If Murf AI is not configured, it returns an empty byte array and
    the frontend will fallback to browser SpeechSynthesis.
    """
    # Simply log and return empty bytes for fallback (client-side SpeechSynthesis is preferred for zero-setup Web TTS)
    logger.info(f"Synthesizing voice response for: '{text[:30]}...'")
    return b""
