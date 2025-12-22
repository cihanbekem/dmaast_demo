# Frontend Technical Report - DMaaST Value Chain Digital Twin
# Frontend Teknik Raporu - DMaaST Değer Zinciri Dijital İkizi

[🇬🇧 English](#english-frontend) | [🇹🇷 Türkçe](#türkçe-frontend)

---

<a name="english-frontend"></a>
# 🇬🇧 Frontend Technical Report

## Table of Contents
1. [Architecture Overview](#architecture-overview-frontend)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure-frontend)
4. [State Management (Zustand)](#state-management)
5. [Component Architecture](#component-architecture)
6. [React Flow Integration](#react-flow)
7. [Multi-Language System](#multi-language)
8. [API Integration](#api-integration)
9. [Styling & Theming](#styling)
10. [Performance Optimizations](#performance-frontend)

---

## Architecture Overview

The frontend is built using **React 19** with **TypeScript**, **Vite** as the build tool, and **Tailwind CSS** for styling. It follows a **component-based architecture** with clear separation between UI components, state management, and business logic.

### Core Architecture

```
Frontend Architecture
├── UI Layer (Components)
│   ├── ProcessMap.tsx          # Main topology visualization
│   ├── SimulationControls.tsx  # Parameter input & controls
│   ├── InfoPanel.tsx           # Node details sidebar
│   ├── MetricsPanel.tsx        # Key metrics display
│   ├── Charts.tsx              # Data visualization
│   └── Custom Nodes/Edges      # React Flow extensions
│
├── State Management (Zustand)
│   └── simulationStore.ts      # Centralized state
│
├── Data Layer
│   ├── translations.ts         # Multi-language content
│   └── api.ts                 # API client
│
└── Utilities
    └── utils.ts               # Helper functions
```

### Design Principles

1. **Component Composition**: Small, reusable components
2. **Unidirectional Data Flow**: State flows down, events flow up
3. **Type Safety**: Full TypeScript coverage
4. **Performance**: Memoization and lazy loading
5. **Accessibility**: Semantic HTML and ARIA labels

---

## Technology Stack

### Core Framework
- **React 19**: Latest React with concurrent features
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server

### UI Libraries
- **React Flow 11**: Graph visualization library
- **Recharts**: Charting library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### State Management
- **Zustand**: Lightweight state management

### HTTP Client
- **Axios**: Promise-based HTTP client

### Build & Dev Tools
- **Vite**: Build tool
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProcessMap.tsx           # Main topology map
│   │   ├── SimulationControls.tsx   # Control panel
│   │   ├── InfoPanel.tsx            # Node info sidebar
│   │   ├── MetricsPanel.tsx         # Metrics display
│   │   ├── Charts.tsx               # Charts component
│   │   ├── InsightsPanel.tsx        # Insights display
│   │   ├── ScenarioComparison.tsx   # Scenario comparison
│   │   ├── OperationalImpactPanel.tsx
│   │   ├── ErrorBoundary.tsx        # Error handling
│   │   ├── nodes/
│   │   │   ├── MachineNode.tsx      # Custom machine node
│   │   │   └── BufferNode.tsx       # Custom buffer node
│   │   └── edges/
│   │       └── AnimatedEdge.tsx     # Animated edge
│   │
│   ├── store/
│   │   └── simulationStore.ts       # Zustand store
│   │
│   ├── data/
│   │   └── translations.ts          # Translation data
│   │
│   ├── lib/
│   │   ├── api.ts                   # API client
│   │   └── utils.ts                 # Utilities
│   │
│   ├── App.tsx                      # Root component
│   ├── main.tsx                     # Entry point
│   └── index.css                   # Global styles
│
├── public/                          # Static assets
├── dist/                            # Build output
├── Dockerfile                       # Docker config
├── nginx.conf                       # Nginx config
├── vite.config.ts                   # Vite config
├── tailwind.config.js               # Tailwind config
└── package.json                     # Dependencies
```

---

## State Management (Zustand)

### Store Structure

**Location**: `src/store/simulationStore.ts`

**State Interface**:
```typescript
interface SimulationState {
  // UI State
  language: Language;              // 'tr' | 'en'
  selectedNode: string | null;     // Currently selected node ID
  infoPanelOpen: boolean;          // Info panel visibility
  
  // Simulation State
  parameters: SimulationParameters;
  results: SimulationResults | null;
  savedScenarios: Array<{...}>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setLanguage: (lang: Language) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleInfoPanel: (open?: boolean) => void;
  setParameters: (params: Partial<SimulationParameters>) => void;
  setTopology: (topology: TopologyType) => void;
  updateNodeOverride: (nodeId: string, override: NodeOverride) => void;
  runSimulation: () => Promise<void>;
  saveScenario: (name: string) => void;
  clearScenarios: () => void;
}
```

### Key State Properties

**`language`**: Current UI language
- Type: `'tr' | 'en'`
- Default: `'tr'`
- Used by: All components for translations

**`selectedNode`**: Currently clicked node
- Type: `string | null`
- Default: `null`
- Used by: InfoPanel to display node details

**`parameters`**: Simulation parameters
```typescript
interface SimulationParameters {
  topology_type: 'pcb_kam' | 'jpb';
  node_overrides: Record<string, NodeOverride>;
  arrival_rate: number;
  simulation_duration: number;
}
```

**`results`**: Simulation results
```typescript
interface SimulationResults {
  metrics: {
    throughput: number;
    average_lead_time: number;
    parts_completed: number;
    parts_started: number;
    resource_utilization: Record<string, number>;
  };
  time_series: TimeSeriesData[];
  node_status: Record<string, NodeStatus>;
  topology: {...};
  insights: Insight[];
  simulation_id: string;
  timestamp: string;
}
```

### Actions Explained

**`setLanguage`**:
```typescript
setLanguage: (lang) => set({ language: lang })
```
- Updates UI language
- Triggers re-render of all translated components

**`setSelectedNode`**:
```typescript
setSelectedNode: (nodeId) =>
  set({
    selectedNode: nodeId,
    infoPanelOpen: nodeId !== null,
  })
```
- Sets selected node
- Automatically opens InfoPanel

**`runSimulation`**:
```typescript
runSimulation: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.post('/simulate', get().parameters);
    set({ results: response.data, isLoading: false });
  } catch (error) {
    set({ error: errorMessage, isLoading: false });
  }
}
```
- Makes API call
- Updates loading state
- Handles errors
- Stores results

**`setTopology`**:
```typescript
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
  }))
```
- Resets all state for new topology
- Clears previous results
- Resets UI state

---

## Component Architecture

### 1. ProcessMap.tsx - Main Topology Visualization

**Purpose**: Displays the value chain topology using React Flow.

**Key Features**:
- Wide layout (280px horizontal, 180px vertical gaps)
- Clickable nodes
- Live data updates
- Multi-language labels
- Color-coded by node type

**Component Structure**:
```typescript
const ProcessMap: React.FC = () => {
  const { results, parameters, language, selectedNode, setSelectedNode } = useSimulationStore();
  
  // Build nodes with translations
  const initialNodes = useMemo(() => {
    const baseNodes = topologyType === 'pcb_kam' 
      ? createPcbKamNodes(language) 
      : createJpbNodes(language);
    
    return baseNodes.map((node) => {
      // Apply live data
      const status = nodeStatus[node.id];
      // Update node data with status
      return { ...node, data: updatedData };
    });
  }, [topologyType, results, language, selectedNode]);
  
  // Handle node click
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      ...
    />
  );
};
```

**Node Creation**:
```typescript
const createPcbKamNodes = (lang: 'tr' | 'en'): Node[] => [
  {
    id: 'suppliers',
    type: 'buffer',
    position: { x: 0, y: VERTICAL_GAP * 1.5 },
    data: { 
      label: getNodeLabel('suppliers', lang), 
      type: 'source',
      nodeId: 'suppliers' 
    },
  },
  // ... more nodes
];
```

**Layout Constants**:
```typescript
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 280;  // Wide spacing
const VERTICAL_GAP = 180;     // Vertical spacing
```

**Edge Definitions**:
```typescript
const PCB_KAM_EDGES: Edge[] = [
  { 
    id: 'e1', 
    source: 'suppliers', 
    target: 'ext_logistics_s2w',
    type: 'animated',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: '70%',  // Split percentage
    style: { stroke: '#3b82f6' }
  },
  // ... more edges
];
```

**Performance Optimizations**:
- `useMemo` for node/edge creation
- `useCallback` for event handlers
- Conditional rendering based on topology

### 2. SimulationControls.tsx - Control Panel

**Purpose**: Input form for simulation parameters and topology selection.

**Key Features**:
- Topology selector (PCB+KAM vs JPB)
- Parameter inputs (arrival rate, duration)
- Results summary
- Action buttons (Run, Save)

**Component Structure**:
```typescript
const SimulationControls: React.FC = () => {
  const {
    parameters,
    setParameters,
    setTopology,
    runSimulation,
    saveScenario,
    isLoading,
    error,
    results,
    language,
  } = useSimulationStore();
  
  const labels = LABELS[language];
  
  return (
    <div className="...">
      {/* Topology Selector */}
      <div className="grid grid-cols-2 gap-3">
        {TOPOLOGY_INFO.map((topology) => (
          <button onClick={() => handleTopologyChange(topology)}>
            {topology.name[language]}
          </button>
        ))}
      </div>
      
      {/* Parameter Inputs */}
      <input
        value={parameters.arrival_rate}
        onChange={(e) => setParameters({ arrival_rate: parseFloat(e.target.value) })}
      />
      
      {/* Results Summary */}
      {results && <ResultsSummary results={results} />}
      
      {/* Action Buttons */}
      <button onClick={handleRun}>Run Simulation</button>
    </div>
  );
};
```

**Topology Info**:
```typescript
const TOPOLOGY_INFO = {
  pcb_kam: {
    name: { tr: 'PCB + KAM', en: 'PCB + KAM' },
    description: {
      tr: 'PCB üretimi ve Warehouse Manufacturing akışı',
      en: 'PCB production and Warehouse Manufacturing flow',
    },
    color: 'bg-blue-500',
  },
  jpb: {
    name: { tr: 'JPB', en: 'JPB' },
    description: {
      tr: 'JPB montaj hattı - Spring ve hammadde besleme',
      en: 'JPB assembly line - Spring and raw material supply',
    },
    color: 'bg-orange-500',
  },
};
```

### 3. InfoPanel.tsx - Node Details Sidebar

**Purpose**: Displays detailed information about selected node.

**Key Features**:
- Slide-in animation from right
- Multi-language content
- Code explanations
- Live status from simulation
- Status badges

**Component Structure**:
```typescript
const InfoPanel: React.FC = () => {
  const { selectedNode, infoPanelOpen, language, toggleInfoPanel, results } = useSimulationStore();
  
  const translation = selectedNode 
    ? getNodeTranslation(selectedNode, language) 
    : null;
  
  const nodeStatus = selectedNode && results?.node_status?.[selectedNode];
  
  if (!infoPanelOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-96 ... animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <h2>{labels.title}</h2>
        <button onClick={() => toggleInfoPanel(false)}>X</button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {translation && (
          <>
            {/* Node Title */}
            <h3>{getNodeLabel(selectedNode, language)}</h3>
            
            {/* Description */}
            <p>{translation.content.description}</p>
            
            {/* Code Meaning */}
            {translation.specificCode && (
              <div>
                <code>{translation.specificCode.code}</code>
                <p>{translation.specificCode.meaning}</p>
              </div>
            )}
            
            {/* Live Status */}
            {nodeStatus && <LiveStatus status={nodeStatus} />}
          </>
        )}
      </div>
    </div>
  );
};
```

**Translation Lookup**:
```typescript
export function getNodeTranslation(
  nodeId: string,
  lang: Language
): { content: TranslationContent; codeHint?: string; specificCode?: TranslationCode } | null {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) return null;
  
  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return null;
  
  const content = box[lang];
  let specificCode: TranslationCode | undefined;
  
  if (mapping.codeHint && content.codes) {
    specificCode = content.codes.find((c) => c.code === mapping.codeHint);
  }
  
  return { content, codeHint: mapping.codeHint, specificCode };
}
```

**Live Status Display**:
```typescript
{nodeStatus && (
  <div className="grid grid-cols-2 gap-3">
    <div>
      <div>Utilization</div>
      <div>{nodeStatus.utilization}%</div>
      <ProgressBar value={nodeStatus.utilization} />
    </div>
    <div>
      <div>Availability</div>
      <div>{nodeStatus.availability}%</div>
      <ProgressBar value={nodeStatus.availability} />
    </div>
    {/* More metrics */}
  </div>
)}
```

### 4. Custom Node Components

#### MachineNode.tsx

**Purpose**: Custom React Flow node for processing nodes.

**Features**:
- Utilization progress bar
- Availability & efficiency display
- Bottleneck indicator
- Broken state indicator
- Icon based on node type

**Component Structure**:
```typescript
const MachineNode: React.FC<NodeProps<MachineNodeData>> = ({ data, selected }) => {
  const {
    label,
    utilization = 0,
    availability = 100,
    efficiency = 0,
    isBottleneck = false,
    isBroken = false,
    nodeId,
  } = data;
  
  const Icon = () => getNodeIcon(nodeId);
  
  return (
    <div className={cn(
      'px-4 py-3 ... min-w-[200px]',
      isBottleneck && 'pulse-bottleneck border-red-500',
      selected && 'ring-2 ring-primary',
      isBroken && 'border-red-600 bg-red-950/20'
    )}>
      <Handle type="target" position={Position.Left} />
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon />
        <div className="font-semibold">{label}</div>
        {isBottleneck && <AlertTriangle />}
        {isBroken && <PulseDot />}
      </div>
      
      {/* Utilization Bar */}
      <ProgressBar value={utilization} color={getColor(utilization)} />
      
      {/* Metrics */}
      <div className="grid grid-cols-2">
        <div>Availability: {availability}%</div>
        <div>Efficiency: {efficiency}%</div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
```

**Icon Selection**:
```typescript
const getNodeIcon = (nodeId?: string) => {
  if (!nodeId) return <Cog />;
  if (nodeId.includes('log')) return <Truck />;
  if (nodeId.includes('qa') || nodeId.includes('sqa')) return <CheckCircle />;
  return <Cog />;
};
```

#### BufferNode.tsx

**Purpose**: Custom React Flow node for storage/buffer nodes.

**Features**:
- Capacity display
- Current level indicator
- Source/sink indicators
- Different icons for warehouse/inventory

**Component Structure**:
```typescript
const BufferNode: React.FC<NodeProps<BufferNodeData>> = ({ data, selected }) => {
  const { label, type, capacity = 100, current = 0, isBottleneck = false, nodeId } = data;
  
  const utilization = capacity > 0 ? (current / capacity) * 100 : 0;
  const isSource = type === 'source';
  const isSink = type === 'sink';
  
  return (
    <div className={cn(
      'px-4 py-3 ... min-w-[180px]',
      isSource && 'border-emerald-500',
      isSink && 'border-emerald-500',
      selected && 'ring-2 ring-primary'
    )}>
      {!isSource && <Handle type="target" />}
      
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon />
        <div className="font-semibold">{label}</div>
      </div>
      
      {/* Capacity Display */}
      {!isSource && !isSink && (
        <>
          <div>Capacity: {current} / {capacity}</div>
          <ProgressBar value={utilization} />
        </>
      )}
      
      {/* Sink Display */}
      {isSink && (
        <div>
          <div>Completed</div>
          <div className="text-xl font-bold">{current}</div>
        </div>
      )}
      
      {!isSink && <Handle type="source" />}
    </div>
  );
};
```

### 5. Charts.tsx - Data Visualization

**Purpose**: Displays simulation results as charts.

**Features**:
- Bottleneck evolution (line chart)
- Equipment effectiveness (bar chart)
- Responsive design
- Dark theme

**Component Structure**:
```typescript
const Charts: React.FC = () => {
  const { results } = useSimulationStore();
  
  // Prepare bottleneck data
  const bottleneckData = useMemo(() => {
    if (!results) return [];
    
    return results.time_series.map((snapshot) => ({
      time: snapshot.time,
      'Queue 1': snapshot.queue_lengths.buffer1 || 0,
      'Queue 2': snapshot.queue_lengths.buffer2 || 0,
      'Throughput': snapshot.throughput || 0,
    }));
  }, [results]);
  
  // Prepare equipment data
  const equipmentData = useMemo(() => {
    if (!results) return [];
    
    return Object.entries(results.node_status)
      .filter(([_, status]) => 
        ['production', 'quality', 'logistics', 'process'].includes(status.type)
      )
      .map(([id, status]) => ({
        name: id.toUpperCase(),
        Availability: status.availability || 0,
        Performance: status.utilization || 0,
        Efficiency: status.efficiency || 0,
      }));
  }, [results]);
  
  return (
    <div className="space-y-6">
      {/* Bottleneck Chart */}
      <LineChart data={bottleneckData}>
        <Line dataKey="Queue 1" stroke="#3b82f6" />
        <Line dataKey="Queue 2" stroke="#10b981" />
        <Line dataKey="Throughput" stroke="#ef4444" />
      </LineChart>
      
      {/* Equipment Chart */}
      <BarChart data={equipmentData}>
        <Bar dataKey="Availability" fill="#3b82f6" />
        <Bar dataKey="Performance" fill="#10b981" />
        <Bar dataKey="Efficiency" fill="#f59e0b" />
      </BarChart>
    </div>
  );
};
```

---

## React Flow Integration

### Setup

```typescript
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
```

### Node Types Registration

```typescript
const nodeTypes = {
  machine: MachineNode,
  buffer: BufferNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};
```

### ReactFlow Component

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onNodeClick={onNodeClick}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  fitViewOptions={{ padding: 0.1, minZoom: 0.3, maxZoom: 1.5 }}
  minZoom={0.1}
  maxZoom={2}
  className="bg-slate-900"
>
  <Background color="#1e293b" gap={20} />
  <Controls />
  <MiniMap nodeColor={minimapNodeColor} />
</ReactFlow>
```

### Node State Management

```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// Update when data changes
React.useEffect(() => {
  setNodes(initialNodes);
}, [initialNodes, setNodes]);
```

---

## Multi-Language System

### Translation Data Structure

**Location**: `src/data/translations.ts`

```typescript
export const translationData = {
  common_boxes: [
    {
      key: "suppliers",
      label: "Suppliers",
      tr: {
        title: "Tedarikçiler",
        description: "Ürün veya ham madde/komponenti üreten ve firmaya gönderen dış tedarikçilerdir.",
      },
      en: {
        title: "Suppliers",
        description: "External suppliers that manufacture and deliver materials...",
      },
    },
    {
      key: "ext_logistics",
      label: "Ext. Logistics",
      tr: {
        title: "Dış Lojistik",
        description: "Dış lojistik/nakliye firmasıdır...",
        codes: [
          { code: "S2W", meaning: "Supplier → Warehouse (tedarikçiden depoya)" },
          // ...
        ],
      },
      en: { /* ... */ },
    },
    // ... more boxes
  ],
};
```

### Node ID to Translation Key Mapping

```typescript
const NODE_KEY_MAP: Record<string, { key: string; codeHint?: string }> = {
  suppliers: { key: "suppliers" },
  ext_logistics_s2w: { key: "ext_logistics", codeHint: "S2W" },
  pcb_sqa: { key: "qa" },
  pcb_warehouse: { key: "warehouse_inventory" },
  // ... more mappings
};
```

### Helper Functions

**`getNodeTranslation`**:
```typescript
export function getNodeTranslation(
  nodeId: string,
  lang: Language
): { content: TranslationContent; codeHint?: string; specificCode?: TranslationCode } | null {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) return null;
  
  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return null;
  
  const content = box[lang];
  let specificCode: TranslationCode | undefined;
  
  if (mapping.codeHint && content.codes) {
    specificCode = content.codes.find((c) => c.code === mapping.codeHint);
  }
  
  return { content, codeHint: mapping.codeHint, specificCode };
}
```

**`getNodeLabel`**:
```typescript
export function getNodeLabel(nodeId: string, lang: Language): string {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) {
    // Fallback: convert ID to readable format
    return nodeId.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  
  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return nodeId;
  
  const title = box[lang].title;
  
  if (mapping.codeHint) {
    return `${title} (${mapping.codeHint})`;
  }
  
  return title;
}
```

### Usage in Components

```typescript
const { language } = useSimulationStore();
const label = getNodeLabel('ext_logistics_s2w', language);
// Turkish: "Dış Lojistik (S2W)"
// English: "External Logistics (S2W)"
```

---

## API Integration

### API Client

**Location**: `src/lib/api.ts`

```typescript
import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.PROD) {
    return '/api';  // Nginx proxy in production
  }
  
  return 'http://localhost:8000';  // Direct connection in dev
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Usage in Store

```typescript
runSimulation: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.post<SimulationResults>(
      '/simulate',
      get().parameters
    );
    set({ results: response.data, isLoading: false });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Simulation failed',
      isLoading: false,
    });
  }
}
```

### Environment Configuration

**Development** (`vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

