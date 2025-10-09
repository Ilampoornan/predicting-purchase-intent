
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
import requests
import os

router = APIRouter()

# Mistral AI API setup
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")  

@router.post("/llm-interpret-rfm")
async def llm_interpret_rfm(request: Request):
    try:
        data = await request.json()
        clusters = data.get("clusters", [])
        prompt = (
            "Given this RFM cluster summary, reply in 4 lines or less. For each cluster, state the number of customers and one recommended action. Example: 'There are 400 at-risk customers, send win-back email.' Be concise. "
            "Table: " + str(clusters)
        )
        payload = {
            "model": "mistral-small",
            "messages": [
                {"role": "system", "content": "You are a helpful business analyst."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 256,
            "temperature": 0.7
        }
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {MISTRAL_API_KEY}"
        }
        response = requests.post(MISTRAL_API_URL, json=payload, headers=headers, timeout=20)
        if response.status_code == 200:
            mistral_reply = response.json()["choices"][0]["message"]["content"]
            return JSONResponse(content={"interpretation": mistral_reply})
        else:
            print("Mistral API error:", response.status_code, response.text)
            return JSONResponse(content={"error": "Mistral API error", "details": response.text}, status_code=500)
    except Exception as e:
        print("LLM endpoint error:", str(e))
        return JSONResponse(content={"error": "Internal server error", "details": str(e)}, status_code=500)
