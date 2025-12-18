import { create } from 'zustand';
import axios from 'axios';

export interface SimulationParameters {
  machine_counts: {
    cnc: number;
    quality_control: number;
  };
  mean_processing_times: {
    cnc: number;
    quality_control: number;
  };
  arrival_rates: number;
  simulation_duration: number;
  buffer_capacities: {
    buffer1: number;
    buffer2: number;
  };
  mtbf: {
    cnc: number;
    quality_control: number;
  };
  mttr: {
    cnc: number;
    quality_control: number;
  };
}

export interface TimeSeriesData {
  time: number;
  queue_lengths: Record<string, number>;
  utilizations: Record<string, number>;
  throughput: number;
}

export interface NodeStatus {
  type: 'machine' | 'buffer';
  machine_type?: string;
  utilization?: number;
  availability?: number;
  efficiency?: number;
  processed_count?: number;
  is_bottleneck: boolean;
  is_broken?: boolean;
  current_capacity?: number;
  max_capacity?: number;
}

export interface Insight {
  type: 'warning' | 'info' | 'success' | 'suggestion';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SimulationResults {
  metrics: {
    throughput: number;
    average_lead_time: number;
    parts_completed: number;
    parts_started: number;
    resource_utilization: Record<string, number>;
  };
  time_series: TimeSeriesData[];
  node_status: Record<string, NodeStatus>;
  insights: Insight[];
  simulation_id: string;
  timestamp: string;
}

interface SimulationState {
  parameters: SimulationParameters;
  results: SimulationResults | null;
  savedScenarios: Array<{ name: string; results: SimulationResults; timestamp: string }>;
  isLoading: boolean;
  error: string | null;
  setParameters: (params: Partial<SimulationParameters>) => void;
  runSimulation: () => Promise<void>;
  saveScenario: (name: string) => void;
  clearScenarios: () => void;
}

const defaultParameters: SimulationParameters = {
  machine_counts: {
    cnc: 2,
    quality_control: 1,
  },
  mean_processing_times: {
    cnc: 10.0,
    quality_control: 5.0,
  },
  arrival_rates: 0.1,
  simulation_duration: 480.0,
  buffer_capacities: {
    buffer1: 20,
    buffer2: 20,
  },
  mtbf: {
    cnc: 120.0,
    quality_control: 200.0,
  },
  mttr: {
    cnc: 15.0,
    quality_control: 10.0,
  },
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  parameters: defaultParameters,
  results: null,
  savedScenarios: [],
  isLoading: false,
  error: null,

  setParameters: (params) =>
    set((state) => ({
      parameters: { ...state.parameters, ...params },
    })),

  runSimulation: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post<SimulationResults>(
        'http://localhost:8000/simulate',
        get().parameters
      );
      set({ results: response.data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Simulation failed',
        isLoading: false,
      });
    }
  },

  saveScenario: (name: string) => {
    const { results } = get();
    if (results) {
      set((state) => ({
        savedScenarios: [
          ...state.savedScenarios,
          { name, results, timestamp: new Date().toISOString() },
        ],
      }));
    }
  },

  clearScenarios: () => set({ savedScenarios: [] }),
}));

