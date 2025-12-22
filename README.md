# DMaaST Value Chain Digital Twin / DMaaST Değer Zinciri Dijital İkizi

[🇬🇧 English](#english) | [🇹🇷 Türkçe](#türkçe)

---

<a name="english"></a>
# 🇬🇧 English

## 🎯 Project Overview

A comprehensive **Digital Twin** system for value chain simulation based on **DMaaST WP3.3** specifications. This system simulates two industrial workflows (PCB+KAM and JPB) using SimPy Discrete Event Simulation and provides an interactive visualization with React Flow.

### Key Features

- ✅ **Two Value Chain Topologies**: PCB+KAM (PCB production + Warehouse Manufacturing) and JPB (Assembly line)
- ✅ **Graph-Based Simulation**: Flexible topology engine supporting complex workflows
- ✅ **Interactive Process Map**: Click nodes to see detailed information
- ✅ **Multi-Language Support**: Turkish and English interface
- ✅ **Docker Support**: One-command deployment
- ✅ **Real-Time Analytics**: Bottleneck detection, utilization tracking, OEE metrics
- ✅ **Scenario Comparison**: Save and compare multiple simulation runs

## 🏗️ Architecture

Following **DMaaST** (Digital Manufacturing as a Service Transformation) principles:

- **Simulation Service** (Backend): Graph-based SimPy engine with configurable topologies
- **Digital Twin UI** (Frontend): React-based visualization with React Flow
- **API Layer**: RESTful FastAPI backend

### Value Chain Topologies

#### PCB + KAM Workflow
```
Suppliers → Ext Logistics S→W → [70% PCB Line | 30% WM Direct] → WM Warehouse → WM Production → Customers
```

#### JPB Workflow
```
[Spring Supplier | RM Supplier 1 | RM Supplier 2] → Logistics → Inventories → JPB Production → QA → [90% Pass | 10% Reject Loop] → Customers
```

## 📁 Project Structure

```
dmaast_demo/
├── backend/                    # FastAPI + SimPy backend
│   ├── main.py                # FastAPI application
│   ├── simulation_engine.py   # Graph-based DES engine
│   ├── analysis_engine.py    # Rule-based insights
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ProcessMap.tsx      # Topology visualization
│   │   │   ├── SimulationControls.tsx
│   │   │   ├── InfoPanel.tsx      # Node details panel
│   │   │   ├── MetricsPanel.tsx
│   │   │   ├── Charts.tsx
│   │   │   ├── InsightsPanel.tsx
│   │   │   └── nodes/         # Custom React Flow nodes
│   │   ├── data/
│   │   │   └── translations.ts # Multi-language content
│   │   ├── store/             # Zustand state management
│   │   └── lib/               # Utilities & API client
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml         # Docker orchestration
├── Makefile                   # Convenience commands
└── README.md
```

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Build and start all containers
docker-compose up -d --build

# Or use the convenience script
./docker-start.sh
```

**Access URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

**Stop containers:**
```bash
docker-compose down
# Or
./docker-stop.sh
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend API: `http://localhost:8000`  
API Docs: `http://localhost:8000/docs`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## 🎨 Features

### Backend (FastAPI + SimPy)

- **Graph-Based DES Engine**: 
  - Configurable topologies (PCB+KAM, JPB)
  - Node processors with MTBF/MTTR support
  - Probabilistic splits and merge points
  - Feedback loops (e.g., QA rejection)
  
- **API Endpoints**:
  - `POST /simulate` - Run simulation
  - `GET /topologies` - List available topologies
  - `GET /health` - Health check

- **Default Parameters**: Every node defaults to:
  - Processing time: 10 minutes
  - Capacity: 100 units
  - MTBF: 500 minutes
  - MTTR: 30 minutes

### Frontend (React + React Flow)

- **Interactive Process Map**:
  - Wide, readable layout (280px horizontal gap, 180px vertical gap)
  - Click nodes to open InfoPanel with translations
  - Live utilization and availability metrics
  - Bottleneck detection (red pulsing when > 85%)
  - Color-coded by node type (logistics, production, quality, etc.)

- **InfoPanel**:
  - Node descriptions in Turkish/English
  - Code explanations (e.g., "S2W" → "Supplier → Warehouse")
  - Live status from simulation results
  - Status badges (Bottleneck, Broken, Normal)

- **Analytics Dashboard**:
  - Bottleneck evolution chart (queue lengths over time)
  - Equipment effectiveness chart (OEE components)
  - Insights panel with rule-based recommendations

- **Multi-Language Support**:
  - Toggle between Turkish and English
  - All UI elements translated
  - Node descriptions from translation data

## 📊 Simulation Parameters

- **Topology Type**: `"pcb_kam"` or `"jpb"`
- **Arrival Rate**: Material arrival rate (parts per minute)
- **Simulation Duration**: Total simulation time (minutes)
- **Node Overrides** (optional): Custom parameters for specific nodes:
  ```json
  {
    "node_id": {
      "processing_time": 15.0,
      "capacity": 150,
      "mtbf": 600.0,
      "mttr": 25.0
    }
  }
  ```

## 📈 Metrics Returned

- **Throughput**: Parts completed per hour
- **Average Lead Time**: Average time from arrival to completion
- **Resource Utilization**: Percentage utilization per node
- **Node Status**: Per-node metrics including:
  - Utilization percentage
  - Availability percentage
  - Efficiency (OEE-like metric)
  - Processed count
  - Queue length
  - Bottleneck status
  - Breakdown status

## 🛠️ Tech Stack

### Backend
- Python 3.13
- FastAPI
- SimPy 4.1+
- Pydantic

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Flow 11
- Recharts
- Zustand
- Lucide React
- Nginx (production)

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Nginx reverse proxy

## 📝 API Example

```bash
curl -X POST "http://localhost:8000/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "topology_type": "pcb_kam",
    "arrival_rate": 0.1,
    "simulation_duration": 480.0,
    "node_overrides": {
      "pcb_production": {
        "processing_time": 12.0,
        "capacity": 100,
        "mtbf": 500.0,
        "mttr": 30.0
      }
    }
  }'
```

## 🎯 Use Cases

1. **Value Chain Analysis**: Understand flow through complex supply chains
2. **Bottleneck Identification**: Visualize and analyze bottlenecks in real-time
3. **Capacity Planning**: Test different buffer sizes and processing capacities
4. **Maintenance Strategy**: Analyze impact of MTBF/MTTR on throughput
5. **Scenario Comparison**: Compare "as-is" vs "to-be" scenarios
6. **Multi-Language Documentation**: Share insights with international teams

## 🔧 Development

### Docker Commands

```bash
# Build and start
make up-build

# View logs
make logs

# Stop
make down

# Clean everything
make clean
```

### Local Development

The system is designed with separation of concerns:
- Backend handles all simulation logic
- Frontend handles all visualization
- Communication via REST API
- State management with Zustand
- Translations in `src/data/translations.ts`

## 📄 License

MIT

---

<a name="türkçe"></a>
# 🇹🇷 Türkçe

## 🎯 Proje Özeti

**DMaaST WP3.3** spesifikasyonlarına dayalı değer zinciri simülasyonu için kapsamlı bir **Dijital İkiz** sistemi. Bu sistem, SimPy Ayrık Olay Simülasyonu kullanarak iki endüstriyel iş akışını (PCB+KAM ve JPB) simüle eder ve React Flow ile interaktif bir görselleştirme sunar.

### Temel Özellikler

- ✅ **İki Değer Zinciri Topolojisi**: PCB+KAM (PCB üretimi + Warehouse Manufacturing) ve JPB (Montaj hattı)
- ✅ **Graf Tabanlı Simülasyon**: Karmaşık iş akışlarını destekleyen esnek topoloji motoru
- ✅ **İnteraktif Süreç Haritası**: Düğümlere tıklayarak detaylı bilgi görüntüleme
- ✅ **Çoklu Dil Desteği**: Türkçe ve İngilizce arayüz
- ✅ **Docker Desteği**: Tek komutla kurulum
- ✅ **Gerçek Zamanlı Analitik**: Darboğaz tespiti, kullanım takibi, OEE metrikleri
- ✅ **Senaryo Karşılaştırma**: Birden fazla simülasyon çalıştırmasını kaydetme ve karşılaştırma

## 🏗️ Mimari

**DMaaST** (Digital Manufacturing as a Service Transformation) prensiplerine uygun:

- **Simülasyon Servisi** (Backend): Yapılandırılabilir topolojilerle graf tabanlı SimPy motoru
- **Dijital İkiz Arayüzü** (Frontend): React Flow ile React tabanlı görselleştirme
- **API Katmanı**: RESTful FastAPI backend

### Değer Zinciri Topolojileri

#### PCB + KAM İş Akışı
```
Tedarikçiler → Dış Lojistik S→W → [%70 PCB Hattı | %30 Direkt WM] → WM Deposu → WM Üretim → Müşteriler
```

#### JPB İş Akışı
```
[Spring Tedarikçi | RM Tedarikçi 1 | RM Tedarikçi 2] → Lojistik → Stoklar → JPB Üretim → QA → [%90 Geçti | %10 Ret Döngüsü] → Müşteriler
```

## 📁 Proje Yapısı

```
dmaast_demo/
├── backend/                    # FastAPI + SimPy backend
│   ├── main.py                # FastAPI uygulaması
│   ├── simulation_engine.py   # Graf tabanlı DES motoru
│   ├── analysis_engine.py    # Kural tabanlı içgörüler
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/        # React bileşenleri
│   │   │   ├── ProcessMap.tsx      # Topoloji görselleştirme
│   │   │   ├── SimulationControls.tsx
│   │   │   ├── InfoPanel.tsx      # Düğüm detay paneli
│   │   │   ├── MetricsPanel.tsx
│   │   │   ├── Charts.tsx
│   │   │   ├── InsightsPanel.tsx
│   │   │   └── nodes/         # Özel React Flow düğümleri
│   │   ├── data/
│   │   │   └── translations.ts # Çoklu dil içeriği
│   │   ├── store/             # Zustand state yönetimi
│   │   └── lib/               # Yardımcılar & API istemcisi
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml         # Docker orkestrasyonu
├── Makefile                   # Kolaylık komutları
└── README.md
```

## 🚀 Hızlı Başlangıç

### Seçenek 1: Docker (Önerilen)

```bash
# Tüm konteynerleri build et ve başlat
docker-compose up -d --build

# Veya kolaylık scriptini kullan
./docker-start.sh
```

**Erişim URL'leri:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Dokümantasyonu: http://localhost:8000/docs

**Konteynerleri durdur:**
```bash
docker-compose down
# Veya
./docker-stop.sh
```

### Seçenek 2: Yerel Geliştirme

#### Backend Kurulumu

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows'ta: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend API: `http://localhost:8000`  
API Dokümantasyonu: `http://localhost:8000/docs`

#### Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## 🎨 Özellikler

### Backend (FastAPI + SimPy)

- **Graf Tabanlı DES Motoru**: 
  - Yapılandırılabilir topolojiler (PCB+KAM, JPB)
  - MTBF/MTTR desteği ile düğüm işlemcileri
  - Olasılıksal dallanmalar ve birleşme noktaları
  - Geri besleme döngüleri (örn. QA ret)
  
- **API Endpoint'leri**:
  - `POST /simulate` - Simülasyon çalıştır
  - `GET /topologies` - Mevcut topolojileri listele
  - `GET /health` - Sağlık kontrolü

- **Varsayılan Parametreler**: Her düğüm için varsayılanlar:
  - İşlem süresi: 10 dakika
  - Kapasite: 100 birim
  - MTBF: 500 dakika
  - MTTR: 30 dakika

### Frontend (React + React Flow)

- **İnteraktif Süreç Haritası**:
  - Geniş, okunabilir düzen (280px yatay boşluk, 180px dikey boşluk)
  - Düğümlere tıklayarak çevirilerle InfoPanel açma
  - Canlı kullanım ve kullanılabilirlik metrikleri
  - Darboğaz tespiti (%85'ten fazla kullanımda kırmızı titreşim)
  - Düğüm tipine göre renk kodlama (lojistik, üretim, kalite, vb.)

- **InfoPanel**:
  - Türkçe/İngilizce düğüm açıklamaları
  - Kod açıklamaları (örn. "S2W" → "Tedarikçi → Depo")
  - Simülasyon sonuçlarından canlı durum
  - Durum rozetleri (Darboğaz, Arızalı, Normal)

- **Analitik Paneli**:
  - Darboğaz gelişim grafiği (zaman içinde kuyruk uzunlukları)
  - Ekipman etkinliği grafiği (OEE bileşenleri)
  - Kural tabanlı önerilerle içgörüler paneli

- **Çoklu Dil Desteği**:
  - Türkçe ve İngilizce arasında geçiş
  - Tüm arayüz öğeleri çevrilmiş
  - Çeviri verilerinden düğüm açıklamaları

## 📊 Simülasyon Parametreleri

- **Topoloji Tipi**: `"pcb_kam"` veya `"jpb"`
- **Geliş Hızı**: Malzeme geliş hızı (dakikada parça)
- **Simülasyon Süresi**: Toplam simülasyon süresi (dakika)
- **Düğüm Geçersiz Kılmaları** (opsiyonel): Belirli düğümler için özel parametreler:
  ```json
  {
    "node_id": {
      "processing_time": 15.0,
      "capacity": 150,
      "mtbf": 600.0,
      "mttr": 25.0
    }
  }
  ```

## 📈 Döndürülen Metrikler

- **Verimlilik**: Saatte tamamlanan parça sayısı
- **Ortalama Teslim Süresi**: Gelişten tamamlanmaya kadar geçen ortalama süre
- **Kaynak Kullanımı**: Düğüm başına yüzde kullanım
- **Düğüm Durumu**: Düğüm başına metrikler:
  - Kullanım yüzdesi
  - Kullanılabilirlik yüzdesi
  - Verimlilik (OEE benzeri metrik)
  - İşlenen sayı
  - Kuyruk uzunluğu
  - Darboğaz durumu
  - Arıza durumu

## 🛠️ Teknoloji Yığını

### Backend
- Python 3.13
- FastAPI
- SimPy 4.1+
- Pydantic

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Flow 11
- Recharts
- Zustand
- Lucide React
- Nginx (production)

### DevOps
- Docker & Docker Compose
- Çok aşamalı build'ler
- Nginx reverse proxy

## 📝 API Örneği

```bash
curl -X POST "http://localhost:8000/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "topology_type": "pcb_kam",
    "arrival_rate": 0.1,
    "simulation_duration": 480.0,
    "node_overrides": {
      "pcb_production": {
        "processing_time": 12.0,
        "capacity": 100,
        "mtbf": 500.0,
        "mttr": 30.0
      }
    }
  }'
```

## 🎯 Kullanım Alanları

1. **Değer Zinciri Analizi**: Karmaşık tedarik zincirlerindeki akışı anlama
2. **Darboğaz Belirleme**: Gerçek zamanlı darboğazları görselleştirme ve analiz etme
3. **Kapasite Planlama**: Farklı tampon boyutlarını ve işlem kapasitelerini test etme
4. **Bakım Stratejisi**: MTBF/MTTR'nin verimliliğe etkisini analiz etme
5. **Senaryo Karşılaştırma**: "Mevcut durum" vs "Hedef durum" senaryolarını karşılaştırma
6. **Çoklu Dil Dokümantasyonu**: Uluslararası ekiplerle içgörüleri paylaşma

## 🔧 Geliştirme

### Docker Komutları

```bash
# Build ve başlat
make up-build

# Logları görüntüle
make logs

# Durdur
make down

# Her şeyi temizle
make clean
```

### Yerel Geliştirme

Sistem, endişelerin ayrılması prensibiyle tasarlanmıştır:
- Backend tüm simülasyon mantığını yönetir
- Frontend tüm görselleştirmeyi yönetir
- REST API üzerinden iletişim
- Zustand ile state yönetimi
- Çeviriler `src/data/translations.ts` içinde

## 📄 Lisans

MIT

---

## 🤝 Katkıda Bulunma

Proje DMaaST WP3.3 kapsamında geliştirilmiştir. Sorularınız veya önerileriniz için lütfen issue açın.

## 📞 İletişim

DMaaST Project - Value Chain Digital Twin Development
