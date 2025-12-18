import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useSimulationStore } from '../store/simulationStore';
import MachineNode from './nodes/MachineNode';
import BufferNode from './nodes/BufferNode';
import AnimatedEdge from './edges/AnimatedEdge';

const nodeTypes = {
  machine: MachineNode,
  buffer: BufferNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

const ProcessMap: React.FC = () => {
  const { results } = useSimulationStore();

  // Create nodes based on simulation results
  const initialNodes: Node[] = useMemo(() => {
    if (!results) {
      // Default layout when no simulation has run
      return [
        {
          id: 'material-arrival',
          type: 'buffer',
          position: { x: 50, y: 300 },
          data: { label: 'Hammadde Girişi', type: 'source' },
        },
        {
          id: 'buffer1',
          type: 'buffer',
          position: { x: 250, y: 300 },
          data: { label: 'Tampon 1', capacity: 20, current: 0 },
        },
        {
          id: 'cnc_1',
          type: 'machine',
          position: { x: 450, y: 200 },
          data: { label: 'CNC 1', utilization: 0, isBottleneck: false },
        },
        {
          id: 'cnc_2',
          type: 'machine',
          position: { x: 450, y: 400 },
          data: { label: 'CNC 2', utilization: 0, isBottleneck: false },
        },
        {
          id: 'buffer2',
          type: 'buffer',
          position: { x: 650, y: 300 },
          data: { label: 'Tampon 2', capacity: 20, current: 0 },
        },
        {
          id: 'qc_1',
          type: 'machine',
          position: { x: 850, y: 300 },
          data: { label: 'QC 1', utilization: 0, isBottleneck: false },
        },
        {
          id: 'finished-goods',
          type: 'buffer',
          position: { x: 1050, y: 300 },
          data: { label: 'Bitmiş Ürün', type: 'sink' },
        },
      ];
    }

    // Dinamik node oluşturma - Genel fabrika altyapısı
    const nodes: Node[] = [
      {
        id: 'material-arrival',
        type: 'buffer',
        position: { x: 50, y: 300 },
        data: { label: 'Hammadde Girişi', type: 'source' },
      },
    ];

    // Storage ve workstation'ları dinamik olarak kategorize et
    const storageNodes: string[] = [];
    const workstationGroups: Record<string, string[]> = {}; // {workstation_id: [machine_ids]}
    
    Object.keys(results.node_status).forEach((nodeId) => {
      const status = results.node_status[nodeId];
      
      if (status.type === 'storage') {
        storageNodes.push(nodeId);
      } else if (status.type === 'machine') {
        const wsId = status.workstation_id || 'unknown';
        if (!workstationGroups[wsId]) {
          workstationGroups[wsId] = [];
        }
        workstationGroups[wsId].push(nodeId);
      }
    });

    // Storage'ları ve workstation'ları sırayla yerleştir
    const sortedStorages = storageNodes.sort();
    const sortedWorkstations = Object.keys(workstationGroups).sort();
    let xPos = 250;
    
    sortedStorages.forEach((storageId, storageIndex) => {
      const status = results.node_status[storageId];
      // ID'ye göre kullanıcı dostu isim: buffer1 -> Tampon 1, storage_1 -> Depolama 1
      let storageName = storageId;
      if (storageId.startsWith('buffer')) {
        storageName = storageId.replace('buffer', 'Tampon ');
      } else if (storageId.startsWith('storage_')) {
        storageName = storageId.replace('storage_', 'Depolama ');
      }
      
      // Storage node'u ekle
      nodes.push({
        id: storageId,
        type: 'buffer',
        position: { x: xPos, y: 300 },
        data: {
          label: storageName,
          capacity: status?.max_capacity || 20,
          current: status?.current_capacity || 0,
          isBottleneck: status?.is_bottleneck || false,
        },
      });
      
      // Bu storage'dan sonraki workstation'ları yerleştir
      if (storageIndex < sortedWorkstations.length) {
        const wsId = sortedWorkstations[storageIndex];
        const machines = workstationGroups[wsId];
        
        machines.forEach((machineId, machineIndex) => {
          const machineStatus = results.node_status[machineId];
          // İstasyon ID'sine göre isim: cnc -> CNC, quality_control -> QC
          let wsName: string;
          if (wsId === 'cnc') {
            wsName = 'CNC';
          } else if (wsId === 'quality_control') {
            wsName = 'QC';
          } else {
            wsName = wsId.replace('workstation_', 'İstasyon ').replace(/_/g, ' ').toUpperCase();
          }
          
          nodes.push({
            id: machineId,
            type: 'machine',
            position: { 
              x: xPos + 200, 
              y: 200 + machineIndex * 150 
            },
            data: {
              label: `${wsName} ${machineIndex + 1}`,
              utilization: machineStatus?.utilization || 0,
              availability: machineStatus?.availability || 0,
              efficiency: machineStatus?.efficiency || 0,
              isBottleneck: machineStatus?.is_bottleneck || false,
              isBroken: machineStatus?.is_broken || false,
            },
          });
        });
        
        xPos += 200;
      }
      
      xPos += 200;
    });

    // Bitmiş ürün
    nodes.push({
      id: 'finished-goods',
      type: 'buffer',
      position: { x: xPos, y: 300 },
      data: {
        label: 'Bitmiş Ürün',
        type: 'sink',
        current: results.metrics.parts_completed,
      },
    });

    return nodes;
  }, [results]);

  const initialEdges: Edge[] = useMemo(() => {
    if (!results) {
      // Default edges
      return [
        {
          id: 'e1',
          source: 'material-arrival',
          target: 'buffer1',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e2',
          source: 'buffer1',
          target: 'cnc_1',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e3',
          source: 'buffer1',
          target: 'cnc_2',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e4',
          source: 'cnc_1',
          target: 'buffer2',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e5',
          source: 'cnc_2',
          target: 'buffer2',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e6',
          source: 'buffer2',
          target: 'qc_1',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: 'e7',
          source: 'qc_1',
          target: 'finished-goods',
          type: 'animated',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
        },
      ];
    }

    // Dynamic edges based on actual nodes
    const edges: Edge[] = [];
    let edgeId = 1;

    // Dinamik edge oluşturma - Genel fabrika topolojisi
    const storageNodes = Object.keys(results.node_status)
      .filter(id => results.node_status[id].type === 'storage')
      .sort();
    
    const workstationGroups: Record<string, string[]> = {};
    Object.keys(results.node_status).forEach((nodeId) => {
      const status = results.node_status[nodeId];
      if (status.type === 'machine') {
        const wsId = status.workstation_id || 'unknown';
        if (!workstationGroups[wsId]) {
          workstationGroups[wsId] = [];
        }
        workstationGroups[wsId].push(nodeId);
      }
    });

    // Hammadde -> İlk storage
    if (storageNodes.length > 0) {
      edges.push({
        id: `e${edgeId++}`,
        source: 'material-arrival',
        target: storageNodes[0],
        type: 'animated',
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    // Storage -> Workstation -> Storage -> Workstation... akışı
    const sortedWorkstations = Object.keys(workstationGroups).sort();
    
    for (let i = 0; i < sortedWorkstations.length; i++) {
      const wsId = sortedWorkstations[i];
      const machines = workstationGroups[wsId];
      // Backend mantığı ile hizalı olsun:
      // - workstation i, storageNodes[i] üzerinden beslenir
      // - varsa storageNodes[i+1]'e çıkar, yoksa bitmiş ürüne gider
      const inputStorage =
        storageNodes.length > 0
          ? storageNodes[Math.min(i, storageNodes.length - 1)]
          : null;
      const nextStorage = i < storageNodes.length - 1 ? storageNodes[i + 1] : null;

      // Giriş storage'ından makinelere
      if (inputStorage) {
        machines.forEach((machineId) => {
          edges.push({
            id: `e${edgeId++}`,
            source: inputStorage,
            target: machineId,
            type: 'animated',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      }

      // Makinelerden sonraki storage'a (varsa)
      if (nextStorage) {
        machines.forEach((machineId) => {
          edges.push({
            id: `e${edgeId++}`,
            source: machineId,
            target: nextStorage,
            type: 'animated',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      } else {
        // Son workstation'dan bitmiş ürüne
        machines.forEach((machineId) => {
          edges.push({
            id: `e${edgeId++}`,
            source: machineId,
            target: 'finished-goods',
            type: 'animated',
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
          });
        });
      }
    }

    return edges;
  }, [results]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when results change
  React.useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Update edges when results change
  React.useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
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
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-slate-900"
        >
          <Background color="#1e293b" gap={16} />
          <Controls className="bg-card border-border" />
          <MiniMap
            className="bg-card border-border"
            nodeColor={(node) => {
              if (node.data?.isBottleneck) return '#ef4444';
              if (node.type === 'machine') return '#3b82f6';
              return '#64748b';
            }}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};

export default ProcessMap;

