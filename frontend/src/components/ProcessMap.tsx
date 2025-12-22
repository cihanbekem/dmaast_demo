import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Connection,
  type NodeMouseHandler,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import { getNodeLabel } from '../data/translations';
import MachineNode from './nodes/MachineNode';
import BufferNode from './nodes/BufferNode';
import AnimatedEdge from './edges/AnimatedEdge';

// ═══════════════════════════════════════════════════════════════════════════════
// NODE TYPE MAPPING AND THEMES
// ═══════════════════════════════════════════════════════════════════════════════

const nodeTypes = {
  machine: MachineNode,
  buffer: BufferNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const THEME = {
  pcb_kam: {
    source: '#22c55e',
    sink: '#22c55e',
    logistics: '#6366f1',
    storage: '#3b82f6',
    quality: '#f59e0b',
    production: '#ef4444',
    process: '#8b5cf6',
  },
  jpb: {
    source: '#f97316',
    sink: '#f97316',
    logistics: '#eab308',
    storage: '#fb923c',
    quality: '#a855f7',
    production: '#ec4899',
    process: '#f43f5e',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// WIDE LAYOUT CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const NODE_WIDTH = 200;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 280;
const VERTICAL_GAP = 180;

// ═══════════════════════════════════════════════════════════════════════════════
// PCB + KAM TOPOLOGY (WIDE LAYOUT)
// ═══════════════════════════════════════════════════════════════════════════════

const createPcbKamNodes = (lang: 'tr' | 'en'): Node[] => [
  // Column 1: Suppliers
  {
    id: 'suppliers',
    type: 'buffer',
    position: { x: 0, y: VERTICAL_GAP * 1.5 },
    data: { label: getNodeLabel('suppliers', lang), type: 'source', nodeId: 'suppliers' },
  },

  // Column 2: External Logistics
  {
    id: 'ext_logistics_s2w',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 1, y: VERTICAL_GAP * 1.5 },
    data: { label: getNodeLabel('ext_logistics_s2w', lang), utilization: 0, nodeId: 'ext_logistics_s2w' },
  },

  // Column 3: Split - PCB Line (top) and WM Line (bottom)
  {
    id: 'pcb_sqa',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 2, y: VERTICAL_GAP * 0.5 },
    data: { label: getNodeLabel('pcb_sqa', lang), utilization: 0, nodeId: 'pcb_sqa' },
  },
  {
    id: 'wm_sqa',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 2, y: VERTICAL_GAP * 2.5 },
    data: { label: getNodeLabel('wm_sqa', lang), utilization: 0, nodeId: 'wm_sqa' },
  },

  // Column 4: PCB Warehouse
  {
    id: 'pcb_warehouse',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 3, y: VERTICAL_GAP * 0.5 },
    data: { label: getNodeLabel('pcb_warehouse', lang), capacity: 100, current: 0, nodeId: 'pcb_warehouse' },
  },

  // Column 5: Internal Logistics W→PCB
  {
    id: 'int_log_w2pcb',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 4, y: VERTICAL_GAP * 0.5 },
    data: { label: getNodeLabel('int_log_w2pcb', lang), utilization: 0, nodeId: 'int_log_w2pcb' },
  },

  // Column 6: PCB Production
  {
    id: 'pcb_production',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 5, y: VERTICAL_GAP * 0.5 },
    data: { label: getNodeLabel('pcb_production', lang), utilization: 0, nodeId: 'pcb_production' },
  },

  // Column 7: Internal Logistics PCB→WM
  {
    id: 'int_log_pcb2wm',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 6, y: VERTICAL_GAP * 0.5 },
    data: { label: getNodeLabel('int_log_pcb2wm', lang), utilization: 0, nodeId: 'int_log_pcb2wm' },
  },

  // Column 5: WM Warehouse (merge point)
  {
    id: 'wm_warehouse',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 5, y: VERTICAL_GAP * 2.5 },
    data: { label: getNodeLabel('wm_warehouse', lang), capacity: 100, current: 0, nodeId: 'wm_warehouse' },
  },

  // Column 6: Internal Logistics W→WM
  {
    id: 'int_log_w2wm',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 6, y: VERTICAL_GAP * 2.5 },
    data: { label: getNodeLabel('int_log_w2wm', lang), utilization: 0, nodeId: 'int_log_w2wm' },
  },

  // Column 7: WM Production
  {
    id: 'wm_production',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 7, y: VERTICAL_GAP * 2.5 },
    data: { label: getNodeLabel('wm_production', lang), utilization: 0, nodeId: 'wm_production' },
  },

  // Column 8: External Logistics Out
  {
    id: 'ext_logistics_out',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 8, y: VERTICAL_GAP * 2.5 },
    data: { label: getNodeLabel('ext_logistics_out', lang), utilization: 0, nodeId: 'ext_logistics_out' },
  },

  // Column 9: Customers
  {
    id: 'customers',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 9, y: VERTICAL_GAP * 2.5 },
    data: { label: getNodeLabel('customers', lang), type: 'sink', nodeId: 'customers' },
  },
];

