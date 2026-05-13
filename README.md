# Welcome to Turkey

Türkiye'yi keşfetmek isteyen kullanıcılar için hazırlanmış yapay zeka destekli turistik rehber uygulaması. Proje; Angular tabanlı modern bir web arayüzü, FastAPI tabanlı sohbet API'si ve alternatif olarak çalıştırılabilen Streamlit arayüzünden oluşur.

## Özellikler

- Türkiye şehirleri, tarihi yerleri, yöresel lezzetleri ve gezi önerileri hakkında Türkçe sohbet desteği
- Gemini modeli ile çalışan yapay zeka rehber botu
- Angular ile hazırlanmış görsel ağırlıklı web arayüzü
- Türkiye'den turistik fotoğraflar içeren otomatik fotoğraf slaytı
- FastAPI üzerinden `/api/chat` ve `/api/health` servisleri
- Alternatif Streamlit sohbet uygulaması

## Teknolojiler

- Angular 21
- TypeScript
- FastAPI
- Streamlit
- LangChain
- Google Gemini
- Python

## Proje Yapısı

```text
welcome-to-turkey/
├── backend/
│   └── main.py
├── frontend/
│   ├── public/
│   └── src/
├── images/
├── buddy.py
├── requirements.txt
├── .env.example
└── README.md
```

## Gereksinimler

- Node.js
- npm
- Python 3.10 veya üzeri
- Google Gemini API anahtarı

## Ortam Değişkenleri

Kök dizindeki `.env.example` dosyasını örnek alarak `.env` dosyası oluşturun:

```env
GOOGLE_API_KEY=buraya_gemini_api_anahtarini_yaz
```

## Backend Kurulumu ve Çalıştırma

Kök dizinde Python bağımlılıklarını yükleyin:

```bash
pip install -r requirements.txt
```

FastAPI sunucusunu çalıştırın:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Sağlık kontrolü:

```text
http://localhost:8000/api/health
```

## Frontend Kurulumu ve Çalıştırma

Frontend dizinine geçin:

```bash
cd frontend
```

Bağımlılıkları yükleyin:

```bash
npm install
```

Angular geliştirme sunucusunu başlatın:

```bash
npm start
```

Uygulamayı tarayıcıda açın:

```text
http://localhost:4200
```

Frontend, sohbet isteklerini varsayılan olarak şu adrese gönderir:

```text
http://localhost:8000/api/chat
```

Bu yüzden web arayüzünden sohbeti kullanmak için backend sunucusunun da çalışıyor olması gerekir.

## Alternatif Streamlit Arayüzü

Kök dizinden Streamlit uygulamasını çalıştırabilirsiniz:

```bash
streamlit run buddy.py
```

## Kullanılabilir Komutlar

Frontend içinde:

```bash
npm start
npm run build
npm test
```

Backend için:

```bash
uvicorn backend.main:app --reload --port 8000
```

Streamlit için:

```bash
streamlit run buddy.py
```

## Notlar

- `.env` dosyası gizli API anahtarı içerdiği için paylaşılmamalıdır.
- Uygulama yalnızca Türkiye seyahatiyle ilgili konularda yardımcı olacak şekilde tasarlanmıştır.
- CORS ayarları geliştirme sürecini kolaylaştırmak için geniş tutulmuştur. Canlı ortama alınırken izin verilen kaynakların sınırlandırılması önerilir.
