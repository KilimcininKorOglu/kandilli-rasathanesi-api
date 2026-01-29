# Kandilli Rasathanesi / AFAD API

Turkiye deprem verilerini sunan REST API servisi.

[![License](https://img.shields.io/badge/License-Custom-orange.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-green)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org/)

## Hakkinda

Kandilli Rasathanesi API, **Bogazici Universitesi Kandilli Rasathanesi** ve **AFAD** tarafindan yayinlanan deprem verilerini isleyerek, zenginlestirilmis ve kolayca kullanilabilir formatta sunan bir RESTful API servisidir.

**Ozellikler:**
- Kandilli ve AFAD verilerini birlestirir
- 5 saniyede bir otomatik guncelleme
- GeoJSON formati ve konum zenginlestirme
- En yakin sehirler, havaalanlari ve nufus bilgileri
- Gelismis arama ve filtreleme
- Rate limiting (dakikada 100 istek)
- Docker destegi

## Hizli Baslangic

### Docker ile (Onerilen)

```bash
# .env dosyasini olustur
cp .env.example .env

# Servisleri baslat
docker compose up -d
```

### Manuel Kurulum

```bash
# Bagimliliklari yukle
npm install

# PostgreSQL migration
psql -U kullanici -d veritabani -f migrations/001_init.sql

# .env dosyasini olustur
cp .env.example .env

# Her iki servisi birlikte baslat
npm run dev:all
```

API: `http://localhost:7979/deprem`
Swagger: `http://localhost:7979/deprem/api-docs/`

## Komutlar

| Komut                  | Aciklama                         |
|------------------------|----------------------------------|
| `npm run dev`          | API server (port 7979)           |
| `npm run dev:internal` | Cron service (port 7980)         |
| `npm run dev:all`      | Her iki servisi birlikte baslat  |
| `npm start`            | Production API (PM2, 4 instance) |
| `npm run start:all`    | Production her iki servis        |
| `npx biome check .`    | Linter calistir                  |

## Environment Degiskenleri

`.env` dosyasinda gerekli degiskenler:

```
POSTGRES_USER=
POSTGRES_PASS=
POSTGRES_HOST=
POSTGRES_PORT=5432
POSTGRES_DB=

KANDILLI_URL=http://www.koeri.boun.edu.tr/scripts/lst0.asp
AFAD_API=https://deprem.afad.gov.tr/EventData/GetEventsByFilter

CRON_KEY=
STATS_KEY=
BYPASS_IPS=127.0.0.1
REQUEST_TIMEOUT_MS=30000
```

## API Endpoints

| Method | Endpoint                   | Aciklama                    |
|--------|----------------------------|-----------------------------|
| `GET`  | `/deprem`                  | Tum kaynaklar - Son 24 saat |
| `GET`  | `/deprem/kandilli/live`    | Kandilli - Son 24 saat      |
| `GET`  | `/deprem/kandilli/archive` | Kandilli - Tarih araligi    |
| `GET`  | `/deprem/afad/live`        | AFAD - Son 24 saat          |
| `GET`  | `/deprem/afad/archive`     | AFAD - Tarih araligi        |
| `POST` | `/deprem/data/search`      | Gelismis arama              |
| `GET`  | `/deprem/data/get`         | Tekil deprem bilgisi        |
| `GET`  | `/deprem/statics/cities`   | Sehir listesi               |
| `GET`  | `/deprem/status`           | API durumu                  |

Detayli API dokumantasyonu: [docs/API.md](docs/API.md)

## Swagger UI

API interaktif olarak test edilebilir:

- **Lokal:** `http://localhost:7979/deprem/api-docs/`
- **Production:** `https://api.orhanaydogdu.com.tr/deprem/api-docs/`

Swagger UI uzerinden tum endpointleri gorebilir, parametreleri test edebilir ve ornek response'lari inceleyebilirsiniz.

## Ornek Istek

```bash
curl "http://localhost:7979/deprem?limit=10"
```

## Ornek Yanit

```json
{
  "status": true,
  "httpStatus": 200,
  "serverloadms": 12,
  "result": [
    {
      "earthquake_id": "ABC123XYZ456",
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
        }
      },
      "date_time": "2026-01-28 14:30:00"
    }
  ]
}
```

## Mimari

```
src/
├── constants/       # Config, error classes
├── controller/      # Request validation
├── db/
│   ├── PostgreSQL.js  # CRUD wrapper
│   └── locations/     # GeoJSON boundaries
├── helpers/
│   ├── crawler/     # Kandilli HTML parser, AFAD JSON client
│   └── earthquakes.js  # Location enrichment
├── middlewares/     # Swagger, auth, rate limiting
├── repositories/    # Data access layer
├── routes/          # Express routes
└── services/        # Business logic
```

**Servisler:**
- `index.js` - Public API (port 7979)
- `index-internal.js` - Data fetcher (port 7980) - 5 saniyede bir deprem verilerini ceker

## Docker

Image: `registry.keremgok.tr/kandilli-api:latest`

```bash
# Production
docker compose up -d

# Development (PostgreSQL dahil)
docker compose -f docker-compose.dev.yml up -d
```

Detayli Docker dokumantasyonu: [docs/DOCKER.md](docs/DOCKER.md)

## Lisans

Ozel lisans altinda lisanslanmistir. Detaylar icin [LICENSE](LICENSE) dosyasina bakiniz.

- Egitim ve kisisel kullanim ucretsiz
- Ticari kullanim icin izin gerekli