**Production** (`nginx.conf`):
```nginx
location /api/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Styling & Theming

### Tailwind CSS Configuration

**Location**: `tailwind.config.js`

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... more colors
      },
    },
  },
  plugins: [],
};
```

### CSS Variables

**Location**: `src/index.css`

```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --primary: 217.2 91.2% 59.8%;
  /* ... more variables */
}
```

### Custom Animations

```css
@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

.pulse-bottleneck {
  animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in-right 0.3s ease-out forwards;
}
```

### Theme Colors by Topology

```typescript
const THEME = {
  pcb_kam: {
    source: '#22c55e',      // green
    logistics: '#6366f1',   // indigo
    storage: '#3b82f6',     // blue
    production: '#ef4444',  // red
  },
  jpb: {
    source: '#f97316',      // orange
    logistics: '#eab308',   // yellow
    storage: '#fb923c',     // orange light
    production: '#ec4899',  // pink
  },
};
```

---

## Performance Optimizations

### Memoization

**useMemo for Expensive Calculations**:
```typescript
const initialNodes = useMemo(() => {
  // Expensive node creation logic
  return baseNodes.map((node) => {
    // ... processing
  });
}, [topologyType, results, language, selectedNode]);
```

**useCallback for Event Handlers**:
```typescript
const onNodeClick = useCallback(
  (_event, node) => {
    setSelectedNode(node.id);
  },
  [setSelectedNode]
);
```