const PCB_KAM_EDGES: Edge[] = [
  // Main entry
  { id: 'e1', source: 'suppliers', target: 'ext_logistics_s2w', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Path 1: PCB Line (70%)
  { id: 'e2', source: 'ext_logistics_s2w', target: 'pcb_sqa', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: '70%', style: { stroke: '#3b82f6' } },
  { id: 'e3', source: 'pcb_sqa', target: 'pcb_warehouse', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4', source: 'pcb_warehouse', target: 'int_log_w2pcb', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5', source: 'int_log_w2pcb', target: 'pcb_production', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6', source: 'pcb_production', target: 'int_log_pcb2wm', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e7', source: 'int_log_pcb2wm', target: 'wm_warehouse', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Path 2: Direct to WM (30%)
  { id: 'e8', source: 'ext_logistics_s2w', target: 'wm_sqa', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: '30%', style: { stroke: '#f59e0b' } },
  { id: 'e9', source: 'wm_sqa', target: 'wm_warehouse', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Final path
  { id: 'e10', source: 'wm_warehouse', target: 'int_log_w2wm', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e11', source: 'int_log_w2wm', target: 'wm_production', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e12', source: 'wm_production', target: 'ext_logistics_out', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e13', source: 'ext_logistics_out', target: 'customers', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// JPB TOPOLOGY (WIDE LAYOUT)
// ═══════════════════════════════════════════════════════════════════════════════

const createJpbNodes = (lang: 'tr' | 'en'): Node[] => [
  // Column 1: Suppliers (3 sources)
  {
    id: 'spring_supplier',
    type: 'buffer',
    position: { x: 0, y: VERTICAL_GAP * 0 },
    data: { label: getNodeLabel('spring_supplier', lang), type: 'source', nodeId: 'spring_supplier' },
  },
  {
    id: 'rm_supplier_1',
    type: 'buffer',
    position: { x: 0, y: VERTICAL_GAP * 1.5 },
    data: { label: getNodeLabel('rm_supplier_1', lang), type: 'source', nodeId: 'rm_supplier_1' },
  },
  {
    id: 'rm_supplier_2',
    type: 'buffer',
    position: { x: 0, y: VERTICAL_GAP * 3 },
    data: { label: getNodeLabel('rm_supplier_2', lang), type: 'source', nodeId: 'rm_supplier_2' },
  },

  // Column 2: External Logistics
  {
    id: 'ext_log_s2w',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 1, y: VERTICAL_GAP * 0 },
    data: { label: getNodeLabel('ext_log_s2w', lang), utilization: 0, nodeId: 'ext_log_s2w' },
  },
  {
    id: 'ext_log_s12w',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 1, y: VERTICAL_GAP * 1.5 },
    data: { label: getNodeLabel('ext_log_s12w', lang), utilization: 0, nodeId: 'ext_log_s12w' },
  },
  {
    id: 'ext_log_s22w',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 1, y: VERTICAL_GAP * 3 },
    data: { label: getNodeLabel('ext_log_s22w', lang), utilization: 0, nodeId: 'ext_log_s22w' },
  },

  // Column 3: Inventories
  {
    id: 'spring_inventory',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 2, y: VERTICAL_GAP * 0 },
    data: { label: getNodeLabel('spring_inventory', lang), capacity: 100, current: 0, nodeId: 'spring_inventory' },
  },
  {
    id: 'lh_building_inv',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 2, y: VERTICAL_GAP * 2.25 },
    data: { label: getNodeLabel('lh_building_inv', lang), capacity: 100, current: 0, nodeId: 'lh_building_inv' },
  },

  // Column 4: Internal Logistics
  {
    id: 'int_log_w2jpb_spring',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 3, y: VERTICAL_GAP * 0 },
    data: { label: getNodeLabel('int_log_w2jpb_spring', lang), utilization: 0, nodeId: 'int_log_w2jpb_spring' },
  },
  {
    id: 'int_log_w2w',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 3, y: VERTICAL_GAP * 2.25 },
    data: { label: getNodeLabel('int_log_w2w', lang), utilization: 0, nodeId: 'int_log_w2w' },
  },

  // Column 5: Material Inventory
  {
    id: 'material_inventory',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 4, y: VERTICAL_GAP * 2.25 },
    data: { label: getNodeLabel('material_inventory', lang), capacity: 100, current: 0, nodeId: 'material_inventory' },
  },

  // Column 6: JPB Production Logistics
  {
    id: 'int_log_w2jpb_mat',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 5, y: VERTICAL_GAP * 2.25 },
    data: { label: getNodeLabel('int_log_w2jpb_mat', lang), utilization: 0, nodeId: 'int_log_w2jpb_mat' },
  },

  // Column 5: JPB Production (merge point)
  {
    id: 'jpb_production',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 5, y: VERTICAL_GAP * 1 },
    data: { label: getNodeLabel('jpb_production', lang), utilization: 0, nodeId: 'jpb_production' },
  },

  // Column 6: QA Flow
  {
    id: 'int_log_jpb2qa',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 6, y: VERTICAL_GAP * 1 },
    data: { label: getNodeLabel('int_log_jpb2qa', lang), utilization: 0, nodeId: 'int_log_jpb2qa' },
  },
  {
    id: 'qa',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 7, y: VERTICAL_GAP * 1 },
    data: { label: getNodeLabel('qa', lang), utilization: 0, nodeId: 'qa' },
  },

  // QA Feedback Loop
  {
    id: 'int_log_qa2w',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 7, y: VERTICAL_GAP * 2.25 },
    data: { label: getNodeLabel('int_log_qa2w', lang), utilization: 0, nodeId: 'int_log_qa2w' },
  },

  // Column 8: Sales & Customers
  {
    id: 'ext_log_sale',
    type: 'machine',
    position: { x: HORIZONTAL_GAP * 8, y: VERTICAL_GAP * 1.5 },
    data: { label: getNodeLabel('ext_log_sale', lang), utilization: 0, nodeId: 'ext_log_sale' },
  },
  {
    id: 'customers',
    type: 'buffer',
    position: { x: HORIZONTAL_GAP * 9, y: VERTICAL_GAP * 1.5 },
    data: { label: getNodeLabel('customers', lang), type: 'sink', nodeId: 'customers' },
  },
];

