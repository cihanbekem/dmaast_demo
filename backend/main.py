from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import simpy
import random
from datetime import datetime
from simulation_engine import ProductionLineSimulation
from analysis_engine import analyze_simulation_results

app = FastAPI(title="Digital Twin Simulation API", version="1.0.0")

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationParameters(BaseModel):
    # Genel Fabrika Altyapısı - Workstation bazlı
    workstation_configs: Dict[str, Dict[str, Any]] = Field(
        default={
            "workstation_1": {"count": 2, "processing_time": 10.0, "mtbf": 120.0, "mttr": 15.0},
            "workstation_2": {"count": 1, "processing_time": 5.0, "mtbf": 200.0, "mttr": 10.0}
        },
        description="Workstation konfigürasyonları: {workstation_id: {count, processing_time, mtbf, mttr}}"
    )
    storage_capacities: Dict[str, int] = Field(
        default={"storage_1": 20, "storage_2": 20},
        description="Depolama alanı kapasiteleri"
    )
    arrival_rates: float = Field(
        default=0.1,
        description="Hammadde geliş hızı (parça/dakika)"
    )
    simulation_duration: float = Field(
        default=480.0,
        description="Simülasyon süresi (dakika)"
    )
    # Geriye dönük uyumluluk için eski parametreler (opsiyonel)
    machine_counts: Optional[Dict[str, int]] = Field(
        default=None,
        description="[Deprecated] machine_counts yerine workstation_configs kullanın"
    )
    mean_processing_times: Optional[Dict[str, float]] = Field(
        default=None,
        description="[Deprecated] workstation_configs içinde tanımlayın"
    )
    buffer_capacities: Optional[Dict[str, int]] = Field(
        default=None,
        description="[Deprecated] storage_capacities kullanın"
    )
    mtbf: Optional[Dict[str, float]] = Field(
        default=None,
        description="[Deprecated] workstation_configs içinde tanımlayın"
    )
    mttr: Optional[Dict[str, float]] = Field(
        default=None,
        description="[Deprecated] workstation_configs içinde tanımlayın"
    )


class SimulationResponse(BaseModel):
    metrics: Dict[str, Any]  # Changed from Dict[str, float] to allow resource_utilization dict
    time_series: List[Dict[str, Any]]
    node_status: Dict[str, Dict[str, Any]]
    insights: List[Dict[str, Any]]  # Kural tabanlı analiz sonuçları
    simulation_id: str
    timestamp: str


@app.get("/")
async def root():
    return {"message": "Digital Twin Simulation API", "version": "1.0.0"}


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(parameters: SimulationParameters):
    """
    Run a discrete event simulation of the production line.
    Returns metrics, time series data, and node status information.
    """
    try:
        # Create simulation instance
        sim = ProductionLineSimulation(
            machine_counts=parameters.machine_counts,
            mean_processing_times=parameters.mean_processing_times,
            arrival_rate=parameters.arrival_rates,
            simulation_duration=parameters.simulation_duration,
            buffer_capacities=parameters.buffer_capacities,
            mtbf=parameters.mtbf,
            mttr=parameters.mttr,
        )
        
        # Run simulation
        results = sim.run()
        
        # Analyze results with rule-based engine
        insights = analyze_simulation_results(results)
        
        # Generate simulation ID
        sim_id = f"sim_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return SimulationResponse(
            metrics=results["metrics"],
            time_series=results["time_series"],
            node_status=results["node_status"],
            insights=insights,
            simulation_id=sim_id,
            timestamp=datetime.now().isoformat()
        )
    
    except Exception as e:
        import traceback
        error_detail = f"Simulation error: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")  # Log to console
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "healthy"}