### Conditional Rendering

```typescript
{infoPanelOpen && <InfoPanel />}
{results && <ResultsSummary results={results} />}
```

### Lazy Loading

React Flow components are loaded on demand:
```typescript
const nodeTypes = {
  machine: MachineNode,  // Loaded when needed
  buffer: BufferNode,
};
```

### Virtualization

React Flow handles large graphs efficiently with internal virtualization.

---

## Error Handling

### Error Boundary

**Location**: `src/components/ErrorBoundary.tsx`

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
try {
  const response = await api.post('/simulate', parameters);
  set({ results: response.data });
} catch (error) {
  const errorMessage = axios.isAxiosError(error)
    ? error.response?.data?.detail || error.message
    : 'Simulation failed';
  set({ error: errorMessage });
}
```

---

## Build & Deployment

### Vite Build

```bash
npm run build
```

**Output**: `dist/` directory with optimized production build

### Docker Build

**Multi-stage build**:
1. **Builder stage**: Install dependencies and build
2. **Production stage**: Copy built files to nginx

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

**Location**: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

<a name="türkçe-frontend"></a>
# 🇹🇷 Frontend Teknik Raporu

## İçindekiler
1. [Mimari Genel Bakış](#mimari-genel-bakış-frontend)
2. [Teknoloji Yığını](#teknoloji-yığını-frontend)
3. [Proje Yapısı](#proje-yapısı-frontend-tr)
4. [State Yönetimi (Zustand)](#state-yönetimi-tr)
5. [Bileşen Mimarisi](#bileşen-mimarisi-tr)
6. [React Flow Entegrasyonu](#react-flow-tr)
7. [Çoklu Dil Sistemi](#çoklu-dil-tr)
8. [API Entegrasyonu](#api-entegrasyonu-tr)
9. [Stil ve Tema](#stil-tr)
10. [Performans Optimizasyonları](#performans-frontend-tr)

---

## Mimari Genel Bakış

Frontend, **React 19**, **TypeScript**, **Vite** build aracı ve **Tailwind CSS** kullanılarak oluşturulmuştur. UI bileşenleri, state yönetimi ve iş mantığı arasında net ayrım olan **bileşen tabanlı bir mimari** izler.

### Temel Mimari

```
Frontend Mimarisi
├── UI Katmanı (Bileşenler)
│   ├── ProcessMap.tsx          # Ana topoloji görselleştirme
│   ├── SimulationControls.tsx  # Parametre girişi ve kontroller
│   ├── InfoPanel.tsx           # Düğüm detayları sidebar'ı
│   ├── MetricsPanel.tsx        # Ana metrikler görüntüleme
│   ├── Charts.tsx              # Veri görselleştirme
│   └── Özel Düğümler/Kenarlar  # React Flow uzantıları
│
├── State Yönetimi (Zustand)
│   └── simulationStore.ts      # Merkezi state
│
├── Veri Katmanı
│   ├── translations.ts         # Çoklu dil içeriği
│   └── api.ts                 # API istemcisi
│
└── Yardımcılar
    └── utils.ts               # Yardımcı fonksiyonlar
