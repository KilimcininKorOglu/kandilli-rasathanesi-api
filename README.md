# 🌍 Kandilli Rasathanesi API

<div align="center">

[![API Status](https://img.shields.io/badge/API-Active-brightgreen)](https://api.orhanaydogdu.com.tr/deprem/status)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
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
- [Kullanım Örnekleri](#-kullanım-örnekleri)
- [Veri Yapısı](#-veri-yapısı)
- [Rate Limiting](#-rate-limiting)
- [Lisans ve Uyarılar](#-lisans-ve-uyarılar)

## 📖 Hakkında

Kandilli Rasathanesi API, Boğaziçi Üniversitesi Kandilli Rasathanesi tarafından yayınlanan deprem verilerini işleyerek, zenginleştirilmiş ve kolayca kullanılabilir formatta sunan bir RESTful API servisidir.

### Neden Bu API?

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
- 🔐 Rate limiting (dakikada 40 istek)
- 📖 Swagger/OpenAPI dokümantasyonu
- 🌍 30+ ülke için sınır verileri

## 🚀 Hızlı Başlangıç

### Canlı API Kullanımı

#### cURL Örnekleri

```bash
# Son 24 saatteki depremler
curl https://api.orhanaydogdu.com.tr/deprem/kandilli/live

# Sayfalama ile son depremler (10-20 arası kayıtlar)
curl "https://api.orhanaydogdu.com.tr/deprem/kandilli/live?skip=10&limit=10"

# Belirli tarih aralığındaki depremler
curl "https://api.orhanaydogdu.com.tr/deprem/kandilli/archive?date=2024-01-01&date_end=2024-01-31"

# Tek bir deprem bilgisi
curl "https://api.orhanaydogdu.com.tr/deprem/data/get?earthquake_id=EoIrMsfMSC19f"

# Gelişmiş arama - Büyüklük filtreleme
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "match": {"mag": 4.0},
    "sort": "mag_-1",
    "limit": 10
  }'

# Gelişmiş arama - Konum bazlı (100km yarıçapında)
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "geoNear": {
      "lon": 29.0,
      "lat": 41.0,
      "radiusMeter": 100000
    },
    "limit": 20
  }'

# Gelişmiş arama - İstanbul çevresindeki son 1 haftanın 3+ büyüklüğündeki depremleri
curl -X POST https://api.orhanaydogdu.com.tr/deprem/data/search \
  -H "Content-Type: application/json" \
  -d '{
    "match": {
      "mag": 3.0,
      "cityCode": 34,
      "date_starts": "2024-01-01 00:00:00",
      "date_ends": "2024-01-07 23:59:59"
    },
    "sort": "date_-1",
    "limit": 50
  }'

# Şehir listesi
curl https://api.orhanaydogdu.com.tr/deprem/statics/cities

# API durumu ve istatistikleri
curl https://api.orhanaydogdu.com.tr/deprem/status
```

#### JavaScript/Node.js Örneği

```javascript
// Son depremler
fetch('https://api.orhanaydogdu.com.tr/deprem/kandilli/live')
  .then(res => res.json())
  .then(data => {
    console.log(`Son ${data.result.length} deprem:`);
    data.result.forEach(eq => {
      console.log(`${eq.title} - Büyüklük: ${eq.mag}`);
    });
  });

// Gelişmiş arama
fetch('https://api.orhanaydogdu.com.tr/deprem/data/search', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    match: { mag: 4.5 },
    sort: 'mag_-1',
    limit: 5
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

#### Python Örneği

```python
import requests
import json

# Son depremler
response = requests.get('https://api.orhanaydogdu.com.tr/deprem/kandilli/live')
data = response.json()

for earthquake in data['result'][:10]:
    print(f"{earthquake['title']} - Büyüklük: {earthquake['mag']}")

# Gelişmiş arama - Konum bazlı
url = 'https://api.orhanaydogdu.com.tr/deprem/data/search'
payload = {
    'geoNear': {
        'lon': 28.9784,  # İstanbul
        'lat': 41.0082,
        'radiusMeter': 200000  # 200km
    },
    'match': {
        'mag': 3.0
    },
    'limit': 20
}

response = requests.post(url, json=payload)
earthquakes = response.json()

for eq in earthquakes['result']:
    distance = eq['location_properties']['closestCity']['distance'] / 1000
    print(f"{eq['title']} - {eq['mag']} - {distance:.1f}km uzakta")
```

#### PHP Örneği

```php
<?php
// Son depremler
$url = 'https://api.orhanaydogdu.com.tr/deprem/kandilli/live';
$response = file_get_contents($url);
$data = json_decode($response, true);

foreach (array_slice($data['result'], 0, 10) as $earthquake) {
    echo $earthquake['title'] . ' - Büyüklük: ' . $earthquake['mag'] . PHP_EOL;
}

// Gelişmiş arama
$url = 'https://api.orhanaydogdu.com.tr/deprem/data/search';
$data = [
    'match' => ['mag' => 4.0],
    'sort' => 'date_-1',
    'limit' => 10
];

$options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);
$result = json_decode($response, true);
?>
```

## 📚 API Endpoints

### 📖 Swagger/OpenAPI Dokümantasyonu

Detaylı API dokümantasyonu ve interaktif test arayüzü için:

🔗 **[https://api.orhanaydogdu.com.tr/deprem/api-docs/](https://api.orhanaydogdu.com.tr/deprem/api-docs/)**

### Public Endpoints

| Method | Endpoint | Açıklama | Cache |
|--------|----------|----------|-------|
| `GET` | `/deprem/kandilli/live` | Son 24 saatteki depremler | 30s |
| `GET` | `/deprem/kandilli/archive` | Tarih bazlı deprem arşivi | - |
| `POST` | `/deprem/data/search` | Gelişmiş arama | - |
| `GET` | `/deprem/data/get` | Tekil deprem bilgisi | - |
| `GET` | `/deprem/statics/cities` | Şehir listesi | - |
| `GET` | `/deprem/status` | API durumu ve istatistikleri | - |

### Query Parametreleri

#### `/kandilli/live` ve `/kandilli/archive`
- `skip`: Atlanacak kayıt sayısı (varsayılan: 0)
- `limit`: Maksimum kayıt sayısı (varsayılan: 100, max: 1000)
- `date`: Başlangıç tarihi (YYYY-MM-DD formatında)
- `date_end`: Bitiş tarihi (YYYY-MM-DD formatında)

#### `/data/search` Request Body
```json
{
  "match": {
    "mag": 4.0,              // Minimum büyüklük
    "date_starts": "2024-01-01 00:00:00",
    "date_ends": "2024-01-31 23:59:59",
    "cityCode": 34           // Şehir plaka kodu
  },
  "geoNear": {
    "lon": 29.0,             // Boylam
    "lat": 41.0,             // Enlem
    "radiusMeter": 100000    // Yarıçap (metre)
  },
  "sort": "date_-1",         // Sıralama: date_1, date_-1, mag_1, mag_-1
  "skip": 0,
  "limit": 100
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

### Environment Değişkenleri

`.env` dosyası oluşturun ve aşağıdaki değişkenleri tanımlayın:

```env
# MongoDB Bağlantısı
MONGODB_USER=your_mongodb_user
MONGODB_PASS=your_mongodb_password
MONGODB_HOST=localhost
MONGODB_PORT=27017

# Kandilli Veri Kaynakları (İletişime geçin)
KANDILLI_XML=contact_for_url
KANDILLI_DATE_XML=contact_for_url

# Güvenlik Anahtarları
CRON_KEY=your_secure_cron_key
STATS_KEY=your_secure_stats_key
BYPASS_IPS=127.0.0.1,::1

# Ortam
NODE_ENV=DEV  # DEV veya PROD
```

> ⚠️ **Not**: Kandilli veri kaynak URL'leri için lütfen info@orhanaydogdu.com.tr adresinden iletişime geçin.

## 📊 Veri Yapısı ve Örnekler

### Başarılı Response Formatı

```json
{
  "status": true,
  "serverloadms": 45,
  "desc": "success",
  "result": [...],
  "metadata": {
    "total": 127,
    "count": 10,
    "date_starts": "2024-01-01 00:00:00",
    "date_ends": "2024-01-01 23:59:59"
  }
}
```

### Hata Response Formatı

```json
{
  "status": false,
  "httpStatus": 429,
  "desc": "Too Many Request in 1 minute! Requests limited in 1 minute maximum 40 times"
}
```

### Deprem Objesi

```json
{
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
    "closestCities": [
      {
        "name": "Kahramanmaraş",
        "cityCode": 46,
        "distance": 15234.56,
        "population": 1177436
      }
    ],
    "airports": [
      {
        "distance": 66757.09,
        "name": "Kahramanmaraş Havalimanı",
        "code": "KCM",
        "coordinates": {
          "type": "Point",
          "coordinates": [36.9473, 37.5374]
        }
      }
    ]
  },
  "rev": null,
  "date_time": "2023-03-08 02:54:44",
  "created_at": 1678240484,
  "location_tz": "Europe/Istanbul"
}
```

### Örnek: /kandilli/live Response

```json
{
  "status": true,
  "serverloadms": 12,
  "desc": "success",
  "metadata": {
    "date_starts": "2024-01-07 12:00:00",
    "date_ends": "2024-01-08 12:00:00",
    "total": 45,
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
        },
        "epiCenter": {
          "name": null,
          "cityCode": null,
          "population": null
        },
        "closestCities": [
          {
            "name": "Antalya",
            "cityCode": 7,
            "distance": 125430.5,
            "population": 2619832
          },
          {
            "name": "Mersin",
            "cityCode": 33,
            "distance": 189234.7,
            "population": 1916432
          }
        ],
        "airports": [
          {
            "distance": 132567.8,
            "name": "Antalya Havalimanı",
            "code": "AYT",
            "coordinates": {
              "type": "Point",
              "coordinates": [30.8005, 36.8987]
            }
          }
        ]
      },
      "rev": null,
      "date_time": "2024-01-08 11:45:23",
      "created_at": 1704710723,
      "location_tz": "Europe/Istanbul"
    }
  ]
}
```

### Örnek: /data/search ile Şehir Bazlı Arama Response

```json
{
  "status": true,
  "serverloadms": 28,
  "result": [
    {
      "earthquake_id": "DEF789GHI012",
      "provider": "kandilli",
      "title": "GEMLIK KORFEZI (BURSA)",
      "mag": 4.2,
      "depth": 8.7,
      "location_properties": {
        "closestCity": {
          "name": "Bursa",
          "cityCode": 16,
          "distance": 23456.7,
          "population": 3147818
        }
      }
    }
  ],
  "metadata": {
    "total": 3,
    "count": 3
  }
}
```

## 🔒 Rate Limiting

API'nin sürdürülebilirliği için rate limiting uygulanmaktadır:

- **Limit**: Dakikada maksimum 40 istek
- **Kapsam**: IP başına
- **Bypass**: `BYPASS_IPS` environment değişkeni ile belirli IP'ler muaf tutulabilir
- **Hata Kodu**: 429 (Too Many Requests)

## 📜 Lisans ve Uyarılar

### Ticari Kullanım Uyarısı
> ⚠️ **ÖNEMLİ**: Söz konusu bilgi, veri ve haritalar Boğaziçi Üniversitesi Rektörlüğü'nün yazılı izni ve onayı olmadan herhangi bir şekilde ticari amaçlı kullanılamaz.

### Lisans
Bu proje ISC lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

### İletişim
- 📧 Email: info@orhanaydogdu.com.tr
- 💬 [Whatsapp Topluluğu](https://chat.whatsapp.com/KOkShApC4lc9HlMtFFN3kQ)
- 🐛 [GitHub Issues](https://github.com/orhanayd/kandilli-rasathanesi-api/issues)

## 🙏 Teşekkürler

- Boğaziçi Üniversitesi Kandilli Rasathanesi ve Deprem Araştırma Enstitüsü'ne veri sağladıkları için teşekkürler.
- Bu API'yi kullanan ve geri bildirim sağlayan tüm geliştiricilere teşekkürler.

---

<div align="center">

**Made with ❤️ by [Orhan Aydoğdu](https://github.com/orhanayd)**

</div>