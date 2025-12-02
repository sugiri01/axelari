import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY:
    print("❌ OPENROUTER_API_KEY not found")
    exit(1)

try:
    response = requests.get(
        "https://openrouter.ai/api/v1/models",
        headers={"Authorization": f"Bearer {OPENROUTER_API_KEY}"}
    )
    
    if response.status_code == 200:
        models = response.json()["data"]
        print(f"Found {len(models)} models. Listing free/low-cost options:")
        
        with open("openrouter_models.txt", "w") as f:
            for model in models:
                model_id = model["id"]
                name = model["name"]
                pricing = model.get("pricing", {})
                prompt = pricing.get("prompt", "0")
                completion = pricing.get("completion", "0")
                
                # Check for free models or low cost
                is_free = prompt == "0" and completion == "0"
                
                if is_free or ":free" in model_id:
                    print(f"- {model_id} ({name}) - FREE")
                    f.write(f"{model_id}\n")
                elif "llama" in model_id.lower() or "mistral" in model_id.lower():
                     f.write(f"{model_id} (Paid)\n")

    else:
        print(f"Error: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"Error: {e}")