```

### Tasarım Prensipleri

1. **Bileşen Kompozisyonu**: Küçük, yeniden kullanılabilir bileşenler
2. **Tek Yönlü Veri Akışı**: State aşağı akar, olaylar yukarı akar
3. **Tip Güvenliği**: Tam TypeScript kapsamı
4. **Performans**: Memoization ve lazy loading
5. **Erişilebilirlik**: Anlamsal HTML ve ARIA etiketleri

---

## Teknoloji Yığını

### Temel Framework
- **React 19**: Concurrent özelliklerle en son React
- **TypeScript**: Tip güvenli JavaScript
- **Vite**: Hızlı build aracı ve dev sunucusu

### UI Kütüphaneleri
- **React Flow 11**: Graf görselleştirme kütüphanesi
- **Recharts**: Grafik kütüphanesi
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: İkon kütüphanesi

### State Yönetimi
- **Zustand**: Hafif state yönetimi

### HTTP İstemcisi
- **Axios**: Promise tabanlı HTTP istemcisi

### Build & Dev Araçları
- **Vite**: Build aracı
- **ESLint**: Kod linting
- **PostCSS**: CSS işleme
- **Autoprefixer**: CSS vendor prefixing

---

## Proje Yapısı

```
frontend/
├── src/
│   ├── components/
│   │   ├── ProcessMap.tsx           # Ana topoloji haritası
│   │   ├── SimulationControls.tsx   # Kontrol paneli
│   │   ├── InfoPanel.tsx            # Düğüm bilgi sidebar'ı
│   │   ├── MetricsPanel.tsx         # Metrikler görüntüleme
│   │   ├── Charts.tsx               # Grafikler bileşeni
│   │   ├── InsightsPanel.tsx        # İçgörüler görüntüleme
│   │   ├── ScenarioComparison.tsx   # Senaryo karşılaştırma
│   │   ├── OperationalImpactPanel.tsx
│   │   ├── ErrorBoundary.tsx        # Hata yönetimi
│   │   ├── nodes/
│   │   │   ├── MachineNode.tsx      # Özel makine düğümü
│   │   │   └── BufferNode.tsx      # Özel tampon düğümü
│   │   └── edges/
│   │       └── AnimatedEdge.tsx     # Animasyonlu kenar
│   │
│   ├── store/
│   │   └── simulationStore.ts       # Zustand store
│   │
│   ├── data/
│   │   └── translations.ts         # Çeviri verileri
│   │
│   ├── lib/
│   │   ├── api.ts                   # API istemcisi
│   │   └── utils.ts                 # Yardımcılar
│   │
│   ├── App.tsx                      # Kök bileşen
│   ├── main.tsx                     # Giriş noktası
│   └── index.css                    # Global stiller
│
├── public/                          # Statik varlıklar
├── dist/                            # Build çıktısı
├── Dockerfile                       # Docker yapılandırması
├── nginx.conf                       # Nginx yapılandırması
├── vite.config.ts                   # Vite yapılandırması
├── tailwind.config.js               # Tailwind yapılandırması
└── package.json                     # Bağımlılıklar
```

---

## State Yönetimi (Zustand)

### Store Yapısı

**Konum**: `src/store/simulationStore.ts`

**State Arayüzü**:
```typescript
interface SimulationState {
  // UI Durumu
  language: Language;              // 'tr' | 'en'
  selectedNode: string | null;     // Şu anda seçili düğüm ID'si
  infoPanelOpen: boolean;          // Info panel görünürlüğü
  
