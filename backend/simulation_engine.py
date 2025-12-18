import simpy
import random
from typing import Dict, List, Any, Optional
from collections import defaultdict
import math


class Machine:
    """Represents a machine with breakdown and repair capabilities."""
    
    def __init__(self, env: simpy.Environment, machine_id: str, 
                 processing_time: float, mtbf: float, mttr: float):
        self.env = env
        self.machine_id = machine_id
        self.processing_time = processing_time
        self.mtbf = mtbf  # Mean Time Between Failures
        self.mttr = mttr  # Mean Time To Repair
        self.resource = simpy.Resource(env, capacity=1)
        self.is_broken = False
        self.total_uptime = 0.0
        self.total_downtime = 0.0
        self.last_failure_time = 0.0
        self.processed_count = 0
        self.utilization_time = 0.0
        
        # Start breakdown process
        env.process(self._breakdown_process())
    
    def _breakdown_process(self):
        """Simulates machine breakdowns based on MTBF."""
        while True:
            # Time until next failure (exponential distribution)
            time_to_failure = random.expovariate(1.0 / self.mtbf)
            yield self.env.timeout(time_to_failure)
            
            if not self.is_broken:
                self.is_broken = True
                self.last_failure_time = self.env.now
                # Repair time (exponential distribution)
                repair_time = random.expovariate(1.0 / self.mttr)
                yield self.env.timeout(repair_time)
                self.is_broken = False
                self.total_downtime += repair_time
    
    def process(self, part_id: str):
        """Process a part with potential breakdown interruption."""
        start_time = self.env.now
        
        with self.resource.request() as req:
            yield req
            
            # Check if machine is broken
            if self.is_broken:
                # Wait until repair is complete
                while self.is_broken:
                    yield self.env.timeout(1.0)
            
            # Actual processing (normal distribution around mean)
            actual_time = max(0.1, random.normalvariate(
                self.processing_time, 
                self.processing_time * 0.1
            ))
            
            yield self.env.timeout(actual_time)
            
            end_time = self.env.now
            self.utilization_time += (end_time - start_time)
            self.processed_count += 1
    
    def get_utilization(self, total_time: float) -> float:
        """Calculate machine utilization percentage."""
        if total_time == 0:
            return 0.0
        return (self.utilization_time / total_time) * 100.0
    
    def get_availability(self, total_time: float) -> float:
        """Calculate machine availability percentage."""
        if total_time == 0:
            return 0.0
        uptime = total_time - self.total_downtime
        return (uptime / total_time) * 100.0


