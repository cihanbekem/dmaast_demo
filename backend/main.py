"""
DMaaST WP3.3 Digital Twin Simulation API
Supports PCB+KAM and JPB value chain topologies
"""
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from analysis_engine import analyze_simulation_results
from simulation_engine import ValueChainSimulation

app = FastAPI(
    title="DMaaST Value Chain Digital Twin API",
    version="2.0.0",
    description="Graph-based simulation for PCB+KAM and JPB value chains"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SimulationParameters(BaseModel):
    topology_type: Literal["pcb_kam", "jpb"] = Field(
        default="pcb_kam",
        description="Workflow topology: 'pcb_kam' for PCB+KAM or 'jpb' for JPB"
    )
    node_overrides: Optional[Dict[str, Dict[str, Any]]] = Field(
        default=None,
        description="Optional overrides for specific nodes: {node_id: {processing_time, capacity, mtbf, mttr}}"
    )
    arrival_rate: float = Field(
        default=0.1,
        description="Material arrival rate (parts/minute)"
    )
    simulation_duration: float = Field(
        default=480.0,
        description="Simulation duration (minutes)"
    )


class SimulationResponse(BaseModel):
    metrics: Dict[str, Any]
    time_series: List[Dict[str, Any]]
    node_status: Dict[str, Dict[str, Any]]
    topology: Dict[str, Any]
    insights: List[Dict[str, Any]]
    simulation_id: str
    timestamp: str


@app.get("/")
async def root():
    return {
        "message": "DMaaST Value Chain Digital Twin API",
        "version": "2.0.0",
        "topologies": ["pcb_kam", "jpb"]
    }


@app.get("/topologies")
async def get_topologies():
    """Return available topology configurations."""
    return {
        "pcb_kam": {
            "name": "PCB + KAM Workflow",
            "description": "PCB production and Warehouse Manufacturing flow",
            "nodes": [
                "suppliers", "ext_logistics_s2w", "pcb_sqa", "pcb_warehouse",
                "int_log_w2pcb", "pcb_production", "int_log_pcb2wm", "wm_sqa",
                "wm_warehouse", "int_log_w2wm", "wm_production", "ext_logistics_out", "customers"
            ],
        },
        "jpb": {
            "name": "JPB Workflow",
            "description": "JPB assembly with spring and raw material supply lines",
            "nodes": [
                "spring_supplier", "rm_supplier_1", "rm_supplier_2", "ext_log_s2w",
                "ext_log_s12w", "ext_log_s22w", "spring_inventory", "lh_building_inv",
                "int_log_w2w", "material_inventory", "int_log_w2jpb_spring",
                "int_log_w2jpb_mat", "jpb_production", "int_log_jpb2qa", "qa",
                "int_log_qa2w", "ext_log_sale", "customers"
            ],
        }
    }


@app.post("/simulate", response_model=SimulationResponse)
async def simulate(parameters: SimulationParameters):
    """
    Run a discrete event simulation of the value chain.
    Returns metrics, time series data, node status, and topology information.
    """
    try:
        # Create simulation instance
        sim = ValueChainSimulation(
            topology_type=parameters.topology_type,
            node_overrides=parameters.node_overrides,
            arrival_rate=parameters.arrival_rate,
            simulation_duration=parameters.simulation_duration,
        )

        # Run simulation
        results = sim.run()

        # Analyze results with rule-based engine
        insights = analyze_simulation_results(results)

        # Generate simulation ID
        sim_id = f"sim_{parameters.topology_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        return SimulationResponse(
            metrics=results["metrics"],
            time_series=results["time_series"],
            node_status=results["node_status"],
            topology=results["topology"],
            insights=insights,
            simulation_id=sim_id,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        import traceback
        error_detail = f"Simulation error: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}