  // Simülasyon Durumu
  parameters: SimulationParameters;
  results: SimulationResults | null;
  savedScenarios: Array<{...}>;
  isLoading: boolean;
  error: string | null;
  
  // Aksiyonlar
  setLanguage: (lang: Language) => void;
  setSelectedNode: (nodeId: string | null) => void;
  toggleInfoPanel: (open?: boolean) => void;
  setParameters: (params: Partial<SimulationParameters>) => void;
  setTopology: (topology: TopologyType) => void;
  updateNodeOverride: (nodeId: string, override: NodeOverride) => void;
  runSimulation: () => Promise<void>;
  saveScenario: (name: string) => void;
  clearScenarios: () => void;
}
```

### Temel State Özellikleri

**`language`**: Mevcut UI dili
- Tip: `'tr' | 'en'`
- Varsayılan: `'tr'`
- Kullanım: Tüm bileşenlerde çeviriler için

**`selectedNode`**: Şu anda tıklanan düğüm
- Tip: `string | null`
- Varsayılan: `null`
- Kullanım: InfoPanel'de düğüm detaylarını göstermek için

**`parameters`**: Simülasyon parametreleri
```typescript
interface SimulationParameters {
  topology_type: 'pcb_kam' | 'jpb';
  node_overrides: Record<string, NodeOverride>;
  arrival_rate: number;
  simulation_duration: number;
}
```

**`results`**: Simülasyon sonuçları
```typescript
interface SimulationResults {
  metrics: {
    throughput: number;
    average_lead_time: number;
    parts_completed: number;
    parts_started: number;
    resource_utilization: Record<string, number>;
  };
  time_series: TimeSeriesData[];
  node_status: Record<string, NodeStatus>;
  topology: {...};
  insights: Insight[];
  simulation_id: string;
  timestamp: string;
}
```

### Aksiyonlar Açıklaması

**`setLanguage`**:
```typescript
setLanguage: (lang) => set({ language: lang })
```
- UI dilini günceller
- Tüm çevrilmiş bileşenlerin yeniden render'ını tetikler

**`setSelectedNode`**:
```typescript
setSelectedNode: (nodeId) =>
  set({
    selectedNode: nodeId,
    infoPanelOpen: nodeId !== null,
  })
```
- Seçili düğümü ayarlar
- InfoPanel'i otomatik olarak açar

**`runSimulation`**:
```typescript
runSimulation: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.post('/simulate', get().parameters);
    set({ results: response.data, isLoading: false });
  } catch (error) {
    set({ error: errorMessage, isLoading: false });
  }
}
```
- API çağrısı yapar
- Yükleme durumunu günceller
- Hataları yönetir
- Sonuçları saklar

**`setTopology`**:
```typescript
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
  }))
