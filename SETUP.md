# Setup Guide

## Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

## Quick Start

### Option 1: Using Startup Scripts (Recommended)

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at: `http://localhost:5173`

**Note:** If you encounter npm permission errors, run:
```bash
sudo chown -R $(whoami) ~/.npm
```

**Note:** If you encounter dependency conflicts (e.g., with lucide-react), you can use:
```bash
npm install --legacy-peer-deps
```

## First Run

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Adjust simulation parameters in the left panel
4. Click "Run Simulation"
5. View results in the process map and charts

## Troubleshooting

### Backend Issues

- **Port 8000 already in use**: Change port in `uvicorn main:app --reload --port 8001`
- **Module not found**: Ensure virtual environment is activated and dependencies are installed

### Frontend Issues

- **npm install fails**: Check Node.js version (should be 18+)
- **CORS errors**: Ensure backend is running and CORS is configured (already set in `main.py`)
- **React Flow not rendering**: Check browser console for errors, ensure `reactflow` is installed

### Common Issues

- **Simulation takes too long**: Reduce `simulation_duration` parameter
- **No data in charts**: Ensure simulation has completed successfully
- **Nodes not updating**: Check that backend returned valid JSON response

## Development

### Backend Development

- API endpoints are defined in `backend/main.py`
- Simulation logic is in `backend/simulation_engine.py`
- Use FastAPI docs at `http://localhost:8000/docs` for testing

### Frontend Development

- Components are in `frontend/src/components/`
- State management is in `frontend/src/store/simulationStore.ts`
- Custom React Flow nodes are in `frontend/src/components/nodes/`
- Custom React Flow edges are in `frontend/src/components/edges/`

## Testing the API

You can test the API directly using curl:

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

## Architecture Notes

- **DMAAST Compliance**: Backend (Simulation Service) and Frontend (Digital Twin UI) are completely decoupled
- **State Management**: Zustand store manages all simulation state
- **Visualization**: React Flow handles the interactive process map
- **Analytics**: Recharts provides all chart visualizations

