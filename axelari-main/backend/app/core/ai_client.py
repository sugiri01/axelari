import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

if OPENROUTER_API_KEY:
    print(f"✓ OpenRouter AI configured successfully")
else:
    print("⚠ Warning: OPENROUTER_API_KEY not set. AI features will not work.")

def get_ai_client():
    """Get OpenRouter AI client instance"""
    if not OPENROUTER_API_KEY:
        print("⚠ OPENROUTER_API_KEY not configured")
        return None
    
    try:
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=OPENROUTER_API_KEY,
        )
        return client
    except Exception as e:
        print(f"Error creating OpenRouter client: {str(e)}")
        return None
