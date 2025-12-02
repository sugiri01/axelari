"""
Test script to verify OpenRouter API is working
"""
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

if not OPENROUTER_API_KEY:
    print("❌ OPENROUTER_API_KEY not found in .env")
    exit(1)

print(f"✓ API Key found: {OPENROUTER_API_KEY[:10]}...")

try:
    # Configure Client
    client = OpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=OPENROUTER_API_KEY,
    )
    print("✓ OpenRouter client configured successfully")
    
    # Test generation
    print("\nTesting AI generation...")
    response = client.chat.completions.create(
        model="mistralai/mistral-7b-instruct:free",
        messages=[
            {"role": "user", "content": "Say hello in one sentence"}
        ]
    )
    
    print(f"✓ Response: {response.choices[0].message.content}")
    print("\n✅ OpenRouter API is working correctly!")
    
except Exception as e:
    error_msg = f"Error: {str(e)}\n"
    print(f"\n❌ {error_msg}")
    import traceback
    with open("openrouter_error.log", "w") as f:
        f.write(error_msg)
        traceback.print_exc(file=f)
    print("Error details written to openrouter_error.log")
