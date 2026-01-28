# Deprem API Dokumantasyonu

Turkiye deprem verilerini sunan REST API servisi. Kandilli Rasathanesi ve AFAD kaynaklarindan deprem verilerini toplar ve zenginlestirilmis formatta sunar.

## Base URL

```
http://localhost:7979/deprem
```

## Genel Bilgiler

- Tum istekler JSON formatinda yanit doner
- Tarih formati: `YYYY-MM-DD` veya `YYYY-MM-DD HH:mm:ss`
- Rate limit: Dakikada 100 istek (IP basina)

## Yanit Formati

Tum endpoint'ler asagidaki formatta yanit doner:

```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 12,
  "desc": "",
  "result": [...],
  "metadata": {
    "count": 10
  }
}
```

## Endpoint'ler

### 1. Tum Kaynaklar - Canli Veriler

Son 24 saatteki tum depremler (Kandilli + AFAD).

```
GET /deprem
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| skip | number | Hayir | Atlanacak kayit sayisi (varsayilan: 0) |
| limit | number | Hayir | Maksimum kayit sayisi (varsayilan: 100) |
| date | string | Hayir | Baslangic tarihi (YYYY-MM-DD) |
| date_end | string | Hayir | Bitis tarihi (YYYY-MM-DD) |

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem?limit=10"
```

**Ornek Yanit:**

```json
{
  "status": true,
  "httpStatus": 200,
  "result": [
    {
      "earthquake_id": "xKkS53iuE7LF5",
      "provider": "kandilli",
      "title": "SINDIRGI (BALIKESIR)",
      "mag": 2.1,
      "depth": 8.5,
      "geojson": {
        "type": "Point",
        "coordinates": [28.1153, 39.1327]
      },
      "location_properties": {
        "closestCity": {
          "name": "Balikesir",
          "cityCode": 10,
          "distance": 45230.5,
          "population": 1257590
        },
        "closestCities": [...],
        "airports": [...]
      },
      "date_time": "2026-01-28 14:30:00",
      "created_at": 1706448600
    }
  ]
}
```

---

### 2. Kandilli - Canli Veriler

Kandilli Rasathanesi'nden son 24 saatteki depremler.

```
GET /deprem/kandilli/live
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| skip | number | Hayir | Atlanacak kayit sayisi |
| limit | number | Hayir | Maksimum kayit sayisi |

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/kandilli/live?limit=5"
```

---

### 3. Kandilli - Arsiv

Kandilli Rasathanesi'nden belirli tarih araligindaki depremler.

```
GET /deprem/kandilli/archive
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| date | string | Evet | Baslangic tarihi (YYYY-MM-DD) |
| date_end | string | Hayir | Bitis tarihi (YYYY-MM-DD) |
| skip | number | Hayir | Atlanacak kayit sayisi |
| limit | number | Hayir | Maksimum kayit sayisi |

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/kandilli/archive?date=2026-01-01&date_end=2026-01-28&limit=50"
```

---

### 4. AFAD - Canli Veriler

AFAD'dan son 24 saatteki depremler.

```
GET /deprem/afad/live
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| skip | number | Hayir | Atlanacak kayit sayisi |
| limit | number | Hayir | Maksimum kayit sayisi |

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/afad/live?limit=10"
```

---

### 5. AFAD - Arsiv

AFAD'dan belirli tarih araligindaki depremler.

```
GET /deprem/afad/archive
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| date | string | Evet | Baslangic tarihi (YYYY-MM-DD) |
| date_end | string | Hayir | Bitis tarihi (YYYY-MM-DD) |
| skip | number | Hayir | Atlanacak kayit sayisi |
| limit | number | Hayir | Maksimum kayit sayisi |

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/afad/archive?date=2026-01-15&limit=20"
```

---

### 6. Gelismis Arama

Depremler uzerinde gelismis filtreleme ve arama.

```
POST /deprem/data/search
```

**Request Body:**

```json
{
  "match": {
    "mag": 4.0,
    "cityCode": 34,
    "provider": "kandilli",
    "date_starts": "2026-01-01 00:00:00",
    "date_ends": "2026-01-28 23:59:59"
  },
  "geoNear": {
    "lon": 29.0,
    "lat": 41.0,
    "radiusMeter": 100000
  },
  "sort": "date_-1",
  "skip": 0,
  "limit": 50
}
```

**Match Parametreleri:**

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| mag | number | Minimum buyukluk |
| cityCode | number | Sehir plaka kodu |
| provider | string | "kandilli" veya "afad" |
| date_starts | string | Baslangic tarihi (YYYY-MM-DD HH:mm:ss) |
| date_ends | string | Bitis tarihi (YYYY-MM-DD HH:mm:ss) |

