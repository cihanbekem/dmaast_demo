# Backend Technical Report - DMaaST Value Chain Digital Twin
# Backend Teknik Raporu - DMaaST Değer Zinciri Dijital İkizi

[🇬🇧 English](#english-backend) | [🇹🇷 Türkçe](#türkçe-backend)

---

<a name="english-backend"></a>
# 🇬🇧 Backend Technical Report

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [File Structure & Responsibilities](#file-structure)
3. [Simulation Engine Deep Dive](#simulation-engine)
4. [API Layer Analysis](#api-layer)
5. [Data Flow & Processing](#data-flow)
6. [Algorithm Details](#algorithms)
7. [Error Handling & Edge Cases](#error-handling)
8. [Performance Considerations](#performance)

---

## Architecture Overview

The backend is built using **FastAPI** (Python web framework) and **SimPy** (Discrete Event Simulation library). It follows a **modular architecture** where simulation logic is completely separated from API concerns.

### Core Components

```
Backend Architecture
├── API Layer (main.py)
│   ├── Request/Response Models (Pydantic)
│   ├── Endpoint Handlers
│   └── Error Handling
│
├── Simulation Engine (simulation_engine.py)
│   ├── Topology Definitions
│   ├── Node Processor Class
│   ├── Graph-Based Simulation
│   └── Statistics Collection
│
└── Analysis Engine (analysis_engine.py)
    ├── Rule-Based Analysis
    └── Insight Generation
```

### Design Principles

1. **Separation of Concerns**: API, simulation, and analysis are separate modules
2. **Graph-Based Topology**: Flexible topology system supporting any workflow
3. **Default Parameters**: Sensible defaults for all nodes (no configuration required)
4. **Extensibility**: Easy to add new topologies or node types

---

## File Structure & Responsibilities

### 1. `main.py` - FastAPI Application

**Purpose**: HTTP API server that handles simulation requests and serves results.

#### Key Components

**a) FastAPI App Initialization**
```python
app = FastAPI(
    title="DMaaST Value Chain Digital Twin API",
    version="2.0.0",
    description="Graph-based simulation for PCB+KAM and JPB value chains"
)
```
- Creates the FastAPI application instance
- Sets metadata for API documentation (Swagger UI)

**b) CORS Middleware**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
- Enables Cross-Origin Resource Sharing
- Allows frontend (React) to call backend API
- Configured for development (localhost) and production

**c) Pydantic Models**

**`SimulationParameters`**:
```python
class SimulationParameters(BaseModel):
    topology_type: Literal["pcb_kam", "jpb"]
    node_overrides: Optional[Dict[str, Dict[str, Any]]]
    arrival_rate: float = 0.1
    simulation_duration: float = 480.0
```
- **topology_type**: Which workflow to simulate (PCB+KAM or JPB)
- **node_overrides**: Optional custom parameters for specific nodes
- **arrival_rate**: Material arrival rate (parts per minute)
- **simulation_duration**: How long to run simulation (minutes)

**`SimulationResponse`**:
```python
class SimulationResponse(BaseModel):
    metrics: Dict[str, Any]
    time_series: List[Dict[str, Any]]
    node_status: Dict[str, Dict[str, Any]]
    topology: Dict[str, Any]
    insights: List[Dict[str, Any]]
    simulation_id: str
    timestamp: str
```
- Complete response structure returned to frontend
- Includes metrics, time series data, node statuses, topology info, and insights

**d) API Endpoints**

**`GET /`** - Root endpoint
- Returns API metadata and available topologies

**`GET /topologies`** - List topologies
- Returns detailed information about PCB+KAM and JPB workflows
- Includes node lists and descriptions

**`POST /simulate`** - Main simulation endpoint
```python
async def simulate(parameters: SimulationParameters):
    sim = ValueChainSimulation(
        topology_type=parameters.topology_type,
        node_overrides=parameters.node_overrides,
        arrival_rate=parameters.arrival_rate,
        simulation_duration=parameters.simulation_duration,
    )
    results = sim.run()
    insights = analyze_simulation_results(results)
    return SimulationResponse(...)
```
- Creates simulation instance
- Runs simulation
- Analyzes results
- Returns formatted response

**`GET /health`** - Health check
- Simple endpoint for monitoring/load balancers

---

### 2. `simulation_engine.py` - Core Simulation Logic

**Purpose**: Graph-based discrete event simulation engine for value chains.

#### Topology Definitions

**PCB_KAM Topology**:
```python
PCB_KAM_NODES = [
    "suppliers", "ext_logistics_s2w", "pcb_sqa", "pcb_warehouse",
    "int_log_w2pcb", "pcb_production", "int_log_pcb2wm", "wm_sqa",
    "wm_warehouse", "int_log_w2wm", "wm_production", 
    "ext_logistics_out", "customers"
]
```
- 13 nodes representing the complete PCB+KAM workflow
- Nodes are defined as strings (IDs)

**PCB_KAM Edges**:
```python
PCB_KAM_EDGES = [
    ("suppliers", "ext_logistics_s2w"),
    ("ext_logistics_s2w", "pcb_sqa"),  # 70% path
    ("ext_logistics_s2w", "wm_sqa"),   # 30% path
    ...
]
```
- Directed edges defining flow direction
- Each tuple represents (source, destination)

**Split Nodes**:
```python
"split_nodes": {
    "ext_logistics_s2w": [("pcb_sqa", 0.7), ("wm_sqa", 0.3)]
}
```
- Defines probabilistic splits
- 70% goes to PCB line, 30% goes directly to WM

**JPB Topology**:
- 18 nodes including 3 suppliers (Spring, RM1, RM2)
- Complex merge points (LH Building Inv, JPB Production)
- Feedback loop: QA → Material Inventory (10% rejection)

#### NodeProcessor Class

**Purpose**: Represents a single processing node in the value chain.

**Initialization**:
```python
def __init__(
    self,
    env: simpy.Environment,
    node_id: str,
    processing_time: float = 10.0,
    capacity: int = 100,
    mtbf: float = 500.0,
    mttr: float = 30.0,
):
```
- **env**: SimPy environment (simulation clock)
- **node_id**: Unique identifier
- **processing_time**: Mean processing time (minutes)
- **capacity**: Buffer capacity
- **mtbf**: Mean Time Between Failures (minutes)
- **mttr**: Mean Time To Repair (minutes)

**Key Attributes**:
- `resource`: SimPy Resource (handles concurrency)
- `buffer`: SimPy Store (handles queuing)
- `is_broken`: Boolean flag for breakdown state
- `total_downtime`: Accumulated downtime
- `processed_count`: Number of parts processed
- `utilization_time`: Total time spent processing

**Breakdown Process** (`_breakdown_process`):
```python
def _breakdown_process(self):
    while True:
        time_to_failure = random.expovariate(1.0 / max(self.mtbf, 1.0))
        yield self.env.timeout(time_to_failure)
        
        if not self.is_broken:
            self.is_broken = True
            repair_time = random.expovariate(1.0 / max(self.mttr, 1.0))
            yield self.env.timeout(repair_time)
            self.is_broken = False
            self.total_downtime += repair_time
```
- **Exponential Distribution**: Time between failures follows exponential distribution
- **Continuous Process**: Runs throughout simulation
- **State Management**: Tracks broken/operational state
- **Repair Time**: Also exponential distribution

**Processing Method** (`process`):
```python
def process(self, part: Dict[str, Any]) -> Any:
    start_time = self.env.now
    
    with self.resource.request() as req:
        yield req  # Wait for resource availability
        
        while self.is_broken:
            yield self.env.timeout(0.5)  # Wait if broken
        
        actual_time = max(0.1, random.normalvariate(
            self.processing_time,
            self.processing_time * 0.1
        ))
        yield self.env.timeout(actual_time)
        
        self.utilization_time += actual_time
        self.processed_count += 1
    
    return part
```
- **Resource Locking**: Uses SimPy Resource to handle concurrency
- **Breakdown Handling**: Waits if machine is broken
- **Normal Distribution**: Processing time varies around mean (±10%)
- **Statistics**: Tracks utilization and count

**Metrics Calculation**:
- **Utilization**: `(utilization_time / total_time) * 100`
- **Availability**: `((total_time - downtime) / total_time) * 100`
- **Efficiency**: `(availability / 100) * (utilization / 100) * 100` (OEE-like)

#### ValueChainSimulation Class

**Purpose**: Main simulation orchestrator that manages the entire graph.

**Initialization**:
```python
def __init__(
    self,
    topology_type: str = "pcb_kam",
    node_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
    arrival_rate: float = 0.1,
    simulation_duration: float = 480.0,
):
```

**Step-by-Step Setup**:

1. **Load Topology Config**:
   ```python
   self.config = TOPOLOGY_CONFIGS[self.topology_type]
   self.node_ids = self.config["nodes"]
   self.edges = self.config["edges"]
   ```

2. **Build Adjacency List**:
   ```python
   self.adjacency: Dict[str, List[str]] = defaultdict(list)
   for src, dst in self.edges:
       self.adjacency[src].append(dst)
   ```
   - Creates graph structure for traversal
   - Example: `{"suppliers": ["ext_logistics_s2w"]}`

3. **Create Node Processors**:
   ```python
   for node_id in self.node_ids:
       cfg = overrides.get(node_id, {})
       self.nodes[node_id] = NodeProcessor(
           self.env, node_id,
           processing_time=cfg.get("processing_time", 10.0),
           capacity=cfg.get("capacity", 100),
           mtbf=cfg.get("mtbf", 500.0),
           mttr=cfg.get("mttr", 30.0),
       )
   ```
   - Creates processor for each node
   - Applies overrides if provided
   - Uses defaults otherwise

4. **Start Processes**:
   ```python
   for source in self.sources:
       self.env.process(self._material_arrival(source))
   self.env.process(self._collect_time_series())
   ```

**Material Arrival Process** (`_material_arrival`):
```python
def _material_arrival(self, source_node: str):
    part_id = 0
    while True:
        inter_arrival = random.expovariate(self.arrival_rate)
        yield self.env.timeout(inter_arrival)
        
        part_id += 1
        self.parts_started += 1
        
        part = {
            "part_id": f"{source_node}_{part_id}",
            "arrival_time": self.env.now,
            "source": source_node,
            "path": [source_node],
        }
        
        self.env.process(self._process_part(part, source_node))
```
- **Exponential Inter-Arrival**: Time between arrivals follows exponential distribution
- **Part Creation**: Creates part dictionary with metadata
- **Path Tracking**: Tracks which nodes the part visits
- **Continuous Generation**: Runs throughout simulation

**Part Processing** (`_process_part`):
```python
def _process_part(self, part: Dict[str, Any], current_node: str):
    # Process at current node
    processor = self.nodes[current_node]
    yield self.env.process(processor.process(part))
    part["path"].append(current_node)
    
    # Check if sink reached
    if current_node in self.sinks:
        lead_time = self.env.now - part["arrival_time"]
        self.lead_times.append(lead_time)
        self.parts_completed += 1
        return
    
    # Get next node
    next_node = self._get_next_node(current_node)
    if next_node:
        self.env.process(self._process_part(part, next_node))
```
- **Recursive Processing**: Each part flows through graph recursively
- **Node Processing**: Calls processor.process() for current node
- **Path Tracking**: Adds current node to part's path
- **Completion Check**: If sink reached, calculate lead time
- **Continue Flow**: Recursively process next node

**Next Node Selection** (`_get_next_node`):
```python
def _get_next_node(self, current_node: str) -> Optional[str]:
    next_nodes = self.adjacency.get(current_node, [])
    
    if not next_nodes:
        return None
    
    # Check if split node
    if current_node in self.split_nodes:
        splits = self.split_nodes[current_node]
        r = random.random()
        cumulative = 0.0
        for (target, prob) in splits:
            cumulative += prob
            if r <= cumulative:
                return target
        return splits[-1][0]
    
    # Default: first next node
    return next_nodes[0]
```
- **Split Handling**: Uses cumulative probability for splits
- **Random Selection**: Uses random.random() for probabilistic routing
- **Default Behavior**: Takes first available next node

**Time Series Collection** (`_collect_time_series`):
```python
def _collect_time_series(self):
    while True:
        yield self.env.timeout(self.collection_interval)  # Every 5 minutes
        
        snapshot = {
            "time": self.env.now,
            "queue_lengths": {},
            "utilizations": {},
            "throughput": self.parts_completed / max(self.env.now, 1) * 60,
        }
        
        for node_id, processor in self.nodes.items():
            snapshot["queue_lengths"][node_id] = processor.get_queue_length()
            snapshot["utilizations"][node_id] = processor.get_utilization(self.env.now)
        
        self.time_series_data.append(snapshot)
```
- **Periodic Snapshot**: Collects data every 5 minutes
- **Queue Lengths**: Current queue length per node
- **Utilizations**: Current utilization per node
- **Throughput**: Parts per hour calculation

**Run Method**:
```python
def run(self) -> Dict[str, Any]:
    self.env.run(until=self.simulation_duration)
    
    # Calculate final metrics
    total_time = max(self.simulation_duration, 0.1)
    throughput = self.parts_completed / (total_time / 60.0)
    avg_lead_time = sum(self.lead_times) / len(self.lead_times) if self.lead_times else 0.0
    
    # Build node status
    node_status = {}
    for node_id, processor in self.nodes.items():
        utilization = processor.get_utilization(total_time)
        availability = processor.get_availability(total_time)
        efficiency = (availability / 100.0) * (utilization / 100.0) * 100.0
        
        node_status[node_id] = {
            "type": self._determine_node_type(node_id),
            "utilization": round(utilization, 2),
            "availability": round(availability, 2),
            "efficiency": round(efficiency, 2),
            "processed_count": processor.processed_count,
            "queue_length": processor.get_queue_length(),
            "is_bottleneck": utilization > 85.0,
            "is_broken": processor.is_broken,
        }
    
    return {
        "metrics": {...},
        "time_series": [...],
        "node_status": {...},
        "topology": {...}
    }
```
- **Simulation Execution**: Runs SimPy until duration reached
- **Final Calculations**: Computes all final metrics
- **Node Status**: Builds complete status for each node
- **Return Structure**: Returns formatted results

---

### 3. `analysis_engine.py` - Rule-Based Analysis

**Purpose**: Analyzes simulation results and generates actionable insights.

#### Insight Types

```python
class InsightType(str, Enum):
    WARNING = "warning"      # Red - Critical issues
    INFO = "info"            # Blue - Information
    SUCCESS = "success"      # Green - Good status
    SUGGESTION = "suggestion"  # Yellow - Recommendations
```

#### Analysis Rules

**Rule 1: Bottleneck Detection**
```python
for node_id, status in node_status.items():
    utilization = status.get("utilization", 0)
    if utilization > 85:
        bottlenecks.append((node_id, utilization))
```
- Flags nodes with >85% utilization
- High severity warning

**Rule 2: Underutilized Resources**
```python
if utilization < 20 and node_type in ["production", "process", "quality"]:
    underutilized.append((node_id, utilization))
```
- Identifies wasted capacity
- Low severity suggestion

**Rule 3: Lead Time Analysis**
```python
if avg_lead_time > 300:  # 5+ hours
    insights.append(WARNING: "High Lead Time")
```
- Flags excessive lead times
- Medium-high severity

**Rule 4: Completion Rate**
```python
completion_rate = (parts_completed / parts_started) * 100
if completion_rate < 50:
    insights.append(WARNING: "Low Completion Rate")
```
- Checks if simulation ran long enough
- High severity if <50%

**Rule 5: Broken Nodes**
```python
if status.get("is_broken", False):
    broken_nodes.append(node_id)
```
- Identifies currently broken nodes
- High severity warning

**Rule 6: Low Availability**
```python
if availability < 80 and node_type in ["production", "process", "quality"]:
    low_availability.append((node_id, availability))
```
- Flags maintenance issues
- High severity

**Rule 7: Overall Performance**
```python
if not bottlenecks and not broken_nodes and avg_lead_time < 180:
    insights.append(SUCCESS: "Good Performance")
```
- Positive feedback when all good
- Low severity

**Rule 8: Throughput Analysis**
```python
if throughput < 1 and parts_started > 10:
    insights.append(WARNING: "Very Low Throughput")
```
- Critical issue detection
- Critical severity

#### Insight Sorting

```python
severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
insights.sort(key=lambda x: severity_order.get(x.get("severity", "medium"), 2))
```
- Sorts by severity (critical first)
- Ensures most important insights appear first

---

## Data Flow & Processing

### Request Flow

```
1. Frontend sends POST /simulate
   ↓
2. FastAPI validates request (Pydantic)
   ↓
3. ValueChainSimulation created
   ↓
4. Simulation runs (SimPy)
   ↓
5. Results collected
   ↓
6. Analysis engine processes results
   ↓
7. Response formatted (Pydantic)
   ↓
8. JSON response sent to frontend
```

### Simulation Flow

```
1. Initialize SimPy Environment
   ↓
2. Create all NodeProcessors
   ↓
3. Start material arrival processes
   ↓
4. Start time series collection
   ↓
5. Parts flow through graph:
   - Arrive at source
   - Process at each node
   - Follow edges to next node
   - Complete at sink
   ↓
6. Simulation runs until duration
   ↓
7. Final metrics calculated
   ↓
8. Results returned
```

### Part Lifecycle

```
Part Created (source)
  ↓
Process at Node 1
  ↓
Wait for resource
  ↓
Process (with breakdown handling)
  ↓
Move to next node
  ↓
... (repeat for each node)
  ↓
Complete at sink
  ↓
Lead time calculated
```

---

## Algorithm Details

### Exponential Distribution

**Time Between Failures**:
```python
time_to_failure = random.expovariate(1.0 / mtbf)
```
- **MTBF = 500**: Mean time between failures is 500 minutes
- **Lambda = 1/500**: Rate parameter
- **Exponential**: Models time until next event

**Inter-Arrival Time**:
```python
inter_arrival = random.expovariate(arrival_rate)
```
- **arrival_rate = 0.1**: 0.1 parts per minute
- **Mean inter-arrival = 10 minutes**: 1 / 0.1

### Normal Distribution

**Processing Time**:
```python
actual_time = random.normalvariate(
    mean=processing_time,
    stddev=processing_time * 0.1
)
```
- **Mean**: Specified processing time
- **Std Dev**: 10% of mean (realistic variability)
- **Min**: Clamped to 0.1 (prevents negative/zero)

### Probabilistic Routing

**Split Node Selection**:
```python
r = random.random()  # 0.0 to 1.0
cumulative = 0.0
for (target, prob) in splits:
    cumulative += prob
    if r <= cumulative:
        return target
```
- **Cumulative Probability**: Builds cumulative distribution
- **Random Selection**: Uses uniform random number
- **Example**: 70% PCB, 30% WM → r=0.65 → PCB selected

### Graph Traversal

**Depth-First Processing**:
- Each part recursively processes through graph
- Path tracked in part dictionary
- Completes when sink reached

---

## Error Handling & Edge Cases

### Division by Zero Protection

```python
total_time = max(self.simulation_duration, 0.1)  # Avoid division by zero
throughput = self.parts_completed / (total_time / 60.0) if total_time > 0 else 0.0
```

### Empty Results Handling

```python
avg_lead_time = sum(self.lead_times) / len(self.lead_times) if self.lead_times else 0.0
```

### Invalid Topology Handling

```python
if self.topology_type not in TOPOLOGY_CONFIGS:
    self.topology_type = "pcb_kam"  # Default fallback
```

### Breakdown State Management

```python
if not self.is_broken:  # Only break if currently operational
    self.is_broken = True
```

### Resource Locking

```python
with self.resource.request() as req:
    yield req  # Ensures proper cleanup even on exception
```

---

## Performance Considerations

### Simulation Speed

- **Discrete Event**: Only processes events (not continuous time steps)
- **Efficient**: SimPy is optimized for DES
- **Scalability**: Handles 1000s of parts efficiently

### Memory Management

- **Time Series**: Collected at intervals (not every event)
- **Part Objects**: Lightweight dictionaries
- **Statistics**: Accumulated, not stored per event

### Concurrency

- **SimPy Resources**: Handle concurrent processing
- **Multiple Parts**: Can process simultaneously
- **No Threading**: SimPy uses coroutines (single-threaded)

### Default Parameters

- **Sensible Defaults**: No configuration required
- **Override Support**: Custom parameters when needed
- **Validation**: Pydantic ensures type safety

---

<a name="türkçe-backend"></a>
# 🇹🇷 Backend Teknik Raporu

## İçindekiler
1. [Mimari Genel Bakış](#mimari-genel-bakış)
2. [Dosya Yapısı ve Sorumluluklar](#dosya-yapısı)
3. [Simülasyon Motoru Derinlemesine](#simülasyon-motoru)
4. [API Katmanı Analizi](#api-katmanı)
5. [Veri Akışı ve İşleme](#veri-akışı)
6. [Algoritma Detayları](#algoritmalar)
7. [Hata Yönetimi ve Edge Case'ler](#hata-yönetimi)
8. [Performans Değerlendirmeleri](#performans)

---

## Mimari Genel Bakış

Backend, **FastAPI** (Python web framework) ve **SimPy** (Ayrık Olay Simülasyonu kütüphanesi) kullanılarak oluşturulmuştur. Simülasyon mantığının API endişelerinden tamamen ayrıldığı **modüler bir mimari** izler.

### Temel Bileşenler

```
Backend Mimarisi
├── API Katmanı (main.py)
│   ├── İstek/Yanıt Modelleri (Pydantic)
│   ├── Endpoint Handler'ları
│   └── Hata Yönetimi
│
├── Simülasyon Motoru (simulation_engine.py)
│   ├── Topoloji Tanımları
│   ├── Düğüm İşlemci Sınıfı
│   ├── Graf Tabanlı Simülasyon
│   └── İstatistik Toplama
│
└── Analiz Motoru (analysis_engine.py)
    ├── Kural Tabanlı Analiz
    └── İçgörü Üretimi
```

### Tasarım Prensipleri

1. **Endişelerin Ayrılması**: API, simülasyon ve analiz ayrı modüller
2. **Graf Tabanlı Topoloji**: Herhangi bir iş akışını destekleyen esnek topoloji sistemi
3. **Varsayılan Parametreler**: Tüm düğümler için makul varsayılanlar (yapılandırma gerekmez)
4. **Genişletilebilirlik**: Yeni topolojiler veya düğüm tipleri eklemek kolay

---

## Dosya Yapısı ve Sorumluluklar

### 1. `main.py` - FastAPI Uygulaması

**Amaç**: Simülasyon isteklerini işleyen ve sonuçları sunan HTTP API sunucusu.

#### Temel Bileşenler

**a) FastAPI Uygulama Başlatma**
```python
app = FastAPI(
    title="DMaaST Value Chain Digital Twin API",
    version="2.0.0",
    description="Graph-based simulation for PCB+KAM and JPB value chains"
)
```
- FastAPI uygulama örneğini oluşturur
- API dokümantasyonu için metadata ayarlar (Swagger UI)

**b) CORS Middleware**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```
- Cross-Origin Resource Sharing'i etkinleştirir
- Frontend'in (React) backend API'sini çağırmasına izin verir
- Geliştirme (localhost) ve production için yapılandırılmış

**c) Pydantic Modelleri**

**`SimulationParameters`**:
```python
class SimulationParameters(BaseModel):
    topology_type: Literal["pcb_kam", "jpb"]
    node_overrides: Optional[Dict[str, Dict[str, Any]]]
    arrival_rate: float = 0.1
    simulation_duration: float = 480.0
```
- **topology_type**: Hangi iş akışının simüle edileceği (PCB+KAM veya JPB)
- **node_overrides**: Belirli düğümler için opsiyonel özel parametreler
- **arrival_rate**: Malzeme geliş hızı (dakikada parça)
- **simulation_duration**: Simülasyonun ne kadar süre çalışacağı (dakika)

**`SimulationResponse`**:
```python
class SimulationResponse(BaseModel):
    metrics: Dict[str, Any]
    time_series: List[Dict[str, Any]]
    node_status: Dict[str, Dict[str, Any]]
    topology: Dict[str, Any]
    insights: List[Dict[str, Any]]
    simulation_id: str
    timestamp: str
```
- Frontend'e döndürülen tam yanıt yapısı
- Metrikler, zaman serisi verileri, düğüm durumları, topoloji bilgisi ve içgörüleri içerir

**d) API Endpoint'leri**

**`GET /`** - Kök endpoint
- API metadata ve mevcut topolojileri döndürür

**`GET /topologies`** - Topolojileri listele
- PCB+KAM ve JPB iş akışları hakkında detaylı bilgi döndürür
- Düğüm listeleri ve açıklamaları içerir

**`POST /simulate`** - Ana simülasyon endpoint'i
```python
async def simulate(parameters: SimulationParameters):
    sim = ValueChainSimulation(
        topology_type=parameters.topology_type,
        node_overrides=parameters.node_overrides,
        arrival_rate=parameters.arrival_rate,
        simulation_duration=parameters.simulation_duration,
    )
    results = sim.run()
    insights = analyze_simulation_results(results)
    return SimulationResponse(...)
```
- Simülasyon örneği oluşturur
- Simülasyonu çalıştırır
- Sonuçları analiz eder
- Formatlanmış yanıt döndürür

**`GET /health`** - Sağlık kontrolü
- İzleme/yük dengeleyiciler için basit endpoint

---

### 2. `simulation_engine.py` - Temel Simülasyon Mantığı

**Amaç**: Değer zincirleri için graf tabanlı ayrık olay simülasyon motoru.

#### Topoloji Tanımları

**PCB_KAM Topolojisi**:
```python
PCB_KAM_NODES = [
    "suppliers", "ext_logistics_s2w", "pcb_sqa", "pcb_warehouse",
    "int_log_w2pcb", "pcb_production", "int_log_pcb2wm", "wm_sqa",
    "wm_warehouse", "int_log_w2wm", "wm_production", 
    "ext_logistics_out", "customers"
]
```
- PCB+KAM iş akışını temsil eden 13 düğüm
- Düğümler string (ID) olarak tanımlanır

**PCB_KAM Kenarları**:
```python
PCB_KAM_EDGES = [
    ("suppliers", "ext_logistics_s2w"),
    ("ext_logistics_s2w", "pcb_sqa"),  # %70 yol
    ("ext_logistics_s2w", "wm_sqa"),   # %30 yol
    ...
]
```
- Akış yönünü tanımlayan yönlü kenarlar
- Her tuple (kaynak, hedef) temsil eder

**Bölünme Düğümleri**:
```python
"split_nodes": {
    "ext_logistics_s2w": [("pcb_sqa", 0.7), ("wm_sqa", 0.3)]
}
```
- Olasılıksal bölünmeleri tanımlar
- %70 PCB hattına, %30 direkt WM'ye gider

**JPB Topolojisi**:
- 3 tedarikçi içeren 18 düğüm (Spring, RM1, RM2)
- Karmaşık birleşme noktaları (LH Building Inv, JPB Production)
- Geri besleme döngüsü: QA → Material Inventory (%10 ret)

#### NodeProcessor Sınıfı

**Amaç**: Değer zincirindeki tek bir işleme düğümünü temsil eder.

**Başlatma**:
```python
def __init__(
    self,
    env: simpy.Environment,
    node_id: str,
    processing_time: float = 10.0,
    capacity: int = 100,
    mtbf: float = 500.0,
    mttr: float = 30.0,
):
```
- **env**: SimPy ortamı (simülasyon saati)
- **node_id**: Benzersiz tanımlayıcı
- **processing_time**: Ortalama işlem süresi (dakika)
- **capacity**: Tampon kapasitesi
- **mtbf**: Arızalar Arası Ortalama Süre (dakika)
- **mttr**: Tamir İçin Ortalama Süre (dakika)

**Temel Özellikler**:
- `resource`: SimPy Resource (eşzamanlılığı yönetir)
- `buffer`: SimPy Store (kuyruklamayı yönetir)
- `is_broken`: Arıza durumu için boolean bayrak
- `total_downtime`: Birikmiş duruş süresi
- `processed_count`: İşlenen parça sayısı
- `utilization_time`: İşleme için harcanan toplam süre

**Arıza Süreci** (`_breakdown_process`):
```python
def _breakdown_process(self):
    while True:
        time_to_failure = random.expovariate(1.0 / max(self.mtbf, 1.0))
        yield self.env.timeout(time_to_failure)
        
        if not self.is_broken:
            self.is_broken = True
            repair_time = random.expovariate(1.0 / max(self.mttr, 1.0))
            yield self.env.timeout(repair_time)
            self.is_broken = False
            self.total_downtime += repair_time
```
- **Üstel Dağılım**: Arızalar arası süre üstel dağılımı takip eder
- **Sürekli Süreç**: Simülasyon boyunca çalışır
- **Durum Yönetimi**: Arızalı/çalışır durumu takip eder
- **Tamir Süresi**: Ayrıca üstel dağılım

**İşleme Metodu** (`process`):
```python
def process(self, part: Dict[str, Any]) -> Any:
    start_time = self.env.now
    
    with self.resource.request() as req:
        yield req  # Kaynak kullanılabilirliği için bekle
        
        while self.is_broken:
            yield self.env.timeout(0.5)  # Arızalıysa bekle
        
        actual_time = max(0.1, random.normalvariate(
            self.processing_time,
            self.processing_time * 0.1
        ))
        yield self.env.timeout(actual_time)
        
        self.utilization_time += actual_time
        self.processed_count += 1
    
    return part
```
- **Kaynak Kilitleme**: Eşzamanlılığı yönetmek için SimPy Resource kullanır
- **Arıza Yönetimi**: Makine arızalıysa bekler
- **Normal Dağılım**: İşlem süresi ortalamanın etrafında değişir (±%10)
- **İstatistikler**: Kullanım ve sayıyı takip eder

**Metrik Hesaplama**:
- **Kullanım**: `(utilization_time / total_time) * 100`
- **Kullanılabilirlik**: `((total_time - downtime) / total_time) * 100`
- **Verimlilik**: `(availability / 100) * (utilization / 100) * 100` (OEE benzeri)

#### ValueChainSimulation Sınıfı

**Amaç**: Tüm grafiği yöneten ana simülasyon orkestratörü.

**Başlatma**:
```python
def __init__(
    self,
    topology_type: str = "pcb_kam",
    node_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
    arrival_rate: float = 0.1,
    simulation_duration: float = 480.0,
):
```

**Adım Adım Kurulum**:

1. **Topoloji Yapılandırmasını Yükle**:
   ```python
   self.config = TOPOLOGY_CONFIGS[self.topology_type]
   self.node_ids = self.config["nodes"]
   self.edges = self.config["edges"]
   ```

2. **Komşuluk Listesi Oluştur**:
   ```python
   self.adjacency: Dict[str, List[str]] = defaultdict(list)
   for src, dst in self.edges:
       self.adjacency[src].append(dst)
   ```
   - Gezinme için graf yapısı oluşturur
   - Örnek: `{"suppliers": ["ext_logistics_s2w"]}`

3. **Düğüm İşlemcileri Oluştur**:
   ```python
   for node_id in self.node_ids:
       cfg = overrides.get(node_id, {})
       self.nodes[node_id] = NodeProcessor(
           self.env, node_id,
           processing_time=cfg.get("processing_time", 10.0),
           capacity=cfg.get("capacity", 100),
           mtbf=cfg.get("mtbf", 500.0),
           mttr=cfg.get("mttr", 30.0),
       )
   ```
   - Her düğüm için işlemci oluşturur
   - Sağlanırsa geçersiz kılmaları uygular
   - Aksi halde varsayılanları kullanır

4. **Süreçleri Başlat**:
   ```python
   for source in self.sources:
       self.env.process(self._material_arrival(source))
   self.env.process(self._collect_time_series())
   ```

**Malzeme Geliş Süreci** (`_material_arrival`):
```python
def _material_arrival(self, source_node: str):
    part_id = 0
    while True:
        inter_arrival = random.expovariate(self.arrival_rate)
        yield self.env.timeout(inter_arrival)
        
        part_id += 1
        self.parts_started += 1
        
        part = {
            "part_id": f"{source_node}_{part_id}",
            "arrival_time": self.env.now,
            "source": source_node,
            "path": [source_node],
        }
        
        self.env.process(self._process_part(part, source_node))
```
- **Üstel Gelişler Arası Süre**: Gelişler arası süre üstel dağılımı takip eder
- **Parça Oluşturma**: Metadata ile parça sözlüğü oluşturur
- **Yol Takibi**: Parçanın ziyaret ettiği düğümleri takip eder
- **Sürekli Üretim**: Simülasyon boyunca çalışır

**Parça İşleme** (`_process_part`):
```python
def _process_part(self, part: Dict[str, Any], current_node: str):
    # Mevcut düğümde işle
    processor = self.nodes[current_node]
    yield self.env.process(processor.process(part))
    part["path"].append(current_node)
    
    # Sink'e ulaşıldı mı kontrol et
    if current_node in self.sinks:
        lead_time = self.env.now - part["arrival_time"]
        self.lead_times.append(lead_time)
        self.parts_completed += 1
        return
    
    # Sonraki düğümü al
    next_node = self._get_next_node(current_node)
    if next_node:
        self.env.process(self._process_part(part, next_node))
```
- **Özyinelemeli İşleme**: Her parça grafikte özyinelemeli olarak akar
- **Düğüm İşleme**: Mevcut düğüm için processor.process() çağırır
- **Yol Takibi**: Mevcut düğümü parçanın yoluna ekler
- **Tamamlanma Kontrolü**: Sink'e ulaşılırsa teslim süresini hesapla
- **Akışı Sürdür**: Sonraki düğümü özyinelemeli olarak işle

**Sonraki Düğüm Seçimi** (`_get_next_node`):
```python
def _get_next_node(self, current_node: str) -> Optional[str]:
    next_nodes = self.adjacency.get(current_node, [])
    
    if not next_nodes:
        return None
    
    # Bölünme düğümü mü kontrol et
    if current_node in self.split_nodes:
        splits = self.split_nodes[current_node]
        r = random.random()
        cumulative = 0.0
        for (target, prob) in splits:
            cumulative += prob
            if r <= cumulative:
                return target
        return splits[-1][0]
    
    # Varsayılan: ilk sonraki düğüm
    return next_nodes[0]
```
- **Bölünme Yönetimi**: Bölünmeler için kümülatif olasılık kullanır
- **Rastgele Seçim**: Olasılıksal yönlendirme için random.random() kullanır
- **Varsayılan Davranış**: İlk mevcut sonraki düğümü alır

**Zaman Serisi Toplama** (`_collect_time_series`):
```python
def _collect_time_series(self):
    while True:
        yield self.env.timeout(self.collection_interval)  # Her 5 dakikada
        
        snapshot = {
            "time": self.env.now,
            "queue_lengths": {},
            "utilizations": {},
            "throughput": self.parts_completed / max(self.env.now, 1) * 60,
        }
        
        for node_id, processor in self.nodes.items():
            snapshot["queue_lengths"][node_id] = processor.get_queue_length()
            snapshot["utilizations"][node_id] = processor.get_utilization(self.env.now)
        
        self.time_series_data.append(snapshot)
```
- **Periyodik Anlık Görüntü**: Her 5 dakikada veri toplar
- **Kuyruk Uzunlukları**: Düğüm başına mevcut kuyruk uzunluğu
- **Kullanımlar**: Düğüm başına mevcut kullanım
- **Verimlilik**: Saatte parça hesaplaması

**Çalıştır Metodu**:
```python
def run(self) -> Dict[str, Any]:
    self.env.run(until=self.simulation_duration)
    
    # Final metrikleri hesapla
    total_time = max(self.simulation_duration, 0.1)
    throughput = self.parts_completed / (total_time / 60.0)
    avg_lead_time = sum(self.lead_times) / len(self.lead_times) if self.lead_times else 0.0
    
    # Düğüm durumu oluştur
    node_status = {}
    for node_id, processor in self.nodes.items():
        utilization = processor.get_utilization(total_time)
        availability = processor.get_availability(total_time)
        efficiency = (availability / 100.0) * (utilization / 100.0) * 100.0
        
        node_status[node_id] = {
            "type": self._determine_node_type(node_id),
            "utilization": round(utilization, 2),
            "availability": round(availability, 2),
            "efficiency": round(efficiency, 2),
            "processed_count": processor.processed_count,
            "queue_length": processor.get_queue_length(),
            "is_bottleneck": utilization > 85.0,
            "is_broken": processor.is_broken,
        }
    
    return {
        "metrics": {...},
        "time_series": [...],
        "node_status": {...},
        "topology": {...}
    }
```
- **Simülasyon Yürütme**: SimPy'yi süreye kadar çalıştırır
- **Final Hesaplamalar**: Tüm final metrikleri hesaplar
- **Düğüm Durumu**: Her düğüm için tam durum oluşturur
- **Dönüş Yapısı**: Formatlanmış sonuçları döndürür

---

### 3. `analysis_engine.py` - Kural Tabanlı Analiz

**Amaç**: Simülasyon sonuçlarını analiz eder ve uygulanabilir içgörüler üretir.

#### İçgörü Tipleri

```python
class InsightType(str, Enum):
    WARNING = "warning"      # Kırmızı - Kritik sorunlar
    INFO = "info"            # Mavi - Bilgi
    SUCCESS = "success"      # Yeşil - İyi durum
    SUGGESTION = "suggestion"  # Sarı - Öneriler
```

#### Analiz Kuralları

**Kural 1: Darboğaz Tespiti**
```python
for node_id, status in node_status.items():
    utilization = status.get("utilization", 0)
    if utilization > 85:
        bottlenecks.append((node_id, utilization))
```
- %85'ten fazla kullanıma sahip düğümleri işaretler
- Yüksek önem derecesi uyarısı

**Kural 2: Kullanılmayan Kaynaklar**
```python
if utilization < 20 and node_type in ["production", "process", "quality"]:
    underutilized.append((node_id, utilization))
```
- İsraf edilen kapasiteyi belirler
- Düşük önem derecesi önerisi

**Kural 3: Teslim Süresi Analizi**
```python
if avg_lead_time > 300:  # 5+ saat
    insights.append(WARNING: "Yüksek Teslim Süresi")
```
- Aşırı teslim sürelerini işaretler
- Orta-yüksek önem derecesi

**Kural 4: Tamamlanma Oranı**
```python
completion_rate = (parts_completed / parts_started) * 100
if completion_rate < 50:
    insights.append(WARNING: "Düşük Tamamlanma Oranı")
```
- Simülasyonun yeterince uzun çalışıp çalışmadığını kontrol eder
- <%50 ise yüksek önem derecesi

**Kural 5: Arızalı Düğümler**
```python
if status.get("is_broken", False):
    broken_nodes.append(node_id)
```
- Şu anda arızalı düğümleri belirler
- Yüksek önem derecesi uyarısı

**Kural 6: Düşük Kullanılabilirlik**
```python
if availability < 80 and node_type in ["production", "process", "quality"]:
    low_availability.append((node_id, availability))
```
- Bakım sorunlarını işaretler
- Yüksek önem derecesi

**Kural 7: Genel Performans**
```python
if not bottlenecks and not broken_nodes and avg_lead_time < 180:
    insights.append(SUCCESS: "İyi Performans")
```
- Her şey iyi olduğunda pozitif geri bildirim
- Düşük önem derecesi

**Kural 8: Verimlilik Analizi**
```python
if throughput < 1 and parts_started > 10:
    insights.append(WARNING: "Çok Düşük Verimlilik")
```
- Kritik sorun tespiti
- Kritik önem derecesi

#### İçgörü Sıralama

```python
severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
insights.sort(key=lambda x: severity_order.get(x.get("severity", "medium"), 2))
```
- Önem derecesine göre sıralar (kritik önce)
- En önemli içgörülerin önce görünmesini sağlar

---

## Veri Akışı ve İşleme

### İstek Akışı

```
1. Frontend POST /simulate gönderir
   ↓
2. FastAPI isteği doğrular (Pydantic)
   ↓
3. ValueChainSimulation oluşturulur
   ↓
4. Simülasyon çalışır (SimPy)
   ↓
5. Sonuçlar toplanır
   ↓
6. Analiz motoru sonuçları işler
   ↓
7. Yanıt formatlanır (Pydantic)
   ↓
8. JSON yanıtı frontend'e gönderilir
```

### Simülasyon Akışı

```
1. SimPy Ortamını Başlat
   ↓
2. Tüm NodeProcessor'ları Oluştur
   ↓
3. Malzeme geliş süreçlerini başlat
   ↓
4. Zaman serisi toplamayı başlat
   ↓
5. Parçalar grafikte akar:
   - Kaynakta gelir
   - Her düğümde işlenir
   - Kenarları takip ederek sonraki düğüme gider
   - Sink'te tamamlanır
   ↓
6. Simülasyon süreye kadar çalışır
   ↓
7. Final metrikleri hesaplanır
   ↓
8. Sonuçlar döndürülür
```

### Parça Yaşam Döngüsü

```
Parça Oluşturuldu (kaynak)
  ↓
Düğüm 1'de İşle
  ↓
Kaynak için bekle
  ↓
İşle (arıza yönetimi ile)
  ↓
Sonraki düğüme taşı
  ↓
... (her düğüm için tekrarla)
  ↓
Sink'te tamamla
  ↓
Teslim süresi hesaplanır
```

---

## Algoritma Detayları

### Üstel Dağılım

**Arızalar Arası Süre**:
```python
time_to_failure = random.expovariate(1.0 / mtbf)
```
- **MTBF = 500**: Arızalar arası ortalama süre 500 dakika
- **Lambda = 1/500**: Oran parametresi
- **Üstel**: Bir sonraki olaya kadar süreyi modeller

**Gelişler Arası Süre**:
```python
inter_arrival = random.expovariate(arrival_rate)
```
- **arrival_rate = 0.1**: Dakikada 0.1 parça
- **Ortalama gelişler arası = 10 dakika**: 1 / 0.1

### Normal Dağılım

**İşlem Süresi**:
```python
actual_time = random.normalvariate(
    mean=processing_time,
    stddev=processing_time * 0.1
)
```
- **Ortalama**: Belirtilen işlem süresi
- **Std Sapma**: Ortalamanın %10'u (gerçekçi değişkenlik)
- **Min**: 0.1'e sınırlandırılmış (negatif/sıfırı önler)

### Olasılıksal Yönlendirme

**Bölünme Düğümü Seçimi**:
```python
r = random.random()  # 0.0 ile 1.0 arası
cumulative = 0.0
for (target, prob) in splits:
    cumulative += prob
    if r <= cumulative:
        return target
```
- **Kümülatif Olasılık**: Kümülatif dağılım oluşturur
- **Rastgele Seçim**: Tekdüze rastgele sayı kullanır
- **Örnek**: %70 PCB, %30 WM → r=0.65 → PCB seçilir

### Graf Gezinme

**Derinlik-Öncelikli İşleme**:
- Her parça grafikte özyinelemeli olarak işlenir
- Yol parça sözlüğünde takip edilir
- Sink'e ulaşıldığında tamamlanır

---

## Hata Yönetimi ve Edge Case'ler

### Sıfıra Bölme Koruması

```python
total_time = max(self.simulation_duration, 0.1)  # Sıfıra bölmeyi önle
throughput = self.parts_completed / (total_time / 60.0) if total_time > 0 else 0.0
```

### Boş Sonuç Yönetimi

```python
avg_lead_time = sum(self.lead_times) / len(self.lead_times) if self.lead_times else 0.0
```

### Geçersiz Topoloji Yönetimi

```python
if self.topology_type not in TOPOLOGY_CONFIGS:
    self.topology_type = "pcb_kam"  # Varsayılan geri dönüş
```

### Arıza Durumu Yönetimi

```python
if not self.is_broken:  # Sadece şu anda çalışıyorsa arızala
    self.is_broken = True
```

### Kaynak Kilitleme

```python
with self.resource.request() as req:
    yield req  # İstisna durumunda bile uygun temizlemeyi sağlar
```

---

## Performans Değerlendirmeleri

### Simülasyon Hızı

- **Ayrık Olay**: Sadece olayları işler (sürekli zaman adımları değil)
- **Verimli**: SimPy DES için optimize edilmiştir
- **Ölçeklenebilirlik**: Binlerce parçayı verimli bir şekilde işler

### Bellek Yönetimi

- **Zaman Serisi**: Aralıklarla toplanır (her olay değil)
- **Parça Nesneleri**: Hafif sözlükler
- **İstatistikler**: Biriktirilir, olay başına saklanmaz

### Eşzamanlılık

- **SimPy Kaynakları**: Eşzamanlı işlemeyi yönetir
- **Çoklu Parçalar**: Aynı anda işlenebilir
- **Threading Yok**: SimPy coroutine kullanır (tek thread)

### Varsayılan Parametreler

- **Makul Varsayılanlar**: Yapılandırma gerekmez
- **Geçersiz Kılma Desteği**: Gerektiğinde özel parametreler
- **Doğrulama**: Pydantic tip güvenliğini sağlar

---

## Sonuç

Backend, **modüler**, **genişletilebilir** ve **performanslı** bir simülasyon motoru sağlar. Graf tabanlı yaklaşım, karmaşık değer zincirlerini simüle etmeyi kolaylaştırır ve varsayılan parametreler minimum yapılandırma gerektirir.

