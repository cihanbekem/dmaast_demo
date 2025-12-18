# Critical Infrastructure Digital Twin

A comprehensive Digital Twin system for factory production line simulation using SimPy (Discrete Event Simulation) and React.

## 🎯 Project Overview

This system provides a production line simulation where users can:
- Modify simulation parameters (machine counts, processing times, arrival rates)
- Run Discrete Event Simulations (DES) with probabilistic breakdowns
- Visualize results on an interactive dashboard with React Flow
- Compare multiple scenarios side-by-side
- Analyze bottlenecks and equipment effectiveness

## 🏗️ Architecture

Following **DMAAST** (Digital Manufacturing as a Service Transformation) principles:
- **Simulation Service** (Backend): Decoupled SimPy engine
- **Digital Twin UI** (Frontend): Independent visualization layer

### Production Line Flow

```
Material Arrival → Buffer 1 → CNC Machining → Buffer 2 → Quality Control → Finished Goods
```

## 📁 Project Structure

```
factory/
├── backend/              # FastAPI + SimPy backend
│   ├── main.py          # FastAPI application
│   ├── simulation_engine.py  # SimPy DES engine
│   └── requirements.txt
│
└── frontend/            # React + Vite frontend
    ├── src/
    │   ├── components/   # React components
    │   │   ├── ProcessMap.tsx
    │   │   ├── SimulationControls.tsx
    │   │   ├── MetricsPanel.tsx
    │   │   ├── Charts.tsx
    │   │   ├── ScenarioComparison.tsx
    │   │   ├── nodes/   # Custom React Flow nodes
    │   │   └── edges/   # Custom React Flow edges
    │   ├── store/       # Zustand state management
    │   └── lib/         # Utilities
    └── package.json
```

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend API: `http://localhost:8000`
API Docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:5173`

## 🎨 Features

### Backend (FastAPI + SimPy)

- **DES Engine**: Production line simulation with:
  - Material arrival (exponential distribution)
  - Buffer management with capacity limits
  - Multi-machine processing (CNC, Quality Control)
  - Probabilistic breakdowns (MTBF/MTTR)
  - Queue length tracking
  - Utilization and availability metrics

- **API Endpoint**: `POST /simulate`
  - Accepts simulation parameters
  - Returns metrics, time series data, and node status

### Frontend (React + React Flow)

- **Interactive Process Map**:
  - Custom machine nodes with utilization progress bars
  - Custom buffer nodes with capacity indicators
  - Animated edges with particle flow
  - Dynamic bottleneck alerts (red pulsing when utilization > 85%)

- **Analytics Dashboard**:
  - Line chart: Bottleneck evolution (queue lengths over time)
  - Bar chart: Equipment effectiveness (Availability, Performance, Efficiency)

- **Scenario Comparison**:
  - Save simulation runs
  - Compare multiple scenarios side-by-side
  - Track improvements over time

- **Dark Mode UI**: Industrial-themed interface

## 📊 Simulation Parameters

- **Machine Counts**: Number of CNC and QC machines
- **Processing Times**: Mean processing time per machine type
- **Arrival Rate**: Material arrival rate (parts per minute)
- **Simulation Duration**: Total simulation time (minutes)
- **Buffer Capacities**: Capacity of Buffer 1 and Buffer 2
- **MTBF**: Mean Time Between Failures (minutes)
- **MTTR**: Mean Time To Repair (minutes)

## 📈 Metrics Returned

- **Throughput**: Parts completed per hour
- **Average Lead Time**: Average time from arrival to completion
- **Resource Utilization**: Percentage utilization per machine type
- **Node Status**: Per-node metrics including:
  - Utilization percentage
  - Availability percentage
  - Efficiency (OEE-like metric)
  - Bottleneck status
  - Breakdown status

## 🛠️ Tech Stack

### Backend
- Python 3.8+
- FastAPI
- SimPy 4.0+
- Pydantic

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- React Flow
- Recharts
- Zustand
- Lucide React

## 📝 API Example

```bash
curl -X POST "http://localhost:8000/simulate" \
  -H "Content-Type: application/json" \
  -d '{
    "machine_counts": {"cnc": 2, "quality_control": 1},
    "mean_processing_times": {"cnc": 10.0, "quality_control": 5.0},
    "arrival_rates": 0.1,
    "simulation_duration": 480.0,
    "buffer_capacities": {"buffer1": 20, "buffer2": 20},
    "mtbf": {"cnc": 120.0, "quality_control": 200.0},
    "mttr": {"cnc": 15.0, "quality_control": 10.0}
  }'
```

## 🎯 Use Cases

1. **Production Planning**: Test different machine configurations
2. **Bottleneck Analysis**: Identify and visualize bottlenecks
3. **Capacity Planning**: Determine optimal buffer sizes
4. **Maintenance Strategy**: Analyze impact of MTBF/MTTR on throughput
5. **Scenario Comparison**: Compare "as-is" vs "to-be" scenarios

## 🔧 Development

The system is designed with separation of concerns:
- Backend handles all simulation logic
- Frontend handles all visualization
- Communication via REST API
- State management with Zustand

## 📄 License

MIT