const JPB_EDGES: Edge[] = [
  // Spring line
  { id: 'je1', source: 'spring_supplier', target: 'ext_log_s2w', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je2', source: 'ext_log_s2w', target: 'spring_inventory', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je3', source: 'spring_inventory', target: 'int_log_w2jpb_spring', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je4', source: 'int_log_w2jpb_spring', target: 'jpb_production', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Raw material line 1
  { id: 'je5', source: 'rm_supplier_1', target: 'ext_log_s12w', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je6', source: 'ext_log_s12w', target: 'lh_building_inv', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Raw material line 2
  { id: 'je7', source: 'rm_supplier_2', target: 'ext_log_s22w', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je8', source: 'ext_log_s22w', target: 'lh_building_inv', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Internal flow
  { id: 'je9', source: 'lh_building_inv', target: 'int_log_w2w', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je10', source: 'int_log_w2w', target: 'material_inventory', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je11', source: 'material_inventory', target: 'int_log_w2jpb_mat', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je12', source: 'int_log_w2jpb_mat', target: 'jpb_production', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Output
  { id: 'je13', source: 'jpb_production', target: 'int_log_jpb2qa', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'je14', source: 'int_log_jpb2qa', target: 'qa', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Sales (90% pass QA)
  { id: 'je15', source: 'qa', target: 'ext_log_sale', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: '90%', style: { stroke: '#22c55e' } },
  { id: 'je16', source: 'material_inventory', target: 'ext_log_sale', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { strokeDasharray: '5,5', stroke: '#6b7280' } },
  { id: 'je17', source: 'ext_log_sale', target: 'customers', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed } },

  // Feedback loop (10% rejection)
  { id: 'je18', source: 'qa', target: 'int_log_qa2w', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, label: '10%', style: { stroke: '#ef4444' } },
  { id: 'je19', source: 'int_log_qa2w', target: 'material_inventory', type: 'animated', animated: true, markerEnd: { type: MarkerType.ArrowClosed }, style: { stroke: '#ef4444' } },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const ProcessMap: React.FC = () => {
  const { results, parameters, language, selectedNode, setSelectedNode } = useSimulationStore();
  const topologyType = parameters.topology_type;
  const theme = THEME[topologyType];

  // Build nodes with styles and live data
  const initialNodes: Node[] = useMemo(() => {
    const baseNodes = topologyType === 'pcb_kam' ? createPcbKamNodes(language) : createJpbNodes(language);
    const nodeStatus = results?.node_status || {};

    return baseNodes.map((node) => {
      const status = nodeStatus[node.id];
      const nodeType = status?.type || 'process';
      const borderColor = theme[nodeType as keyof typeof theme] || theme.process;
      const isSelected = selectedNode === node.id;

      // Update data with live status
      const updatedData = { ...node.data };

      if (status) {
        if (node.type === 'machine') {
          updatedData.utilization = status.utilization || 0;
          updatedData.availability = status.availability || 0;
          updatedData.efficiency = status.efficiency || 0;
          updatedData.isBottleneck = status.is_bottleneck || false;
          updatedData.isBroken = status.is_broken || false;
        } else if (node.type === 'buffer') {
          updatedData.current = status.queue_length || 0;
          updatedData.isBottleneck = status.is_bottleneck || false;
        }
      }

      // Sink node shows completed parts
      if (node.data.type === 'sink' && results) {
        updatedData.current = results.metrics.parts_completed;
      }

      return {
        ...node,
        data: updatedData,
        style: {
          ...node.style,
          borderColor,
          boxShadow: isSelected ? `0 0 0 3px ${borderColor}` : undefined,
          minWidth: NODE_WIDTH,
          minHeight: NODE_HEIGHT,
        },
      };
    });
  }, [topologyType, results, theme, language, selectedNode]);

  // Edges from topology
  const initialEdges: Edge[] = useMemo(() => {
    return topologyType === 'pcb_kam' ? PCB_KAM_EDGES : JPB_EDGES;
  }, [topologyType]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when results, topology, or language change
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when topology changes
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const minimapNodeColor = useCallback(
    (node: Node) => {
      if (node.id === selectedNode) return '#ffffff';
      if (node.data?.isBottleneck) return '#ef4444';
      if (node.data?.isBroken) return '#dc2626';
      if (node.data?.type === 'source') return theme.source;
      if (node.data?.type === 'sink') return theme.sink;
      if (node.type === 'machine') return theme.production;
      return theme.storage;
    },
    [theme, selectedNode]
  );

  return (
    <div className="w-full h-full bg-card rounded-lg border border-border">
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.1, minZoom: 0.3, maxZoom: 1.5 }}
          minZoom={0.1}
          maxZoom={2}
          className="bg-slate-900"
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls className="bg-card border-border" />
          <MiniMap
            className="bg-card border-border"
            nodeColor={minimapNodeColor}
            maskColor="rgba(0,0,0,0.7)"
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ProcessMap;
