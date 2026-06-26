import re
import time
import logging
from io import BytesIO
from fastapi import HTTPException, Request
from PIL import Image
from app.config import settings

logger = logging.getLogger("krishimitra.security")

# Simple Prompt Injection detection patterns
PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(?:all\s+)?previous\s+instructions",
    r"system\s+(?:override|bypass|reset)",
    r"you\s+are\s+now\s+a\s+",
    r"forget\s+(?:everything\s+)?you\s+were\s+told",
    r"new\s+role\s+:",
    r"bypass\s+safety\s+filters",
    r"jailbreak",
]

# Simple In-Memory Rate Limiter
class RateLimiter:
    def __init__(self):
        self.requests = {}  # ip -> list of timestamps

    def is_rate_limited(self, ip: str) -> bool:
        now = time.time()
        window_start = now - settings.RATE_LIMIT_WINDOW_SECONDS
        
        # Initialize or clean up old requests
        if ip not in self.requests:
            self.requests[ip] = []
        
        # Filter requests within the window
        self.requests[ip] = [t for t in self.requests[ip] if t > window_start]
        
        if len(self.requests[ip]) >= settings.RATE_LIMIT_LIMIT:
            return True
            
        self.requests[ip].append(now)
        return False

rate_limiter = RateLimiter()

def validate_uploaded_file(content: bytes, filename: str):
    """
    Validates file size, file extension, and attempts to open it with PIL 
    to verify it is a legitimate image (magic bytes check).
    """
    # Check size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size is {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Check extension
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    allowed_exts = ["jpg", "jpeg", "png", "webp"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format. Allowed formats: {', '.join(allowed_exts)}."
        )

    # Verify image integrity
    try:
        img = Image.open(BytesIO(content))
        img.verify()
        # Re-open because verify() closes the file descriptor or invalidates the state
        img = Image.open(BytesIO(content))
        # Ensure it is a valid format
        if img.format.lower() not in allowed_exts and img.format.lower() != "mjpeg":
            raise ValueError("Invalid image format verified.")
    except Exception as e:
        logger.error(f"Image verification failed for file {filename}: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. The uploaded file appears corrupted or is not a valid image."
        )

def sanitize_input(text: str) -> str:
    """
    Sanitizes string input by stripping HTML tags and potential script injections.
    """
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]*>", "", text)
    # Remove potentially dangerous characters / JS patterns
    clean = clean.replace("javascript:", "")
    clean = re.sub(r"on\w+\s*=", "", clean)  # remove inline event handlers like onclick
    return clean.strip()

def check_prompt_injection(text: str) -> bool:
    """
    Returns True if the text matches common prompt injection attack signatures.
    """
    if not text:
        return False
    
    normalized_text = text.lower()
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, normalized_text):
            logger.warning(f"Prompt injection pattern detected: '{pattern}' in input.")
            return True
    return False

def safe_execute_tool(tool_func, *args, **kwargs):
    """
    Wraps tool executions in a safety block, capturing any errors and logging them securely.
    """
    try:
        # Pre-execution checks can be added here
        result = tool_func(*args, **kwargs)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        logger.error(f"Error during tool execution '{tool_func.__name__}': {str(e)}")
        return {
            "status": "error",
            "message": f"An error occurred while executing the tool: {str(e)}"
        }
