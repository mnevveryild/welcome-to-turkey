import os
import streamlit as st
from typing import Any
from dotenv import load_dotenv
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

class StreamlitCallbackHandler(BaseCallbackHandler):
    def __init__(self, placeholder):
        self.placeholder = placeholder
        self.final_text = ""

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.final_text += token
        self.placeholder.markdown(self.final_text + " ▌")

st.set_page_config(page_title="Turist Rehberi", page_icon="🇹🇷")
st.title("Welcome to Türkiye")

if not os.getenv("GOOGLE_API_KEY"):
    st.error("API anahtarı bulunamadı. Lütfen .env dosyasına GOOGLE_API_KEY ekleyin.")
    st.stop()

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

# Session State Başlatma
if "messages" not in st.session_state:
    st.session_state.messages = [
        SystemMessage(content=system_prompt)
    ]

# Geçmiş mesajları ekranda göster (Sistem mesajı hariç)
for msg in st.session_state.messages:
    if isinstance(msg, HumanMessage):
        with st.chat_message("user"):
            st.markdown(msg.content)
    elif isinstance(msg, AIMessage):
        with st.chat_message("assistant"):
            st.markdown(msg.content)

# chat_input kullanımı daha profesyonel bir görünüm sağlar
user_input = st.chat_input("Nasıl Yardımcı Olabilirim?")

if user_input:
    # Kullanıcı mesajını kaydet ve ekrana bas
    st.session_state.messages.append(HumanMessage(content=user_input))
    with st.chat_message("user"):
        st.markdown(user_input)

    # Rehberin cevabı
    with st.chat_message("assistant"):
        response_placeholder = st.empty()
        stream_handler = StreamlitCallbackHandler(response_placeholder)

        llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            streaming=True, 
            callbacks=[stream_handler],
            temperature=0.7 
        )

        try:
            response = llm.invoke(st.session_state.messages)
            # Final metni cursorsız temizle
            response_placeholder.markdown(response.content)
            # AI cevabını hafızaya ekle
            st.session_state.messages.append(AIMessage(content=response.content))
        except Exception as e:
            st.error(f"Bir hata oluştu: {e}")
