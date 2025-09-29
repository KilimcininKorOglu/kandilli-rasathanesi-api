# 🌍 Kandilli Rasathanesi / AFAD API

<div align="center">

[![API Status](https://img.shields.io/badge/API-Active-brightgreen)](https://api.orhanaydogdu.com.tr/deprem/status)
[![License](https://img.shields.io/badge/License-Custom-orange.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-green)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0%2B-green)](https://www.mongodb.com/)

**Türkiye'nin en güncel deprem verilerini sunan, ücretsiz ve açık kaynaklı API servisi**

[🔗 Swagger Dokümantasyonu](https://api.orhanaydogdu.com.tr/deprem/api-docs/) | [📊 API Durumu](https://api.orhanaydogdu.com.tr/deprem/status) | [💬 Whatsapp Topluluğu](https://chat.whatsapp.com/KOkShApC4lc9HlMtFFN3kQ)

</div>

---

## 📋 İçindekiler

- [Hakkında](#-hakkında)
- [Özellikler](#-özellikler)
- [Hızlı Başlangıç](#-hızlı-başlangıç)
- [API Endpoints](#-api-endpoints)
- [Kurulum](#-kurulum)
- [Rate Limiting](#-rate-limiting)
- [Lisans ve Uyarılar](#-lisans-ve-uyarılar)

## 📖 Hakkında

Kandilli Rasathanesi API, **Boğaziçi Üniversitesi Kandilli Rasathanesi** ve **AFAD (Afet ve Acil Durum Yönetimi)** tarafından yayınlanan deprem verilerini işleyerek, zenginleştirilmiş ve kolayca kullanılabilir formatta sunan bir RESTful API servisidir.

### Neden Bu API?

- ✅ **Çift Kaynak**: Kandilli ve AFAD verilerini birleştirir
- ✅ **Gerçek Zamanlı**: Veriler her dakika güncellenir
- ✅ **Zenginleştirilmiş Veri**: Deprem noktasına en yakın şehirler ve havaalanları
- ✅ **GeoJSON Desteği**: Harita uygulamalarına kolay entegrasyon
- ✅ **Ücretsiz**: Ticari olmayan kullanımlar için tamamen ücretsiz
- ✅ **Güvenilir**: MongoDB ve Redis cache ile yüksek performans

## ✨ Özellikler

### Temel Özellikler
- 📊 Son 24 saatteki depremler (canlı veri)
- 📅 Tarih bazlı deprem arşivi
- 🗺️ GeoJSON formatında konum verileri
- 🏙️ Depreme en yakın şehir bilgileri
- ✈️ En yakın havaalanları ve uzaklıkları
- 👥 Etkilenen bölge nüfus bilgileri

### Teknik Özellikler
- ⚡ 30 saniyelik önbellekleme (canlı veriler)
- 🔍 Gelişmiş arama ve filtreleme
- 📈 İstatistik ve analiz endpointleri
- 🔐 Rate limiting (dakikada 100 istek)
- 📖 Swagger/OpenAPI dokümantasyonu
- 🌍 30+ ülke için sınır verileri

## 🚀 Hızlı Başlangıç - Tüm Kaynaklar (Kandilli/AFAD)

```bash
curl https://api.orhanaydogdu.com.tr/deprem
```

## 📚 API Endpoints

### 📖 Swagger/OpenAPI Dokümantasyonu

Detaylı API dokümantasyonu ve interaktif test arayüzü için:

🔗 **[https://api.orhanaydogdu.com.tr/deprem/api-docs/](https://api.orhanaydogdu.com.tr/deprem/api-docs/)**

### Endpoint Listesi

| Method | Endpoint | Açıklama | Cache | Rate Limit |
|--------|----------|----------|-------|------------|
| `GET` | `/deprem/kandilli/live` | Kandilli - Son 24 saat | 30s | 100/dk |
| `GET` | `/deprem/kandilli/archive` | Kandilli - Tarih aralığı | - | 100/dk |
| `GET` | `/deprem/afad/live` | AFAD - Son 24 saat | 30s | 100/dk |
| `GET` | `/deprem/afad/archive` | AFAD - Tarih aralığı | - | 100/dk |
| `GET` | `/deprem` | Tüm kaynaklar - Son 24 saat | - | 100/dk |
| `POST` | `/deprem/data/search` | Gelişmiş arama & filtreleme | - | 100/dk |
| `GET` | `/deprem/data/get` | Tekil deprem bilgisi | - | 100/dk |
| `GET` | `/deprem/statics/cities` | Şehir listesi | - | 100/dk |
| `GET` | `/deprem/status` | API sağlık durumu | - | 100/dk |

---

### 1️⃣ Kandilli - Canlı Veriler

**Endpoint:** `GET /deprem/kandilli/live`

**Açıklama:** Kandilli Rasathanesi'nden son 24 saatteki depremler.

**Query Parametreleri:**
- `skip` (number, optional): Atlanacak kayıt sayısı (default: 0)
- `limit` (number, optional): Maksimum kayıt sayısı (default: 50, max: 100)

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/kandilli/live?skip=0&limit=10"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 12,
  "metadata": {
    "date_starts": "2024-01-07 12:00:00",
    "date_ends": "2024-01-08 12:00:00",
    "count": 10
  },
  "result": [
    {
      "earthquake_id": "ABC123XYZ456",
      "provider": "kandilli",
      "title": "AKDENIZ",
      "date": "2024.01.08 11:45:23",
      "mag": 3.8,
      "depth": 10.5,
      "geojson": {
        "type": "Point",
        "coordinates": [30.5432, 36.1234]
      },
      "location_properties": {
        "closestCity": {
          "name": "Antalya",
          "cityCode": 7,
          "distance": 125430.5,
          "population": 2619832
        }
      },
      "date_time": "2024-01-08 11:45:23",
      "created_at": 1704710723
    }
  ]
}
```

---

### 2️⃣ Kandilli - Arşiv

**Endpoint:** `GET /deprem/kandilli/archive`

**Açıklama:** Kandilli Rasathanesi'nden belirli tarih aralığındaki depremler.

**Query Parametreleri:**
- `date` (string, required): Başlangıç tarihi (YYYY-MM-DD)
- `date_end` (string, optional): Bitiş tarihi (YYYY-MM-DD, default: bugün)
- `skip` (number, optional): Atlanacak kayıt sayısı (default: 0)
- `limit` (number, optional): Maksimum kayıt sayısı (default: 50, max: 100)

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/kandilli/archive?date=2024-01-01&date_end=2024-01-31&limit=50"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 28,
  "metadata": {
    "count": 50
  },
  "result": [
    {
      "earthquake_id": "DEF456GHI789",
      "provider": "kandilli",
      "title": "GEMLIK KORFEZI (BURSA)",
      "mag": 4.2,
      "depth": 8.7,
      "date_time": "2024-01-15 14:23:11"
    }
  ]
}
```

---

### 3️⃣ AFAD - Canlı Veriler

**Endpoint:** `GET /deprem/afad/live`

**Açıklama:** AFAD'dan son 24 saatteki depremler.

**Query Parametreleri:**
- `skip` (number, optional): Atlanacak kayıt sayısı (default: 0)
- `limit` (number, optional): Maksimum kayıt sayısı (default: 50, max: 100)

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/afad/live?limit=20"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 15,
  "metadata": {
    "date_starts": "2024-01-07 12:00:00",
    "date_ends": "2024-01-08 12:00:00",
    "count": 20
  },
  "result": [
    {
      "earthquake_id": "JKL789MNO012",
      "provider": "afad",
      "title": "AEGEAN SEA",
      "mag": 3.5,
      "depth": 7.2,
      "date_time": "2024-01-08 10:30:15"
    }
  ]
}
```

---

### 4️⃣ AFAD - Arşiv

**Endpoint:** `GET /deprem/afad/archive`

**Açıklama:** AFAD'dan belirli tarih aralığındaki depremler.

**Query Parametreleri:**
- `date` (string, required): Başlangıç tarihi (YYYY-MM-DD)
- `date_end` (string, optional): Bitiş tarihi (YYYY-MM-DD, default: bugün)
- `skip` (number, optional): Atlanacak kayıt sayısı (default: 0)
- `limit` (number, optional): Maksimum kayıt sayısı (default: 50, max: 100)

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/afad/archive?date=2024-01-01&date_end=2024-01-10"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 22,
  "metadata": {
    "count": 35
  },
  "result": [
    {
      "earthquake_id": "PQR345STU678",
      "provider": "afad",
      "title": "Ege Denizi",
      "mag": 4.1,
      "depth": 10.3,
      "date_time": "2024-01-05 08:15:42"
    }
  ]
}
```

---

### 5️⃣ Tüm Kaynaklar (Kombine)

**Endpoint:** `GET /deprem`

**Açıklama:** Tüm veri kaynaklarından (Kandilli + AFAD) son 24 saatteki depremler.

**Query Parametreleri:**
- `date` (string, optional): Başlangıç tarihi (YYYY-MM-DD, default: 24 saat önce)
- `date_end` (string, optional): Bitiş tarihi (YYYY-MM-DD, default: şimdi)
- `skip` (number, optional): Atlanacak kayıt sayısı (default: 0)
- `limit` (number, optional): Maksimum kayıt sayısı (default: 50, max: 100)

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem?limit=30"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 18,
  "result": [
    {
      "earthquake_id": "ABC123",
      "provider": "kandilli",
      "title": "MARMARA DENIZI",
      "mag": 3.2,
      "depth": 8.5,
      "date_time": "2024-01-08 10:15:30"
    },
    {
      "earthquake_id": "XYZ789",
      "provider": "afad",
      "title": "EGE DENIZI",
      "mag": 2.8,
      "depth": 6.2,
      "date_time": "2024-01-08 09:45:12"
    }
  ]
}
```

---

### 6️⃣ Gelişmiş Arama

**Endpoint:** `POST /deprem/data/search`

**Açıklama:** Tüm depremler üzerinde gelişmiş filtreleme, konum bazlı arama ve sıralama.

**Request Body:**
```json
{
  "provider": "kandilli",  // optional: "kandilli" veya "afad" - kaynak filtresi
  "match": {
    "mag": 4.0,              // optional: Minimum büyüklük
    "cityCode": 34,          // optional: Şehir plaka kodu
    "date_starts": "2024-01-01 00:00:00",  // optional: Başlangıç tarihi
    "date_ends": "2024-01-31 23:59:59"     // optional: Bitiş tarihi
  },
  "geoNear": {
    "lon": 29.0,             // optional: Boylam koordinatı
    "lat": 41.0,             // optional: Enlem koordinatı
    "radiusMeter": 100000    // optional: Yarıçap (metre)
  },
  "sort": "date_-1",         // optional: date_1, date_-1, mag_1, mag_-1
  "skip": 0,                 // optional: Sayfalama offset
  "limit": 100               // optional: Max kayıt (default: 100, max: 100 - otomatik sınırlanır)
}
```

**Örnek 1 - Büyüklük Filtreleme:**
```bash
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "match": {"mag": 4.5},
    "sort": "mag_-1",
    "limit": 10
  }'
```

**Örnek 2 - Konum Bazlı Arama (İstanbul çevresinde 200km):**
```bash
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "geoNear": {
      "lon": 28.9784,
      "lat": 41.0082,
      "radiusMeter": 200000
    },
    "match": {"mag": 3.0},
    "limit": 20
  }'
```

**Örnek 3 - Şehir ve Tarih Filtresi:**
```bash
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "match": {
      "cityCode": 6,
      "mag": 3.0,
      "date_starts": "2024-01-01 00:00:00",
      "date_ends": "2024-01-31 23:59:59"
    },
    "sort": "date_-1"
  }'
```

**Örnek 4 - Kaynak Filtresi (Sadece AFAD):**
```bash
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "afad",
    "match": {"mag": 4.0},
    "limit": 30
  }'
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 35,
  "result": [
    {
      "earthquake_id": "VWX901YZA234",
      "provider": "kandilli",
      "title": "MARMARA DENIZI",
      "mag": 4.8,
      "depth": 12.3,
      "geojson": {
        "type": "Point",
        "coordinates": [28.5, 40.8]
      },
      "location_properties": {
        "closestCity": {
          "name": "İstanbul",
          "cityCode": 34,
          "distance": 45230.8,
          "population": 15840900
        },
        "closestCities": [
          {"name": "İstanbul", "cityCode": 34, "distance": 45230.8},
          {"name": "Tekirdağ", "cityCode": 59, "distance": 67890.2}
        ],
        "airports": [
          {
            "name": "İstanbul Havalimanı",
            "code": "IST",
            "distance": 52340.5
          }
        ]
      },
      "date_time": "2024-01-15 14:23:11"
    }
  ],
  "metadata": {
    "total": 47,
    "count": 10
  }
}
```

---

### 7️⃣ Tekil Deprem Bilgisi

**Endpoint:** `GET /deprem/data/get`

**Açıklama:** Belirli bir earthquake_id'ye sahip depremin detaylı bilgisi.

**Query Parametreleri:**
- `earthquake_id` (string, required): Deprem ID'si

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/data/get?earthquake_id=EoIrMsfMSC19f"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "result": {
    "earthquake_id": "EoIrMsfMSC19f",
    "provider": "kandilli",
    "title": "CALIS-ELBISTAN (KAHRAMANMARAS)",
    "date": "2023.03.08 02:54:44",
    "mag": 4.2,
    "depth": 5,
    "geojson": {
      "type": "Point",
      "coordinates": [37.0132, 38.1355]
    },
    "location_properties": {
      "closestCity": {
        "name": "Kahramanmaraş",
        "cityCode": 46,
        "distance": 15234.56,
        "population": 1177436
      },
      "epiCenter": {
        "name": "Kahramanmaraş",
        "cityCode": 46,
        "population": 1177436
      },
      "airports": [
        {
          "distance": 66757.09,
          "name": "Kahramanmaraş Havalimanı",
          "code": "KCM"
        }
      ]
    },
    "date_time": "2023-03-08 02:54:44",
    "created_at": 1678240484
  }
}
```

---

### 8️⃣ Şehir Listesi

**Endpoint:** `GET /deprem/statics/cities`

**Açıklama:** Türkiye şehir listesi (plaka kodu, isim, nüfus).

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/statics/cities"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "result": [
    {
      "cityCode": 1,
      "name": "Adana",
      "population": 2258718
    },
    {
      "cityCode": 6,
      "name": "Ankara",
      "population": 5663322
    },
    {
      "cityCode": 34,
      "name": "İstanbul",
      "population": 15840900
    }
  ]
}
```

---

### 9️⃣ API Sağlık Durumu

**Endpoint:** `GET /deprem/status`

**Açıklama:** API durumu, toplam deprem sayısı ve sistem bilgileri.

**Örnek İstek:**
```bash
curl "https://api.orhanaydogdu.com.tr/deprem/status"
```

**Örnek Response:**
```json
{
  "status": true,
  "httpStatus": 200,
  "result": {
    "api_status": "online",
    "total_earthquakes": 125847,
    "last_update": "2024-01-08 12:45:30",
    "uptime_seconds": 8642341
  }
}
```

## 💻 Kurulum

### Gereksinimler
- Node.js >= 14.0.0
- MongoDB >= 6.0
- PM2 (opsiyonel, production için)

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/orhanayd/kandilli-rasathanesi-api.git
cd kandilli-rasathanesi-api
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment değişkenlerini ayarlayın**
```bash
cp .env.example .env
# .env dosyasını düzenleyin
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Production için**
```bash
npm start
```


## 🔒 Rate Limiting

API'nin sürdürülebilirliği için rate limiting uygulanmaktadır:

- **Limit**: Dakikada maksimum 100 istek
- **Kapsam**: IP başına
- **Bypass**: `BYPASS_IPS` environment değişkeni ile belirli IP'ler muaf tutulabilir
- **Hata Kodu**: 429 (Too Many Requests)

## 📜 Lisans ve Uyarılar

### 🔒 Lisans Koşulları

Bu proje **özel lisans** altında lisanslanmıştır:

- ✅ **Ücretsiz Kullanım**: Eğitim, araştırma ve kişisel amaçlar için
- ❌ **Ticari Kullanım**: Yazılı izin gerektirir
- 📄 **Atribusyon**: Projenizde "Kandilli Rasathanesi API" referansı gerekli
- 🚫 **Veri Ticareti**: Deprem verilerinin satışı yasaktır

### ⚠️ Ticari Kullanım Uyarısı

> **ÖNEMLİ UYARI**:
> 1. Söz konusu bilgi, veri ve haritalar Boğaziçi Üniversitesi Rektörlüğü'nün yazılı izni olmadan ticari amaçlı kullanılamaz.
> 2. API'nin ticari kullanımı için info@orhanaydogdu.com.tr adresinden detaylı bilgi ve izin alınmalıdır.
> 3. İzinsiz ticari kullanım yasal işleme tabi olabilir.

### 📝 Lisans Detayları

Tam lisans metni için [LICENSE](LICENSE) dosyasına bakınız.

### İletişim
- 📧 Email: info@orhanaydogdu.com.tr
- 💬 [Whatsapp Topluluğu](https://chat.whatsapp.com/KOkShApC4lc9HlMtFFN3kQ)
- 🐛 [GitHub Issues](https://github.com/orhanayd/kandilli-rasathanesi-api/issues)

## 🙏 Teşekkürler

- Boğaziçi Üniversitesi Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü'ne veri sağladıkları için teşekkürler.
- AFAD (Afet ve Acil Durum Yönetimi Başkanlığı)'a veri sağladıkları için teşekkürler.
- Bu API'yi kullanan ve geri bildirim sağlayan tüm geliştiricilere teşekkürler.

---

<div align="center">

**Made with ❤️ by [Orhan Aydoğdu](https://github.com/orhanayd)**

</div>