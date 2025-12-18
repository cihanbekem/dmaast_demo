# Digital Twin Simulation Backend

FastAPI backend with SimPy discrete event simulation engine.

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

API docs: `http://localhost:8000/docs`

