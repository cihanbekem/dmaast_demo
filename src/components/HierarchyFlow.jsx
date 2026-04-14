import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomNode from "./CustomNode";
import DetailPanel from "./DetailPanel";
import { buildTreeData } from "../utils/transformData";
import { getLayoutedElements } from "../utils/layoutUtils";
import { RotateCcw, Info, Maximize2, Expand, Shrink } from "lucide-react";

const nodeTypes = { hierarchyNode: CustomNode };

export default function HierarchyFlow({ productKey, searchTerm }) {
  const { fitView, setCenter, getZoom } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const treeRef = useRef(null);
  const prevKeyRef = useRef(null);

  const treeData = useMemo(() => {
    if (!productKey) return null;
    return buildTreeData(productKey);
  }, [productKey]);

  useEffect(() => {
    if (prevKeyRef.current !== productKey) {
      const initial = new Set();
      if (treeData?.tree) {
        initial.add(treeData.tree.partNo);
        for (const c of treeData.tree.children || []) {
          if (c.subtype === "SubAssembly") {
            initial.add(c.partNo);
          }
        }
      }
      setExpandedNodes(initial);
      setSelectedNodeId(null);
      prevKeyRef.current = productKey;
    }
  }, [productKey, treeData]);

  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    if (!treeData?.tree) return;
    const all = new Set();
    function walk(n) {
      if (n.childCount > 0) all.add(n.partNo);
      for (const c of n.children) walk(c);
    }
    walk(treeData.tree);
    setExpandedNodes(all);
  }, [treeData]);

  const collapseAll = useCallback(() => {
    if (!treeData?.tree) return;
    setExpandedNodes(new Set([treeData.tree.partNo]));
  }, [treeData]);

  useEffect(() => {
    if (!treeData?.tree) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const flowNodes = [];
    const flowEdges = [];
    const visited = new Set();

    function addNode(treeNode, parentId) {
      const nid = `n_${treeNode.partNo}`;

      if (visited.has(nid)) {
        if (parentId) {
          flowEdges.push(makeEdge(parentId, nid, treeNode));
        }
        return;
      }
      visited.add(nid);

      const isExpanded = expandedNodes.has(treeNode.partNo);

      flowNodes.push({
        id: nid,
        type: "hierarchyNode",
        position: { x: 0, y: 0 },
        data: {
          id: treeNode.partNo,
          partNo: treeNode.partNo,
          description: treeNode.description,
          subtype: treeNode.subtype,
          partType: treeNode.partType,
          qty: treeNode.qty,
          operation: treeNode.operation,
          phantomBom: treeNode.phantomBom,
          source: treeNode.source,
          desModelName: treeNode.desModelName,
          childCount: treeNode.childCount,
          totalDescendants: treeNode.totalDescendants,
          expanded: isExpanded,
          onToggle: toggleNode,
          level: treeNode.level,
          width: treeNode.subtype === "FinishedGood" ? 320 : treeNode.subtype === "SubAssembly" ? 300 : 260,
          height: 80,
        },
      });

      if (parentId) {
        flowEdges.push(makeEdge(parentId, nid, treeNode));
      }

      if (isExpanded && treeNode.children) {
        for (const child of treeNode.children) {
          addNode(child, nid);
        }
      }
    }

    function makeEdge(sourceId, targetId, treeNode) {
      const isSA = treeNode.subtype === "SubAssembly";
      return {
        id: `e_${sourceId}_${targetId}`,
        source: sourceId,
        target: targetId,
        type: "smoothstep",
        animated: isSA,
        style: {
          stroke: isSA ? "#22d3ee" : "#94a3b8",
          strokeWidth: isSA ? 2.5 : 1.5,
        },
        label: treeNode.qty !== null && treeNode.qty !== 1 ? `×${treeNode.qty}` : "",
        labelStyle: { fill: "#64748b", fontWeight: 600, fontSize: 11, fontFamily: "Inter, sans-serif" },
        labelBgStyle: { fill: "#ffffff", fillOpacity: 0.9, rx: 4, ry: 4 },
        labelBgPadding: [4, 6],
      };
    }

    addNode(treeData.tree, null);

    const { nodes: ln, edges: le } = getLayoutedElements(flowNodes, flowEdges, "TB");
    setNodes(ln);
    setEdges(le);

    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [treeData, expandedNodes, toggleNode, setNodes, setEdges, fitView]);

  useEffect(() => {
    if (!searchTerm) {
      setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, highlighted: false, dimmed: false } })));
      setEdges((eds) => eds.map((e) => ({ ...e, style: { ...e.style, opacity: 1 } })));
      return;
    }
    const lower = searchTerm.toLowerCase();
    const matchIds = new Set();
    nodes.forEach((n) => {
      if (n.data.partNo?.toLowerCase().includes(lower) || n.data.description?.toLowerCase().includes(lower)) {
        matchIds.add(n.id);
      }
    });
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, highlighted: matchIds.has(n.id), dimmed: matchIds.size > 0 && !matchIds.has(n.id) },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        style: { ...e.style, opacity: matchIds.size > 0 && !matchIds.has(e.source) && !matchIds.has(e.target) ? 0.15 : 1 },
      }))
    );
  }, [searchTerm]);

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNodeId(node.data.partNo);

      const connIds = new Set([node.id]);
      function walkUp(nid) {
        edges.forEach((e) => { if (e.target === nid && !connIds.has(e.source)) { connIds.add(e.source); walkUp(e.source); } });
      }
      function walkDown(nid) {
        edges.forEach((e) => { if (e.source === nid && !connIds.has(e.target)) { connIds.add(e.target); walkDown(e.target); } });
      }
      walkUp(node.id);
      walkDown(node.id);

      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, highlighted: connIds.has(n.id), dimmed: !connIds.has(n.id) },
        }))
      );
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: {
            ...e.style,
            opacity: connIds.has(e.source) && connIds.has(e.target) ? 1 : 0.08,
            strokeWidth: connIds.has(e.source) && connIds.has(e.target) ? 3 : 1,
          },
          animated: connIds.has(e.source) && connIds.has(e.target),
        }))
      );
    },
    [edges, setNodes, setEdges]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, highlighted: false, dimmed: false } })));
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: e.style?.strokeWidth > 2,
        style: { ...e.style, opacity: 1, strokeWidth: e.style?.stroke === "#22d3ee" ? 2.5 : 1.5 },
      }))
    );
  }, [setNodes, setEdges]);

  const selectedTreeNode = useMemo(() => {
    if (!selectedNodeId || !treeData?.tree) return null;
    function find(n) {
      if (n.partNo === selectedNodeId) return n;
      for (const c of n.children || []) {
        const r = find(c);
        if (r) return r;
      }
      return null;
    }
    return find(treeData.tree);
  }, [selectedNodeId, treeData]);

  const selectedParents = useMemo(() => {
    if (!selectedNodeId || !treeData?.tree) return [];
    const parents = [];
    function find(n, path) {
      if (n.partNo === selectedNodeId) {
        parents.push(...path);
        return true;
      }
      for (const c of n.children || []) {
        if (find(c, [...path, n])) return true;
      }
      return false;
    }
    find(treeData.tree, []);
    return parents;
  }, [selectedNodeId, treeData]);

  const selectedChildren = useMemo(() => {
    return selectedTreeNode?.children || [];
  }, [selectedTreeNode]);

  const findPathToNode = useCallback(
    (targetPartNo) => {
      if (!treeData?.tree) return [];
      const path = [];
      function walk(n, trail) {
        if (n.partNo === targetPartNo) {
          path.push(...trail);
          return true;
        }
        for (const c of n.children || []) {
          if (walk(c, [...trail, n.partNo])) return true;
        }
        return false;
      }
      walk(treeData.tree, []);
      return path;
    },
    [treeData]
  );

  const pendingNavigateRef = useRef(null);

  useEffect(() => {
    if (!pendingNavigateRef.current) return;
    const partNo = pendingNavigateRef.current;
    const target = nodes.find((n) => n.data.partNo === partNo);
    if (target) {
      pendingNavigateRef.current = null;
      setSelectedNodeId(partNo);
      setTimeout(() => {
        setCenter(target.position.x + 140, target.position.y + 40, {
          zoom: Math.max(getZoom(), 0.8),
          duration: 500,
        });
        onNodeClick(null, target);
      }, 80);
    }
  }, [nodes, setCenter, getZoom, onNodeClick]);

  const handleNavigate = useCallback(
    (partNo) => {
      const target = nodes.find((n) => n.data.partNo === partNo);
      if (target) {
        setSelectedNodeId(partNo);
        setCenter(target.position.x + 140, target.position.y + 40, {
          zoom: Math.max(getZoom(), 0.8),
          duration: 500,
        });
        onNodeClick(null, target);
      } else {
        const path = findPathToNode(partNo);
        if (path.length > 0) {
          setExpandedNodes((prev) => {
            const next = new Set(prev);
            for (const p of path) next.add(p);
            next.add(partNo);
            return next;
          });
          pendingNavigateRef.current = partNo;
        }
      }
    },
    [nodes, setCenter, getZoom, onNodeClick, findPathToNode]
  );

  const handleReset = useCallback(() => {
    onPaneClick();
    setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
  }, [onPaneClick, fitView]);

  if (!productKey) {
    return (
      <div className="flow-empty">
        <Maximize2 size={48} color="#cbd5e1" strokeWidth={1.5} />
        <h2>Ürün Hiyerarşi Görüntüleyici</h2>
        <p>Sol menüden bir ürün veya konfigürasyon seçerek hiyerarşi ağacını görüntüleyin.</p>
      </div>
    );
  }

  return (
    <div className="flow-wrap">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.05}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#e2e8f0" gap={24} size={1} />
        <Controls showInteractive={false} style={{ bottom: 80, left: 12 }} />
        <MiniMap
          nodeColor={(n) => {
            if (n.data?.subtype === "FinishedGood") return "#0f172a";
            if (n.data?.subtype === "SubAssembly") return "#0e7490";
            return "#94a3b8";
          }}
          maskColor="rgba(241, 245, 249, 0.75)"
          style={{
            bottom: 12,
            right: selectedNodeId ? 370 : 12,
            transition: "right 0.3s",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
          }}
          pannable
          zoomable
        />

        <Panel position="top-left">
          <div className="flow-info-bar">
            <Info size={14} />
            <span className="flow-info-name">
              {productKey.includes("Config")
                ? `flowIQ® 2101 — Config ${productKey.replace("021XCXXXXXX_Config", "")}`
                : "021XBXXXXXXF04 — Referans Ürün"}
            </span>
            <span className="flow-info-count">{nodes.length} parça görüntüleniyor</span>
          </div>
        </Panel>

        <Panel position="top-right" style={{ display: "flex", gap: 6, marginRight: selectedNodeId ? 356 : 0, transition: "margin 0.3s" }}>
          <button className="flow-btn" onClick={expandAll} title="Tümünü Aç">
            <Expand size={14} /> Aç
          </button>
          <button className="flow-btn" onClick={collapseAll} title="Tümünü Kapat">
            <Shrink size={14} /> Kapat
          </button>
          <button className="flow-btn" onClick={handleReset} title="Sıfırla">
            <RotateCcw size={14} /> Sıfırla
          </button>
        </Panel>
      </ReactFlow>

      {selectedTreeNode && (
        <DetailPanel
          nodeData={selectedTreeNode}
          parents={selectedParents}
          children={selectedChildren}
          onClose={() => { setSelectedNodeId(null); onPaneClick(); }}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