**GeoNear Parametreleri (Konum Bazli Arama):**

| Parametre | Tip | Aciklama |
|-----------|-----|----------|
| lon | number | Boylam (longitude) |
| lat | number | Enlem (latitude) |
| radiusMeter | number | Yaricap (metre) |

**Sort Secenekleri:**

- `date_1` - Tarihe gore artan
- `date_-1` - Tarihe gore azalan
- `mag_1` - Buyukluge gore artan
- `mag_-1` - Buyukluge gore azalan

**Ornek Istek - Buyukluk Filtreleme:**

```bash
curl -X POST "http://localhost:7979/deprem/data/search" \
  -H "Content-Type: application/json" \
  -d '{
    "match": {"mag": 4.0},
    "sort": "mag_-1",
    "limit": 10
  }'
```

**Ornek Istek - Istanbul Civarinda Arama (100km):**

```bash
curl -X POST "http://localhost:7979/deprem/data/search" \
  -H "Content-Type: application/json" \
  -d '{
    "geoNear": {
      "lon": 28.9784,
      "lat": 41.0082,
      "radiusMeter": 100000
    },
    "match": {"mag": 3.0},
    "limit": 20
  }'
```

---

### 7. Tekil Deprem Bilgisi

Belirli bir depremin detayli bilgisi.

```
GET /deprem/data/get
```

**Query Parametreleri:**

| Parametre | Tip | Zorunlu | Aciklama |
|-----------|-----|---------|----------|
| earthquake_id | string | Evet | Deprem ID'si |

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/data/get?earthquake_id=xKkS53iuE7LF5"
```

---

### 8. Sehir Listesi

Turkiye sehir listesi (plaka kodu, isim, nufus).

```
GET /deprem/statics/cities
```

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/statics/cities"
```

**Ornek Yanit:**

```json
{
  "status": true,
  "httpStatus": 200,
  "result": [
    {"cityCode": 1, "name": "Adana", "population": 2258718},
    {"cityCode": 6, "name": "Ankara", "population": 5663322},
    {"cityCode": 34, "name": "Istanbul", "population": 15840900}
  ]
}
```

---

### 9. API Durumu

API saglik durumu ve istatistikler.

```
GET /deprem/status
```

**Ornek Istek:**

```bash
curl "http://localhost:7979/deprem/status"
```

---

## Deprem Veri Yapisi

Her deprem kaydinda asagidaki alanlar bulunur:

| Alan | Tip | Aciklama |
|------|-----|----------|
| earthquake_id | string | Benzersiz deprem ID'si |
| provider | string | Veri kaynagi ("kandilli" veya "afad") |
| title | string | Deprem lokasyonu |
| mag | number | Buyukluk (magnitude) |
| depth | number | Derinlik (km) |
| geojson | object | GeoJSON Point koordinatlari |
| location_properties | object | Zenginlestirilmis konum bilgileri |
| date_time | string | Deprem zamani |
| created_at | number | Unix timestamp |

### location_properties Yapisi

```json
{
  "closestCity": {
    "name": "Istanbul",
    "cityCode": 34,
    "distance": 45230.5,
    "population": 15840900
  },
  "closestCities": [
    {"name": "Istanbul", "cityCode": 34, "distance": 45230.5},
    {"name": "Kocaeli", "cityCode": 41, "distance": 67890.2}
  ],
  "epiCenter": {
    "name": "Istanbul",
    "cityCode": 34,
    "population": 15840900
  },
  "airports": [
    {"name": "Istanbul Havalimani", "code": "IST", "distance": 52340.5},
    {"name": "Sabiha Gokcen", "code": "SAW", "distance": 38450.2}
  ]
}
```

---

## Hata Kodlari

| HTTP Kodu | Aciklama |
|-----------|----------|
| 200 | Basarili |
| 400 | Gecersiz istek |
| 429 | Rate limit asildi |
| 500 | Sunucu hatasi |

---

## Rate Limiting

- Limit: Dakikada 100 istek
- Kapsam: IP basina
- Asim durumunda HTTP 429 hatasi doner

---

## Kod Ornekleri

### JavaScript (fetch)

```javascript
async function getEarthquakes() {
  const response = await fetch('http://localhost:7979/deprem?limit=10');
  const data = await response.json();
  console.log(data.result);
}
```

### Python

```python
import requests

response = requests.get('http://localhost:7979/deprem', params={'limit': 10})
data = response.json()
print(data['result'])
```

### cURL

```bash
curl -X GET "http://localhost:7979/deprem?limit=10" -H "Accept: application/json"
```
