import { create } from 'zustand';
import api from '../lib/api';
import type { Language } from '../data/translations';

export type TopologyType = 'pcb_kam' | 'jpb';

export interface NodeOverride {
  processing_time?: number;
  capacity?: number;
  mtbf?: number;
  mttr?: number;
}

export interface SimulationParameters {
  topology_type: TopologyType;
  node_overrides: Record<string, NodeOverride>;
  arrival_rate: number;
  simulation_duration: number;
}

export interface TimeSeriesData {
  time: number;
  queue_lengths: Record<string, number>;
  utilizations: Record<string, number>;
  throughput: number;
}

export interface NodeStatus {
  type: 'source' | 'sink' | 'logistics' | 'storage' | 'quality' | 'production' | 'process';
  utilization: number;
  availability: number;
  efficiency: number;
  processed_count: number;
  queue_length: number;
  is_bottleneck: boolean;
  is_broken: boolean;
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
  topology: {
    type: string;
    nodes: string[];
    edges: [string, string][];
  };
  insights: Insight[];
  simulation_id: string;
  timestamp: string;
}

interface SimulationState {
  // UI State
  language: Language;
  selectedNode: string | null;
  infoPanelOpen: boolean;

  // Simulation State
  parameters: SimulationParameters;
  results: SimulationResults | null;
  savedScenarios: Array<{ name: string; results: SimulationResults; timestamp: string }>;
  isLoading: boolean;
  error: string | null;

  // UI Actions
  setLanguage: (lang: Language) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleInfoPanel: (open?: boolean) => void;

  // Simulation Actions
  setParameters: (params: Partial<SimulationParameters>) => void;
  setTopology: (topology: TopologyType) => void;
  updateNodeOverride: (nodeId: string, override: NodeOverride) => void;
  runSimulation: () => Promise<void>;
  saveScenario: (name: string) => void;
  clearScenarios: () => void;
}

const defaultParameters: SimulationParameters = {
  topology_type: 'pcb_kam',
  node_overrides: {},
  arrival_rate: 0.1,
  simulation_duration: 480,
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
  // UI State
  language: 'tr',
  selectedNode: null,
  infoPanelOpen: false,

  // Simulation State
  parameters: defaultParameters,
  results: null,
  savedScenarios: [],
  isLoading: false,
  error: null,

  // UI Actions
  setLanguage: (lang) => set({ language: lang }),

  setSelectedNode: (nodeId) =>
    set({
      selectedNode: nodeId,
      infoPanelOpen: nodeId !== null,
    }),

  toggleInfoPanel: (open) =>
    set((state) => ({
      infoPanelOpen: open !== undefined ? open : !state.infoPanelOpen,
    })),

  // Simulation Actions
  setParameters: (params) =>
    set((state) => ({
      parameters: { ...state.parameters, ...params },
    })),

  setTopology: (topology) =>
    set(() => ({
      parameters: {
        topology_type: topology,
        node_overrides: {},
        arrival_rate: 0.1,
        simulation_duration: 480,
      },
      results: null,
      selectedNode: null,
      infoPanelOpen: false,
    })),

  updateNodeOverride: (nodeId, override) =>
    set((state) => ({
      parameters: {
        ...state.parameters,
        node_overrides: {
          ...state.parameters.node_overrides,
          [nodeId]: {
            ...state.parameters.node_overrides[nodeId],
            ...override,
          },
        },
      },
    })),

  runSimulation: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<SimulationResults>(
        '/simulate',
        get().parameters
      );
      set({ results: response.data, isLoading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Simulation failed';
      set({
        error: errorMessage,
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