```
- Yeni topoloji için tüm state'i sıfırlar
- Önceki sonuçları temizler
- UI durumunu sıfırlar

---

## Bileşen Mimarisi

### 1. ProcessMap.tsx - Ana Topoloji Görselleştirme

**Amaç**: React Flow kullanarak değer zinciri topolojisini gösterir.

**Temel Özellikler**:
- Geniş düzen (280px yatay, 180px dikey boşluklar)
- Tıklanabilir düğümler
- Canlı veri güncellemeleri
- Çoklu dil etiketleri
- Düğüm tipine göre renk kodlama

**Bileşen Yapısı**:
```typescript
const ProcessMap: React.FC = () => {
  const { results, parameters, language, selectedNode, setSelectedNode } = useSimulationStore();
  
  // Çevirilerle düğümleri oluştur
  const initialNodes = useMemo(() => {
    const baseNodes = topologyType === 'pcb_kam' 
      ? createPcbKamNodes(language) 
      : createJpbNodes(language);
    
    return baseNodes.map((node) => {
      // Canlı veriyi uygula
      const status = nodeStatus[node.id];
      // Durumla düğüm verisini güncelle
      return { ...node, data: updatedData };
    });
  }, [topologyType, results, language, selectedNode]);
  
  // Düğüm tıklama işleyicisi
  const onNodeClick = useCallback((_event, node) => {
    setSelectedNode(node.id);
  }, [setSelectedNode]);
  
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      ...
    />
  );
};
```

**Düğüm Oluşturma**:
```typescript
const createPcbKamNodes = (lang: 'tr' | 'en'): Node[] => [
  {
    id: 'suppliers',
    type: 'buffer',
    position: { x: 0, y: VERTICAL_GAP * 1.5 },
    data: { 
      label: getNodeLabel('suppliers', lang), 
      type: 'source',
      nodeId: 'suppliers' 
    },
  },
  // ... daha fazla düğüm
];
```

**Düzen Sabitleri**:
```typescript
const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 280;  // Geniş boşluk
const VERTICAL_GAP = 180;     // Dikey boşluk
```

**Kenar Tanımları**:
```typescript
const PCB_KAM_EDGES: Edge[] = [
  { 
    id: 'e1', 
    source: 'suppliers', 
    target: 'ext_logistics_s2w',
    type: 'animated',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    label: '70%',  // Bölünme yüzdesi
    style: { stroke: '#3b82f6' }
  },
  // ... daha fazla kenar
];
```

**Performans Optimizasyonları**:
- Düğüm/kenar oluşturma için `useMemo`
- Olay işleyicileri için `useCallback`
- Topolojiye göre koşullu render

### 2. SimulationControls.tsx - Kontrol Paneli

**Amaç**: Simülasyon parametreleri ve topoloji seçimi için giriş formu.

**Temel Özellikler**:
- Topoloji seçici (PCB+KAM vs JPB)
- Parametre girişleri (geliş hızı, süre)
- Sonuç özeti
- Aksiyon butonları (Çalıştır, Kaydet)

**Bileşen Yapısı**:
```typescript
const SimulationControls: React.FC = () => {
  const {
    parameters,
    setParameters,
    setTopology,
    runSimulation,
    saveScenario,
    isLoading,
    error,
    results,
    language,
  } = useSimulationStore();
  
  const labels = LABELS[language];
  
  return (
    <div className="...">
      {/* Topoloji Seçici */}
      <div className="grid grid-cols-2 gap-3">
        {TOPOLOGY_INFO.map((topology) => (
          <button onClick={() => handleTopologyChange(topology)}>
            {topology.name[language]}
          </button>
        ))}
      </div>
      
      {/* Parametre Girişleri */}
      <input
        value={parameters.arrival_rate}
        onChange={(e) => setParameters({ arrival_rate: parseFloat(e.target.value) })}
      />
      
      {/* Sonuç Özeti */}
      {results && <ResultsSummary results={results} />}
      
      {/* Aksiyon Butonları */}
      <button onClick={handleRun}>Simülasyonu Başlat</button>
    </div>
  );
};
```

**Topoloji Bilgisi**:
```typescript
const TOPOLOGY_INFO = {
  pcb_kam: {
    name: { tr: 'PCB + KAM', en: 'PCB + KAM' },
    description: {
      tr: 'PCB üretimi ve Warehouse Manufacturing akışı',
      en: 'PCB production and Warehouse Manufacturing flow',
    },
    color: 'bg-blue-500',
  },
  jpb: {
    name: { tr: 'JPB', en: 'JPB' },
    description: {
      tr: 'JPB montaj hattı - Spring ve hammadde besleme',
      en: 'JPB assembly line - Spring and raw material supply',
    },
    color: 'bg-orange-500',
  },
};
```

### 3. InfoPanel.tsx - Düğüm Detayları Sidebar'ı

**Amaç**: Seçili düğüm hakkında detaylı bilgi gösterir.

**Temel Özellikler**:
- Sağdan kaydırma animasyonu
- Çoklu dil içeriği
- Kod açıklamaları
- Simülasyondan canlı durum
- Durum rozetleri

**Bileşen Yapısı**:
```typescript
const InfoPanel: React.FC = () => {
  const { selectedNode, infoPanelOpen, language, toggleInfoPanel, results } = useSimulationStore();
  
  const translation = selectedNode 
    ? getNodeTranslation(selectedNode, language) 
    : null;
  
  const nodeStatus = selectedNode && results?.node_status?.[selectedNode];
  
  if (!infoPanelOpen) return null;
  
  return (
    <div className="fixed right-0 top-0 h-full w-96 ... animate-slide-in">
      {/* Başlık */}
      <div className="flex items-center justify-between p-4">
        <h2>{labels.title}</h2>
        <button onClick={() => toggleInfoPanel(false)}>X</button>
      </div>
      
      {/* İçerik */}
      <div className="flex-1 overflow-y-auto p-4">
        {translation && (
          <>
            {/* Düğüm Başlığı */}
            <h3>{getNodeLabel(selectedNode, language)}</h3>
            
            {/* Açıklama */}
            <p>{translation.content.description}</p>
            
            {/* Kod Anlamı */}
            {translation.specificCode && (
              <div>
                <code>{translation.specificCode.code}</code>
                <p>{translation.specificCode.meaning}</p>
              </div>
            )}
            
            {/* Canlı Durum */}
            {nodeStatus && <LiveStatus status={nodeStatus} />}
          </>
        )}
      </div>
    </div>
  );
};
```

**Çeviri Arama**:
```typescript
export function getNodeTranslation(
  nodeId: string,
  lang: Language
): { content: TranslationContent; codeHint?: string; specificCode?: TranslationCode } | null {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) return null;
  
  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return null;
  
  const content = box[lang];
  let specificCode: TranslationCode | undefined;
  
  if (mapping.codeHint && content.codes) {
    specificCode = content.codes.find((c) => c.code === mapping.codeHint);
  }
  
  return { content, codeHint: mapping.codeHint, specificCode };
}
```

**Canlı Durum Görüntüleme**:
```typescript
{nodeStatus && (
  <div className="grid grid-cols-2 gap-3">
    <div>
      <div>Kullanım</div>
      <div>{nodeStatus.utilization}%</div>
      <ProgressBar value={nodeStatus.utilization} />
    </div>
    <div>
      <div>Kullanılabilirlik</div>
      <div>{nodeStatus.availability}%</div>
      <ProgressBar value={nodeStatus.availability} />
    </div>
    {/* Daha fazla metrik */}
  </div>
)}
```

### 4. Özel Düğüm Bileşenleri

#### MachineNode.tsx

**Amaç**: İşleme düğümleri için özel React Flow düğümü.

**Özellikler**:
- Kullanım ilerleme çubuğu
- Kullanılabilirlik ve verimlilik görüntüleme
- Darboğaz göstergesi
- Arızalı durum göstergesi
- Düğüm tipine göre ikon

**Bileşen Yapısı**:
```typescript
const MachineNode: React.FC<NodeProps<MachineNodeData>> = ({ data, selected }) => {
  const {
    label,
    utilization = 0,
    availability = 100,
    efficiency = 0,
    isBottleneck = false,
    isBroken = false,
    nodeId,
  } = data;
  
  const Icon = () => getNodeIcon(nodeId);
  
  return (
    <div className={cn(
      'px-4 py-3 ... min-w-[200px]',
      isBottleneck && 'pulse-bottleneck border-red-500',
      selected && 'ring-2 ring-primary',
      isBroken && 'border-red-600 bg-red-950/20'
    )}>
      <Handle type="target" position={Position.Left} />
      
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <Icon />
        <div className="font-semibold">{label}</div>
        {isBottleneck && <AlertTriangle />}
        {isBroken && <PulseDot />}
      </div>
      
      {/* Kullanım Çubuğu */}
      <ProgressBar value={utilization} color={getColor(utilization)} />
      
      {/* Metrikler */}
      <div className="grid grid-cols-2">
        <div>Kullanılabilirlik: {availability}%</div>
        <div>Verimlilik: {efficiency}%</div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  );
};
```

**İkon Seçimi**:
```typescript
const getNodeIcon = (nodeId?: string) => {
  if (!nodeId) return <Cog />;
  if (nodeId.includes('log')) return <Truck />;
  if (nodeId.includes('qa') || nodeId.includes('sqa')) return <CheckCircle />;
  return <Cog />;
};
```

#### BufferNode.tsx

**Amaç**: Depolama/tampon düğümleri için özel React Flow düğümü.

**Özellikler**:
- Kapasite görüntüleme
- Mevcut seviye göstergesi
- Kaynak/sink göstergeleri
- Depo/stok için farklı ikonlar

**Bileşen Yapısı**:
```typescript
const BufferNode: React.FC<NodeProps<BufferNodeData>> = ({ data, selected }) => {
  const { label, type, capacity = 100, current = 0, isBottleneck = false, nodeId } = data;
  
  const utilization = capacity > 0 ? (current / capacity) * 100 : 0;
  const isSource = type === 'source';
  const isSink = type === 'sink';
  
  return (
    <div className={cn(
      'px-4 py-3 ... min-w-[180px]',
      isSource && 'border-emerald-500',
      isSink && 'border-emerald-500',
      selected && 'ring-2 ring-primary'
    )}>
      {!isSource && <Handle type="target" />}
      
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <Icon />
        <div className="font-semibold">{label}</div>
      </div>
      
      {/* Kapasite Görüntüleme */}
      {!isSource && !isSink && (
        <>
          <div>Kapasite: {current} / {capacity}</div>
          <ProgressBar value={utilization} />
        </>
      )}
      
      {/* Sink Görüntüleme */}
      {isSink && (
        <div>
          <div>Tamamlanan</div>
          <div className="text-xl font-bold">{current}</div>
        </div>
      )}
      
      {!isSink && <Handle type="source" />}
    </div>
  );
};
```

### 5. Charts.tsx - Veri Görselleştirme

**Amaç**: Simülasyon sonuçlarını grafik olarak gösterir.

**Özellikler**:
- Darboğaz gelişimi (çizgi grafik)
- Ekipman etkinliği (çubuk grafik)
- Duyarlı tasarım
- Karanlık tema

**Bileşen Yapısı**:
```typescript
const Charts: React.FC = () => {
  const { results } = useSimulationStore();
  
  // Darboğaz verisini hazırla
  const bottleneckData = useMemo(() => {
    if (!results) return [];
    
    return results.time_series.map((snapshot) => ({
      time: snapshot.time,
      'Kuyruk 1': snapshot.queue_lengths.buffer1 || 0,
      'Kuyruk 2': snapshot.queue_lengths.buffer2 || 0,
      'Verimlilik': snapshot.throughput || 0,
    }));
  }, [results]);
  
  // Ekipman verisini hazırla
  const equipmentData = useMemo(() => {
    if (!results) return [];
    
    return Object.entries(results.node_status)
      .filter(([_, status]) => 
        ['production', 'quality', 'logistics', 'process'].includes(status.type)
      )
      .map(([id, status]) => ({
        name: id.toUpperCase(),
        Kullanılabilirlik: status.availability || 0,
        Performans: status.utilization || 0,
        Verimlilik: status.efficiency || 0,
      }));
  }, [results]);
  
  return (
    <div className="space-y-6">
      {/* Darboğaz Grafiği */}
      <LineChart data={bottleneckData}>
        <Line dataKey="Kuyruk 1" stroke="#3b82f6" />
        <Line dataKey="Kuyruk 2" stroke="#10b981" />
        <Line dataKey="Verimlilik" stroke="#ef4444" />
      </LineChart>
      
      {/* Ekipman Grafiği */}
      <BarChart data={equipmentData}>
        <Bar dataKey="Kullanılabilirlik" fill="#3b82f6" />
        <Bar dataKey="Performans" fill="#10b981" />
        <Bar dataKey="Verimlilik" fill="#f59e0b" />
      </BarChart>
    </div>
  );
};
```

---

## React Flow Entegrasyonu

### Kurulum

```typescript
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
```

### Düğüm Tipleri Kaydı

```typescript
const nodeTypes = {
  machine: MachineNode,
  buffer: BufferNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};
