"""
Test script to verify Gemini API is working
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ GEMINI_API_KEY not found in .env")
    exit(1)

print(f"✓ API Key found: {GEMINI_API_KEY[:10]}...")

try:
    # Configure Gemini
    genai.configure(api_key=GEMINI_API_KEY)
    print("✓ Gemini configured successfully")
    
    # List available models
    print("\nListing available models...")
    with open("available_models.txt", "w") as f:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
                f.write(f"{m.name}\n")
    
    # Create model (try to find a valid one)
    # We'll read the first valid model from the list if possible, or default to gemini-pro
    model_name = 'gemini-pro'
    print(f"\nAttempting to use model: {model_name}")
    model = genai.GenerativeModel(model_name)
    
    # Test generation
    print("\nTesting AI generation...")
    response = model.generate_content("Say hello in one sentence")
    print(f"✓ Response: {response.text}")
    print("\n✅ Gemini API is working correctly!")
    
except Exception as e:
    error_msg = f"Error: {str(e)}\n"
    print(f"\n❌ {error_msg}")
    import traceback
    with open("gemini_error.log", "w") as f:
        f.write(error_msg)
        traceback.print_exc(file=f)
    print("Error details written to gemini_error.log")
