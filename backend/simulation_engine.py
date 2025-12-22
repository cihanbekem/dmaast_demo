"""
Graph-based Value Chain Simulation Engine for DMaaST WP3.3
Supports: PCB_KAM_FLOW and JPB_FLOW topologies
"""
import random
from collections import defaultdict
from typing import Any, Dict, List, Optional, Set, Tuple

import simpy

# ═══════════════════════════════════════════════════════════════════════════════
# TOPOLOGY DEFINITIONS - Exact Mermaid diagrams from DMaaST
# ═══════════════════════════════════════════════════════════════════════════════

PCB_KAM_NODES = [
    "suppliers",
    "ext_logistics_s2w",
    "pcb_sqa",
    "pcb_warehouse",
    "int_log_w2pcb",
    "pcb_production",
    "int_log_pcb2wm",
    "wm_sqa",
    "wm_warehouse",
    "int_log_w2wm",
    "wm_production",
    "ext_logistics_out",
    "customers",
]

PCB_KAM_EDGES = [
    # Main entry
    ("suppliers", "ext_logistics_s2w"),
    # Path 1: PCB line
    ("ext_logistics_s2w", "pcb_sqa"),
    ("pcb_sqa", "pcb_warehouse"),
    ("pcb_warehouse", "int_log_w2pcb"),
    ("int_log_w2pcb", "pcb_production"),
    ("pcb_production", "int_log_pcb2wm"),
    ("int_log_pcb2wm", "wm_warehouse"),
    # Path 2: Direct to WM
    ("ext_logistics_s2w", "wm_sqa"),
    ("wm_sqa", "wm_warehouse"),
    # Final path
    ("wm_warehouse", "int_log_w2wm"),
    ("int_log_w2wm", "wm_production"),
    ("wm_production", "ext_logistics_out"),
    ("ext_logistics_out", "customers"),
]

JPB_NODES = [
    "spring_supplier",
    "rm_supplier_1",
    "rm_supplier_2",
    "ext_log_s2w",
    "ext_log_s12w",
    "ext_log_s22w",
    "spring_inventory",
    "lh_building_inv",
    "int_log_w2w",
    "material_inventory",
    "int_log_w2jpb_spring",
    "int_log_w2jpb_mat",
    "jpb_production",
    "int_log_jpb2qa",
    "qa",
    "int_log_qa2w",
    "ext_log_sale",
    "customers",
]

JPB_EDGES = [
    # Spring line
    ("spring_supplier", "ext_log_s2w"),
    ("ext_log_s2w", "spring_inventory"),
    ("spring_inventory", "int_log_w2jpb_spring"),
    ("int_log_w2jpb_spring", "jpb_production"),
    # Raw material line 1
    ("rm_supplier_1", "ext_log_s12w"),
    ("ext_log_s12w", "lh_building_inv"),
    # Raw material line 2
    ("rm_supplier_2", "ext_log_s22w"),
    ("ext_log_s22w", "lh_building_inv"),
    # Internal flow
    ("lh_building_inv", "int_log_w2w"),
    ("int_log_w2w", "material_inventory"),
    ("material_inventory", "int_log_w2jpb_mat"),
    ("int_log_w2jpb_mat", "jpb_production"),
    # Output
    ("jpb_production", "int_log_jpb2qa"),
    ("int_log_jpb2qa", "qa"),
    # Sales
    ("qa", "ext_log_sale"),
    ("material_inventory", "ext_log_sale"),
    ("ext_log_sale", "customers"),
    # Feedback loop (QA rejection)
    ("qa", "int_log_qa2w"),
    ("int_log_qa2w", "material_inventory"),
]