```

### ReactFlow Bileşeni

```typescript
<ReactFlow
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onNodeClick={onNodeClick}
  nodeTypes={nodeTypes}
  edgeTypes={edgeTypes}
  fitView
  fitViewOptions={{ padding: 0.1, minZoom: 0.3, maxZoom: 1.5 }}
  minZoom={0.1}
  maxZoom={2}
  className="bg-slate-900"
>
  <Background color="#1e293b" gap={20} />
  <Controls />
  <MiniMap nodeColor={minimapNodeColor} />
</ReactFlow>
```

### Düğüm Durum Yönetimi

```typescript
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// Veri değiştiğinde güncelle
React.useEffect(() => {
  setNodes(initialNodes);
}, [initialNodes, setNodes]);
```

---

## Çoklu Dil Sistemi

### Çeviri Veri Yapısı

**Konum**: `src/data/translations.ts`

```typescript
export const translationData = {
  common_boxes: [
    {
      key: "suppliers",
      label: "Suppliers",
      tr: {
        title: "Tedarikçiler",
        description: "Ürün veya ham madde/komponenti üreten ve firmaya gönderen dış tedarikçilerdir.",
      },
      en: {
        title: "Suppliers",
        description: "External suppliers that manufacture and deliver materials...",
      },
    },
    {
      key: "ext_logistics",
      label: "Ext. Logistics",
      tr: {
        title: "Dış Lojistik",
        description: "Dış lojistik/nakliye firmasıdır...",
        codes: [
          { code: "S2W", meaning: "Supplier → Warehouse (tedarikçiden depoya)" },
          // ...
        ],
      },
      en: { /* ... */ },
    },
    // ... daha fazla kutu
  ],
};
```

### Düğüm ID'den Çeviri Anahtarı Eşleme

```typescript
const NODE_KEY_MAP: Record<string, { key: string; codeHint?: string }> = {
  suppliers: { key: "suppliers" },
  ext_logistics_s2w: { key: "ext_logistics", codeHint: "S2W" },
  pcb_sqa: { key: "qa" },
  pcb_warehouse: { key: "warehouse_inventory" },
  // ... daha fazla eşleme
};
```

### Yardımcı Fonksiyonlar

**`getNodeTranslation`**:
```typescript
export function getNodeTranslation(
  nodeId: string,
  lang: Language
): { content: TranslationContent; codeHint?: string; specificCode?: TranslationCode } | null {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) return null;
  
  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return null;
  
  const content = box[lang];
  let specificCode: TranslationCode | undefined;
  
  if (mapping.codeHint && content.codes) {
    specificCode = content.codes.find((c) => c.code === mapping.codeHint);
  }
  
  return { content, codeHint: mapping.codeHint, specificCode };
}
```

**`getNodeLabel`**:
```typescript
export function getNodeLabel(nodeId: string, lang: Language): string {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) {
    // Geri dönüş: ID'yi okunabilir formata çevir
    return nodeId.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  
  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return nodeId;
  
  const title = box[lang].title;
  
  if (mapping.codeHint) {
    return `${title} (${mapping.codeHint})`;
  }
  
  return title;
}
```

### Bileşenlerde Kullanım

```typescript
const { language } = useSimulationStore();
const label = getNodeLabel('ext_logistics_s2w', language);
// Türkçe: "Dış Lojistik (S2W)"
// İngilizce: "External Logistics (S2W)"
```

---

## API Entegrasyonu

### API İstemcisi

**Konum**: `src/lib/api.ts`

```typescript
import axios from 'axios';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  if (import.meta.env.PROD) {
    return '/api';  // Production'da Nginx proxy
  }
  
  return 'http://localhost:8000';  // Dev'de direkt bağlantı
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Store'da Kullanım

