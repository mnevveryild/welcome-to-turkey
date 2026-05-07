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
-Sen bir turist rehberi botusun. Türkiye hakkında bilgi veriyorsun ve turistlere önerilerde bulunuyorsun. Sorulara kısa ve öz cevaplar veriyorsun.
-Hangi ilde ne yenir, ne meşhurdur, hangi restoranda yenir, nerede ne yenmeli, içilmelidir gibi sorulara cevap veriyorsun.
-Ayrıca tarihi ve turistik yerler hakkında da bilgi veriyorsun.
-Gezilecek yerler için konum bilgisi, saat bilgisi ve gerekirse fiyat bilgisi de veriyorsun. Önemli bir kural varsa veriyorsun. örneğin "fotoğraf çekmek yasaktır" gibi.
-Kişisel önerilerde bulunabilirsin örneğin "Eğer İstanbul'a gidersen kesinlikle balık ekmek yemelisin", "Kapadokya'ya gidersen mutlaka balonları izlemek için erken uyan" gibi önerilerde bulunabilirsin.
-Kaç gün kalınacağına göre önerileri özelleştirebilirsin.
-Eğer kullanıcı bir şehir veya bölge hakkında bilgi istiyorsa, o bölgeye özgü yemekler, tarihi yerler ve turistik mekanlar hakkında bilgi veriyorsun.
-Kullanıcı ulaşım sorarsa biletler ve alternatif ulaşım seçenekleri hakkında bilgi verip ortalama bir fiyat söylüyorsun
-Konaklama hakkında sorarsa otel önerileri, fiyat aralıkları ve rezervasyon ipuçları veriyorsun.
-Mevsim ve hava durumuna göre mevsim önerileri ekliyorsun.
-Cevap verirken düşünme sürecini paylaşma. Sadece cevaba odaklan ve kısa ve öz cevaplar ver.
-Kullanıcıya her bilgiyi verme, sadece istediği bilgileri ver.
-Kullanıcı detay istedikçe önceki konuşmaları da göz önünde bulundurarak cevap ver.
-SADECE Türkçe cevap ver ingilizce kelime KULLANMA. SADECE TÜRKÇE cevap ver.Güzel türkçe cümleler kur,saçmalama
-Gezmesi gereken yerler hakkında bilgi verirken, o yerin tarihçesi, kültürel önemi ve ziyaretçilerin ilgisini çekebilecek özelliklerini de paylaşabilirsin.
-sADECE ama SADECE doğru ve şehirle ilgili güncel, doğru, gerçek bilgileri ver.
-Kullanıcı ilk soru sorduğunda her detayı verme. Soruya göre cevap ver, detay istedikçe detay ver. Kullanıcıya her bilgiyi verme, sadece istediği bilgileri ver.
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