TOPOLOGY_CONFIGS = {
    "pcb_kam": {
        "nodes": PCB_KAM_NODES,
        "edges": PCB_KAM_EDGES,
        "sources": ["suppliers"],
        "sinks": ["customers"],
        "split_nodes": {
            "ext_logistics_s2w": [("pcb_sqa", 0.7), ("wm_sqa", 0.3)],  # 70% PCB, 30% direct
        },
        "merge_nodes": ["wm_warehouse"],
    },
    "jpb": {
        "nodes": JPB_NODES,
        "edges": JPB_EDGES,
        "sources": ["spring_supplier", "rm_supplier_1", "rm_supplier_2"],
        "sinks": ["customers"],
        "split_nodes": {
            "qa": [("ext_log_sale", 0.9), ("int_log_qa2w", 0.1)],  # 10% rejection rate
        },
        "merge_nodes": ["lh_building_inv", "jpb_production", "material_inventory", "ext_log_sale"],
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
# NODE PROCESSOR
# ═══════════════════════════════════════════════════════════════════════════════

class NodeProcessor:
    """Represents a processing node in the value chain."""

    def __init__(
        self,
        env: simpy.Environment,
        node_id: str,
        processing_time: float = 10.0,
        capacity: int = 100,
        mtbf: float = 500.0,
        mttr: float = 30.0,
    ):
        self.env = env
        self.node_id = node_id
        self.processing_time = processing_time
        self.capacity = capacity
        self.mtbf = mtbf
        self.mttr = mttr

        self.resource = simpy.Resource(env, capacity=1)
        self.buffer = simpy.Store(env, capacity=capacity)
        self.is_broken = False
        self.total_downtime = 0.0
        self.processed_count = 0
        self.utilization_time = 0.0
        self.waiting_time = 0.0
        self.queue_history: List[Tuple[float, int]] = []

        # Start breakdown process
        if mtbf > 0:
            env.process(self._breakdown_process())

    def _breakdown_process(self):
        """Simulates node breakdowns based on MTBF."""
        while True:
            time_to_failure = random.expovariate(1.0 / max(self.mtbf, 1.0))
            yield self.env.timeout(time_to_failure)

            if not self.is_broken:
                self.is_broken = True
                repair_time = random.expovariate(1.0 / max(self.mttr, 1.0))
                yield self.env.timeout(repair_time)
                self.is_broken = False
                self.total_downtime += repair_time

    def process(self, part: Dict[str, Any]) -> Any:
        """Process a part through this node."""
        start_time = self.env.now

        with self.resource.request() as req:
            yield req

            # Wait if broken
            while self.is_broken:
                yield self.env.timeout(0.5)

            # Processing time with variability
            actual_time = max(0.1, random.normalvariate(
                self.processing_time,
                self.processing_time * 0.1
            ))
            yield self.env.timeout(actual_time)

            end_time = self.env.now
            self.utilization_time += actual_time
            self.waiting_time += (end_time - start_time - actual_time)
            self.processed_count += 1

        return part

    def get_utilization(self, total_time: float) -> float:
        if total_time <= 0:
            return 0.0
        return min((self.utilization_time / total_time) * 100.0, 100.0)

    def get_availability(self, total_time: float) -> float:
        if total_time <= 0:
            return 100.0
        uptime = total_time - self.total_downtime
        return max(0.0, (uptime / total_time) * 100.0)

    def get_queue_length(self) -> int:
        return len(self.buffer.items)


# ═══════════════════════════════════════════════════════════════════════════════
# GRAPH-BASED SIMULATION ENGINE
# ═══════════════════════════════════════════════════════════════════════════════

class ValueChainSimulation:
    """Graph-based simulation engine for DMaaST value chain digital twins."""

    def __init__(
        self,
        topology_type: str = "pcb_kam",
        node_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
        arrival_rate: float = 0.1,
        simulation_duration: float = 480.0,
    ):
        self.env = simpy.Environment()
        self.topology_type = topology_type.lower()
        self.arrival_rate = arrival_rate
        self.simulation_duration = simulation_duration

        # Get topology config
        if self.topology_type not in TOPOLOGY_CONFIGS:
            self.topology_type = "pcb_kam"

        self.config = TOPOLOGY_CONFIGS[self.topology_type]
        self.node_ids = self.config["nodes"]
        self.edges = self.config["edges"]
        self.sources = self.config["sources"]
        self.sinks = self.config["sinks"]
        self.split_nodes = self.config.get("split_nodes", {})
        self.merge_nodes = self.config.get("merge_nodes", [])

        # Build adjacency list
        self.adjacency: Dict[str, List[str]] = defaultdict(list)
        for src, dst in self.edges:
            self.adjacency[src].append(dst)

        # Create processors for each node with defaults
        self.nodes: Dict[str, NodeProcessor] = {}
        overrides = node_overrides or {}

        for node_id in self.node_ids:
            cfg = overrides.get(node_id, {})
            self.nodes[node_id] = NodeProcessor(
                self.env,
                node_id,
                processing_time=cfg.get("processing_time", 10.0),
                capacity=cfg.get("capacity", 100),
                mtbf=cfg.get("mtbf", 500.0),
                mttr=cfg.get("mttr", 30.0),
            )

        # Statistics
        self.parts_completed = 0
        self.parts_started = 0
        self.lead_times: List[float] = []
        self.time_series_data: List[Dict[str, Any]] = []
        self.collection_interval = 5.0

        # Start processes
        for source in self.sources:
            self.env.process(self._material_arrival(source))
        self.env.process(self._collect_time_series())

    def _material_arrival(self, source_node: str):
        """Generate material arrivals at a source node."""
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

            # Start flowing through the graph
            self.env.process(self._process_part(part, source_node))

    def _get_next_node(self, current_node: str) -> Optional[str]:
        """Determine the next node based on topology and probabilistic splits."""
        next_nodes = self.adjacency.get(current_node, [])

        if not next_nodes:
            return None

        # Check if this is a split node
        if current_node in self.split_nodes:
            splits = self.split_nodes[current_node]
            r = random.random()
            cumulative = 0.0
            for (target, prob) in splits:
                cumulative += prob
                if r <= cumulative:
                    return target
            return splits[-1][0]  # Fallback

        # Default: just take the first next node (or random if multiple)
        return random.choice(next_nodes) if len(next_nodes) > 1 else next_nodes[0]

    def _process_part(self, part: Dict[str, Any], current_node: str):
        """Process a part through the value chain graph."""
        # Process at current node
        processor = self.nodes[current_node]
        yield self.env.process(processor.process(part))
        part["path"].append(current_node)

        # Check if we reached a sink
        if current_node in self.sinks:
            lead_time = self.env.now - part["arrival_time"]
            self.lead_times.append(lead_time)
            self.parts_completed += 1
            return

        # Get next node
        next_node = self._get_next_node(current_node)

        if next_node:
            # Continue to next node
            self.env.process(self._process_part(part, next_node))

    def _collect_time_series(self):
        """Collect time series data at regular intervals."""
        while True:
            yield self.env.timeout(self.collection_interval)

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

    def run(self) -> Dict[str, Any]:
        """Run the simulation and return results."""
        self.env.run(until=self.simulation_duration)

        total_time = max(self.simulation_duration, 0.1)
        throughput = self.parts_completed / (total_time / 60.0)
        avg_lead_time = sum(self.lead_times) / len(self.lead_times) if self.lead_times else 0.0

        # Build node status
        node_status: Dict[str, Any] = {}
        resource_utilizations: Dict[str, float] = {}

        for node_id, processor in self.nodes.items():
            utilization = processor.get_utilization(total_time)
            availability = processor.get_availability(total_time)
            efficiency = (availability / 100.0) * (utilization / 100.0) * 100.0 if availability > 0 and utilization > 0 else 0.0

            resource_utilizations[node_id] = utilization

            # Determine node type for frontend
            node_type = "logistics" if "log" in node_id else "process"
            if node_id in self.sources:
                node_type = "source"
            elif node_id in self.sinks:
                node_type = "sink"
            elif "warehouse" in node_id or "inventory" in node_id:
                node_type = "storage"
            elif "sqa" in node_id or "qa" in node_id:
                node_type = "quality"
            elif "production" in node_id:
                node_type = "production"

            node_status[node_id] = {
                "type": node_type,
                "utilization": round(utilization, 2),
                "availability": round(availability, 2),
                "efficiency": round(efficiency, 2),
                "processed_count": processor.processed_count,
                "queue_length": processor.get_queue_length(),
                "is_bottleneck": utilization > 85.0,
                "is_broken": processor.is_broken,
            }

        metrics = {
            "throughput": round(throughput, 2),
            "average_lead_time": round(avg_lead_time, 2),
            "parts_completed": self.parts_completed,
            "parts_started": self.parts_started,
            "resource_utilization": resource_utilizations,
        }

        time_series = [
            {
                "time": snap["time"],
                "queue_lengths": snap["queue_lengths"],
                "utilizations": snap["utilizations"],
                "throughput": snap["throughput"],
            }
            for snap in self.time_series_data
        ]

        return {
            "metrics": metrics,
            "time_series": time_series,
            "node_status": node_status,
            "topology": {
                "type": self.topology_type,
                "nodes": self.node_ids,
                "edges": [(src, dst) for src, dst in self.edges],
            },
        }


# ═══════════════════════════════════════════════════════════════════════════════
# BACKWARD COMPATIBILITY WRAPPER
# ═══════════════════════════════════════════════════════════════════════════════

class ProductionLineSimulation(ValueChainSimulation):
    """Backward compatible wrapper for old API."""

    def __init__(
        self,
        topology_type: str = "pcb_kam",
        node_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
        arrival_rate: float = 0.1,
        simulation_duration: float = 480.0,
        # Legacy parameters (ignored)
        factory: str = None,
        stage_overrides: Optional[Dict[str, Dict[str, Any]]] = None,
        buffer_overrides: Optional[Dict[str, int]] = None,
        arrival_rates: float = None,
        workstation_configs: Optional[Dict[str, Dict[str, Any]]] = None,
        storage_capacities: Optional[Dict[str, int]] = None,
        machine_counts: Optional[Dict[str, int]] = None,
        mean_processing_times: Optional[Dict[str, float]] = None,
        buffer_capacities: Optional[Dict[str, int]] = None,
        mtbf: Optional[Dict[str, float]] = None,
        mttr: Optional[Dict[str, float]] = None,
    ):
        # Map old factory names to new topology types
        if factory:
            if factory.upper() == "KAM":
                topology_type = "pcb_kam"
            elif factory.upper() == "JPB":
                topology_type = "jpb"

        # Use arrival_rates if provided (old API name)
        if arrival_rates is not None:
            arrival_rate = arrival_rates

        super().__init__(
            topology_type=topology_type,
            node_overrides=node_overrides,
            arrival_rate=arrival_rate,
            simulation_duration=simulation_duration,
        )