```typescript
runSimulation: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await api.post<SimulationResults>(
      '/simulate',
      get().parameters
    );
    set({ results: response.data, isLoading: false });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Simulation failed',
      isLoading: false,
    });
  }
}
```

### Ortam Yapılandırması

**Geliştirme** (`vite.config.ts`):
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

**Production** (`nginx.conf`):
```nginx
location /api/ {
    proxy_pass http://backend:8000/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

---

## Stil ve Tema

### Tailwind CSS Yapılandırması

**Konum**: `tailwind.config.js`

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        // ... daha fazla renk
      },
    },
  },
  plugins: [],
};
```

### CSS Değişkenleri

**Konum**: `src/index.css`

```css
:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --primary: 217.2 91.2% 59.8%;
  /* ... daha fazla değişken */
}
```

### Özel Animasyonlar

```css
@keyframes pulse-red {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
  }
}

.pulse-bottleneck {
  animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in {
  animation: slide-in-right 0.3s ease-out forwards;
}
```

### Topolojiye Göre Tema Renkleri

```typescript
const THEME = {
  pcb_kam: {
    source: '#22c55e',      // yeşil
    logistics: '#6366f1',   // indigo
    storage: '#3b82f6',     // mavi
    production: '#ef4444',  // kırmızı
  },
  jpb: {
    source: '#f97316',      // turuncu
    logistics: '#eab308',   // sarı
    storage: '#fb923c',     // açık turuncu
    production: '#ec4899',  // pembe
  },
};
```

---

## Performans Optimizasyonları

### Memoization

**Pahalı Hesaplamalar için useMemo**:
```typescript
const initialNodes = useMemo(() => {
  // Pahalı düğüm oluşturma mantığı
  return baseNodes.map((node) => {
    // ... işleme
  });
}, [topologyType, results, language, selectedNode]);
```

**Olay İşleyicileri için useCallback**:
```typescript
const onNodeClick = useCallback(
  (_event, node) => {
    setSelectedNode(node.id);
  },
  [setSelectedNode]
);
```

### Koşullu Render

```typescript
{infoPanelOpen && <InfoPanel />}
{results && <ResultsSummary results={results} />}
```

### Lazy Loading

React Flow bileşenleri gerektiğinde yüklenir:
```typescript
const nodeTypes = {
  machine: MachineNode,  // Gerektiğinde yüklenir
  buffer: BufferNode,
};
```

### Sanallaştırma

React Flow, dahili sanallaştırma ile büyük grafikleri verimli bir şekilde işler.

---

## Hata Yönetimi

### Hata Sınırı

**Konum**: `src/components/ErrorBoundary.tsx`

```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Yakalanan hata:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### API Hata Yönetimi

```typescript
try {
  const response = await api.post('/simulate', parameters);
  set({ results: response.data });
} catch (error) {
  const errorMessage = axios.isAxiosError(error)
    ? error.response?.data?.detail || error.message
    : 'Simülasyon başarısız';
  set({ error: errorMessage });
}
```

---

## Build & Deployment

### Vite Build

```bash
npm run build
```

**Çıktı**: Optimize edilmiş production build ile `dist/` dizini

### Docker Build

**Çok aşamalı build**:
1. **Builder aşaması**: Bağımlılıkları yükle ve build et
2. **Production aşaması**: Build edilmiş dosyaları nginx'e kopyala

**Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Yapılandırması

**Konum**: `frontend/nginx.conf`

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    # SPA geri dönüş
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://backend:8000/;
        proxy_set_header Host $host;
    }
    
    # Statik varlık önbellekleme
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Sonuç

Frontend, **modüler**, **performanslı** ve **kullanıcı dostu** bir dijital ikiz arayüzü sağlar. React Flow entegrasyonu, çoklu dil desteği ve detaylı InfoPanel ile kullanıcılar değer zincirlerini kolayca görselleştirebilir ve analiz edebilir.

