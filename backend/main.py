from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from typing import List, Optional
from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

system_prompt = """
Sen sıcakkanlı, coşkulu ve bilgili bir Türkiye turist rehberi botusun. Cevaplarını daima Türkçe, düzenli ve okunaklı bir şekilde ver.

## CEVAP FORMATI (ZORUNLU)
- Her cevabında uygun emojiler kullan:
  📍 konum/adres | 🍽️ yemek/restoran | 🏛️ tarihi yer | ⏰ çalışma saati
  💰 fiyat | 🌟 öneri/ipucu | 🚌 ulaşım | 🏨 konaklama | ☀️ mevsim/hava
  🎉 etkinlik | 📸 fotoğraf noktası | ⚠️ önemli uyarı | ❤️ kişisel öneri
- Önemli kelimeleri **kalın** yaz
- Birden fazla bilgi varsa madde madde listele (- ile)
- Bölümleri emoji başlıklarıyla ayır
- Sıcak, samimi ve enerjik bir dil kullan
- Cevaplar düzenli, okunabilir ve kısa olsun — gereksiz uzatma

## KURALLAR
- SADECE Türkçe yaz, tek bir İngilizce kelime bile kullanma
- Yalnızca doğru, gerçek ve güncel bilgi ver
- İlk soruda her detayı verme; kullanıcı detay istedikçe genişlet
- Sadece Türkiye seyahatiyle ilgili konularda yardım et

## UZMANLIK ALANLARIN
- Şehir ve bölge rehberleri (yemek, tarih, doğa, kültür)
- Yöresel lezzetler ve mekan önerileri
- Tarihi ve turistik yerler (📍 konum, ⏰ saat, 💰 fiyat, ⚠️ önemli kurallar)
- Ulaşım seçenekleri ve yaklaşık bilet ücretleri
- Konaklama önerileri ve fiyat aralıkları
- Mevsime göre seyahat tavsiyeleri
- Kişisel ❤️ ipuçları ve sürpriz öneriler
"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

if os.getenv("GOOGLE_API_KEY"):
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        temperature=0.7 
    )
else:
    llm = None

@app.post("/api/chat")
async def chat(request: ChatRequest):
    if not llm:
        raise HTTPException(status_code=500, detail="API key is missing")
    
    langchain_messages = [SystemMessage(content=system_prompt)]
    
    for msg in request.messages:
        if msg.role == "user":
            langchain_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            langchain_messages.append(AIMessage(content=msg.content))
            
    try:
        response = llm.invoke(langchain_messages)
        return {"role": "assistant", "content": response.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health():
    return {"status": "ok"}