class ProductionLineSimulation:
    """Main simulation engine for the production line."""
    
    def __init__(
        self,
        workstation_configs: Optional[Dict[str, Dict[str, Any]]] = None,
        storage_capacities: Optional[Dict[str, int]] = None,
        arrival_rate: float = 0.1,
        simulation_duration: float = 480.0,
        # Geriye dönük uyumluluk için eski parametreler
        machine_counts: Optional[Dict[str, int]] = None,
        mean_processing_times: Optional[Dict[str, float]] = None,
        buffer_capacities: Optional[Dict[str, int]] = None,
        mtbf: Optional[Dict[str, float]] = None,
        mttr: Optional[Dict[str, float]] = None,
    ):
        self.env = simpy.Environment()
        self.arrival_rate = arrival_rate
        self.simulation_duration = simulation_duration
        
        # Yeni genel yapı veya eski yapıdan dönüşüm
        if workstation_configs:
            # Yeni genel yapı kullanılıyor
            self.workstation_configs = workstation_configs
            self.storage_capacities = storage_capacities or {}
        else:
            # Eski yapıdan yeni yapıya dönüşüm (geriye dönük uyumluluk)
            self.workstation_configs = {}
            self.storage_capacities = {}
            
            # Eski parametreleri yeni yapıya çevir
            if machine_counts:
                for ws_name, count in machine_counts.items():
                    self.workstation_configs[ws_name] = {
                        "count": count,
                        "processing_time": mean_processing_times.get(ws_name, 10.0) if mean_processing_times else 10.0,
                        "mtbf": mtbf.get(ws_name, 120.0) if mtbf else 120.0,
                        "mttr": mttr.get(ws_name, 15.0) if mttr else 15.0
                    }
            
            if buffer_capacities:
                # Eski buffer isimlerini doğrudan kullan (buffer1, buffer2)
                # Böylece frontend'deki "Tampon 1 / Tampon 2" görünümüyle tutarlı kalır
                for name, capacity in buffer_capacities.items():
                    self.storage_capacities[name] = capacity
            else:
                # Varsayılan storage'lar
                self.storage_capacities = {"storage_1": 20, "storage_2": 20}

        # Varsayılan workstation'lar yoksa oluştur
        if not self.workstation_configs:
            self.workstation_configs = {
                "workstation_1": {"count": 2, "processing_time": 10.0, "mtbf": 120.0, "mttr": 15.0},
                "workstation_2": {"count": 1, "processing_time": 5.0, "mtbf": 200.0, "mttr": 10.0}
            }
        
        if not self.storage_capacities:
            self.storage_capacities = {"storage_1": 20, "storage_2": 20}
        
        # Statistics tracking
        self.parts_completed = 0
        self.parts_started = 0
        self.lead_times = []
        self.queue_lengths = defaultdict(list)  # {node_id: [(time, length), ...]}
        self.machines: Dict[str, List[Machine]] = {}
        self.buffers: Dict[str, simpy.Store] = {}

        # Round-robin counters for machine selection (dinamik)
        self.workstation_counters: Dict[str, int] = {}

        # Time series data collection
        self.time_series_data = []
        self.collection_interval = 5.0  # Collect data every 5 minutes
        
        self._setup_simulation()
    
    def _setup_simulation(self):
        """Initialize all simulation components - Genel fabrika altyapısı."""
        # Create storage areas (depolama alanları)
        for storage_id, capacity in self.storage_capacities.items():
            self.buffers[storage_id] = simpy.Store(
                self.env,
                capacity=capacity
            )
        
        # Create workstations (iş istasyonları)
        # Workstation'lar sırayla işlenir: storage_1 -> workstation_1 -> storage_2 -> workstation_2 -> ...
        storage_list = sorted(self.storage_capacities.keys())
        
        for ws_id, config in self.workstation_configs.items():
            ws_machines = []
            count = config.get("count", 1)
            processing_time = config.get("processing_time", 10.0)
            ws_mtbf = config.get("mtbf", 120.0)
            ws_mttr = config.get("mttr", 15.0)
            
            for i in range(count):
                # Kullanıcı dostu makine ID'leri: cnc_1, cnc_2, qc_1 vb.
                base_name = ws_id
                if ws_id == "quality_control":
                    base_name = "qc"
                machine_id = f"{base_name}_{i+1}"
                
                machine = Machine(
                    self.env,
                    machine_id,
                    processing_time,
                    ws_mtbf,
                    ws_mttr
                )
                ws_machines.append(machine)
            
            self.machines[ws_id] = ws_machines
        
        # Round-robin counter'ları workstation'lar için hazırla
        self.workstation_counters = {ws_id: 0 for ws_id in self.workstation_configs.keys()}
        
        # Start processes
        self.env.process(self._material_arrival())
        self.env.process(self._production_line())
        self.env.process(self._collect_time_series())
    
    def _material_arrival(self):
        """Generate material arrivals based on arrival rate."""
        part_id = 0
        while True:
            # Exponential inter-arrival time
            inter_arrival = random.expovariate(self.arrival_rate)
            yield self.env.timeout(inter_arrival)

            part_id += 1
            self.parts_started += 1
            
            # İlk storage'a koy
            storage_list = sorted(self.buffers.keys())
            if storage_list:
                self.buffers[storage_list[0]].put({
                    "part_id": part_id,
                    "arrival_time": self.env.now
                })
    
    def _production_line(self):
        """Genel fabrika üretim süreci - Dinamik workstation akışı."""
        while True:
            try:
                # İlk storage'dan parça al
                storage_list = sorted(self.buffers.keys())
                if not storage_list:
                    yield self.env.timeout(1.0)
                    continue
                
                first_storage = storage_list[0]
                part = yield self.buffers[first_storage].get()
                
                # Track queue length
                self.queue_lengths[first_storage].append((self.env.now, len(self.buffers[first_storage].items)))
                
                # Workstation'ları sırayla işle
                workstation_list = sorted(self.workstation_configs.keys())
                
                for i, ws_id in enumerate(workstation_list):
                    if ws_id not in self.machines or not self.machines[ws_id]:
                        continue
                    
                    # Round-robin ile makine seç
                    available_machines = [m for m in self.machines[ws_id] if not m.is_broken]
                    if not available_machines:
                        yield self.env.timeout(1.0)
                        continue
                    
                    counter = self.workstation_counters.get(ws_id, 0)
                    counter = (counter + 1) % len(available_machines)
                    self.workstation_counters[ws_id] = counter
                    machine = available_machines[counter]
                    
                    # İşlemi yap
                    yield self.env.process(machine.process(part["part_id"]))
                    
                    # Queue length takibi
                    self.queue_lengths[ws_id].append((self.env.now, machine.resource.count))
                    
                    # Sonraki storage'a koy (varsa)
                    if i < len(storage_list) - 1:
                        next_storage = storage_list[i + 1]
                        if len(self.buffers[next_storage].items) < self.buffers[next_storage].capacity:
                            self.buffers[next_storage].put(part)
                        else:
                            yield self.env.process(self._wait_for_buffer_space(next_storage, part))
                        
                        # Son storage'dan al
                        part = yield self.buffers[next_storage].get()
                        self.queue_lengths[next_storage].append((self.env.now, len(self.buffers[next_storage].items)))
                
                # Tamamlandı
                lead_time = self.env.now - part["arrival_time"]
                self.lead_times.append(lead_time)
                self.parts_completed += 1
                    
            except Exception as e:
                # Log error but continue simulation
                print(f"Error in production line: {e}")
                continue
    
    def _wait_for_buffer_space(self, buffer_name: str, part: Dict):
        """Wait until buffer has space."""
        while len(self.buffers[buffer_name].items) >= self.buffers[buffer_name].capacity:
            yield self.env.timeout(0.1)
        self.buffers[buffer_name].put(part)
    
    def _collect_time_series(self):
        """Collect time series data at regular intervals."""
        while True:
            yield self.env.timeout(self.collection_interval)
            
            snapshot = {
                "time": self.env.now,
                "queue_lengths": {},
                "utilizations": {},
                "throughput": self.parts_completed / max(self.env.now, 1) * 60,  # parts per hour
            }
            
            # Collect queue lengths - Dinamik olarak tüm storage ve workstation'lar
            for storage_id in self.buffers.keys():
                snapshot["queue_lengths"][storage_id] = len(self.buffers[storage_id].items)
            
            for ws_id in self.machines.keys():
                total_queue = sum(m.resource.count for m in self.machines[ws_id])
                snapshot["queue_lengths"][ws_id] = total_queue
            
            # Collect utilizations
            for machine_type, machine_list in self.machines.items():
                for machine in machine_list:
                    snapshot["utilizations"][machine.machine_id] = machine.get_utilization(self.env.now)
            
            self.time_series_data.append(snapshot)
    
    def run(self) -> Dict[str, Any]:
        """Run the simulation and return results."""
        self.env.run(until=self.simulation_duration)

        # Calculate metrics
        total_time = max(self.simulation_duration, 0.1)  # Avoid division by zero
        throughput = self.parts_completed / (total_time / 60) if total_time > 0 else 0.0  # parts per hour
        avg_lead_time = sum(self.lead_times) / len(self.lead_times) if self.lead_times else 0.0
        
        # Calculate resource utilizations
        resource_utilizations = {}
        for machine_type, machine_list in self.machines.items():
            for machine in machine_list:
                resource_utilizations[machine.machine_id] = machine.get_utilization(total_time)
        
        # Aggregate utilization by type
        avg_utilizations = {}
        for machine_type, machine_list in self.machines.items():
            if machine_list:
                avg_util = sum(m.get_utilization(total_time) for m in machine_list) / len(machine_list)
                avg_utilizations[machine_type] = avg_util
            else:
                avg_utilizations[machine_type] = 0.0
        
        # Prepare time series data
        time_series = []
        for snapshot in self.time_series_data:
            time_series.append({
                "time": snapshot["time"],
                "queue_lengths": snapshot["queue_lengths"],
                "utilizations": snapshot["utilizations"],
                "throughput": snapshot["throughput"]
            })
        
        # Prepare node status - Dinamik olarak tüm storage ve workstation'lar
        node_status = {}
        
        # Storage statuses (depolama alanları)
        for storage_id, storage in self.buffers.items():
            storage_capacity = max(storage.capacity, 1)
            current_items = len(storage.items)
            utilization = (current_items / storage_capacity) * 100
            
            node_status[storage_id] = {
                "type": "storage",
                "current_capacity": current_items,
                "max_capacity": storage.capacity,
                "utilization": utilization,
                "is_bottleneck": utilization > 85.0
            }
        
        # Workstation machine statuses (iş istasyonu makineleri)
        for workstation_id, machine_list in self.machines.items():
            for machine in machine_list:
                utilization = machine.get_utilization(total_time)
                availability = machine.get_availability(total_time)
                
                # Calculate efficiency safely
                efficiency = 0.0
                if availability > 0 and utilization > 0:
                    efficiency = (availability / 100.0) * (utilization / 100.0) * 100
                
                node_status[machine.machine_id] = {
                    "type": "machine",
                    "workstation_id": workstation_id,  # Genel terim
                    "utilization": utilization,
                    "availability": availability,
                    "efficiency": efficiency,  # OEE-like metric
                    "processed_count": machine.processed_count,
                    "is_bottleneck": utilization > 85.0,
                    "is_broken": machine.is_broken
                }
        
        metrics = {
            "throughput": round(throughput, 2),
            "average_lead_time": round(avg_lead_time, 2),
            "parts_completed": self.parts_completed,
            "parts_started": self.parts_started,
            "resource_utilization": avg_utilizations
        }
        
        return {
            "metrics": metrics,
            "time_series": time_series,
            "node_status": node_status
        }

