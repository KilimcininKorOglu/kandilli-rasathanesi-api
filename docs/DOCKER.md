# Docker Kurulum Rehberi

Bu dokuman, Kandilli Rasathanesi API'yi Docker ile calistirma talimatlarini icerir.

## Gereksinimler

- Docker Engine 20.10+
- Docker Compose 2.0+

## Hizli Baslangic

### 1. Environment Dosyasini Olustur

```bash
cp .env.example .env
```

`.env` dosyasini duzenle ve PostgreSQL bilgilerini gir.

### 2. Production Ortami

Harici PostgreSQL sunucusu kullanmak icin:

```bash
docker compose up -d
```

Bu komut iki container baslatir:
- `kandilli-api` - API servisi (port 7979)
- `kandilli-cron` - Veri cekme servisi (port 7980) - her 5 saniyede bir deprem verilerini ceker

### 3. Development Ortami (PostgreSQL dahil)

Lokal PostgreSQL ile gelistirme icin:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Bu komut uc container baslatir:
- `kandilli-api-dev` - API servisi
- `kandilli-cron-dev` - Cron servisi
- `kandilli-postgres` - PostgreSQL veritabani

## Docker Komutlari

### Container Yonetimi

```bash
# Containerlari baslat
docker compose up -d

# Containerlari durdur
docker compose down

# Loglari izle
docker compose logs -f

# Sadece API loglarini izle
docker compose logs -f api

# Container durumunu kontrol et
docker compose ps
```

### Image Yonetimi

```bash
# Image'i registry'den cek
docker pull registry.keremgok.tr/kandilli-api:latest

# Lokal build (opsiyonel)
docker build -t registry.keremgok.tr/kandilli-api:latest .
```

### Veritabani Islemleri (Dev)

```bash
# PostgreSQL'e baglan
docker compose -f docker-compose.dev.yml exec postgres psql -U your_username -d deprem

# Migration calistir
docker compose -f docker-compose.dev.yml exec postgres psql -U your_username -d deprem -f /docker-entrypoint-initdb.d/001_init.sql
```

## Production Deploy

### 1. Image Cek

```bash
docker pull registry.keremgok.tr/kandilli-api:latest
```

### 2. Sunucuda Calistir

```bash
# Container'i baslat
docker run -d \
  --name kandilli-api \
  --restart unless-stopped \
  -p 7979:7979 \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASS=pass \
  -e POSTGRES_HOST=db.example.com \
  -e POSTGRES_PORT=5432 \
  -e POSTGRES_DB=deprem \
  registry.keremgok.tr/kandilli-api:latest
```

### 3. Docker Compose ile Deploy

```bash
# .env dosyasini olustur ve duzenle
cp .env.example .env

# Servisleri baslat
docker compose up -d
```

## Healthcheck

API container'i healthcheck iceriyor:

```bash
# Healthcheck durumunu kontrol et
docker inspect --format='{{.State.Health.Status}}' kandilli-api
```

Endpoint: `GET /deprem/status`

## Ortam Degiskenleri

| Degisken | Zorunlu | Varsayilan | Aciklama |
|----------|---------|------------|----------|
| `POSTGRES_USER` | Evet | - | PostgreSQL kullanici adi |
| `POSTGRES_PASS` | Evet | - | PostgreSQL sifre |
| `POSTGRES_HOST` | Evet | - | PostgreSQL host |
| `POSTGRES_PORT` | Hayir | 5432 | PostgreSQL port |
| `POSTGRES_DB` | Evet | - | PostgreSQL veritabani |
| `KANDILLI_URL` | Hayir | koeri.boun.edu.tr/... | Kandilli API URL |
| `AFAD_API` | Hayir | deprem.afad.gov.tr/... | AFAD API URL |
| `CRON_KEY` | Hayir | - | Cron endpoint auth key |
| `STATS_KEY` | Hayir | - | Stats endpoint auth key |
| `BYPASS_IPS` | Hayir | 127.0.0.1 | Rate limit bypass IP'ler |
| `REQUEST_TIMEOUT_MS` | Hayir | 30000 | Request timeout (ms) |

## Sorun Giderme

### Container baslamiyor

```bash
# Loglari kontrol et
docker compose logs api

# Container'a baglan
docker compose exec api sh
```

### PostgreSQL baglanti hatasi

1. `POSTGRES_HOST` degerinin dogru oldugunu kontrol et
2. Harici DB icin: Host makine IP'si veya domain kullan (localhost degil)
3. Dev ortaminda: `postgres` service adini kullan

### Port cakismasi

```bash
# Port kullanimini kontrol et
lsof -i :7979

# Farkli port kullan
docker run -p 8080:7979 ...
```

## Guvenlik Onerileri

1. Production'da `.env` dosyasini commit etme
2. Guclu sifreler kullan
3. Gereksiz portlari disariya acma
4. Docker secrets veya external secret manager kullan
5. Non-root user ile calistir (Dockerfile'da mevcut)
