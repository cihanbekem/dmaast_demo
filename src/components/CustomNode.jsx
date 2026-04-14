import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  ChevronDown,
  ChevronRight,
  Package,
  Layers,
  Star,
  Cpu,
  CircleDot,
} from "lucide-react";

const STYLES = {
  FinishedGood: {
    bg: "#0f172a",
    bgGrad: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    border: "#38bdf8",
    text: "#f0f9ff",
    sub: "#93c5fd",
    icon: Star,
    badgeBg: "#38bdf830",
    badgeText: "#7dd3fc",
    badgeLabel: "Bitmiş Ürün",
  },
  SubAssembly: {
    bg: "#0c4a6e",
    bgGrad: "linear-gradient(135deg, #0c4a6e 0%, #0e7490 100%)",
    border: "#22d3ee",
    text: "#ecfeff",
    sub: "#67e8f9",
    icon: Layers,
    badgeBg: "#22d3ee30",
    badgeText: "#67e8f9",
    badgeLabel: "Alt Montaj",
  },
  Component: {
    bg: "#ffffff",
    bgGrad: "linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)",
    border: "#cbd5e1",
    text: "#1e293b",
    sub: "#64748b",
    icon: Cpu,
    badgeBg: "#e2e8f0",
    badgeText: "#475569",
    badgeLabel: "Bileşen",
  },
  Expense: {
    bg: "#fffbeb",
    bgGrad: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)",
    border: "#f59e0b",
    text: "#78350f",
    sub: "#92400e",
    icon: Package,
    badgeBg: "#fbbf2430",
    badgeText: "#d97706",
    badgeLabel: "Sarf Malzeme",
  },
};

function getNodeStyle(subtype, partType) {
  if (subtype === "FinishedGood") return STYLES.FinishedGood;
  if (subtype === "SubAssembly") return STYLES.SubAssembly;
  if (partType === "Expense") return STYLES.Expense;
  return STYLES.Component;
}

const CustomNode = memo(function CustomNode({ data, selected }) {
  const s = getNodeStyle(data.subtype, data.partType);
  const Icon = s.icon;
  const isExpandable = data.childCount > 0;
  const isExpanded = data.expanded;
  const isDimmed = data.dimmed;
  const isHighlighted = data.highlighted;

  return (
    <div
      className={`hnode ${selected ? "hnode--selected" : ""} ${isDimmed ? "hnode--dimmed" : ""} ${isHighlighted ? "hnode--highlighted" : ""}`}
      style={{
        "--node-bg": s.bgGrad,
        "--node-border": s.border,
        "--node-text": s.text,
        "--node-sub": s.sub,
        "--node-shadow": selected
          ? `0 0 0 3px ${s.border}50, 0 8px 32px ${s.border}20`
          : isHighlighted
            ? `0 0 0 2px ${s.border}40, 0 4px 20px ${s.border}15`
            : `0 2px 12px rgba(0,0,0,0.08)`,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="hnode-handle"
        style={{ background: s.border }}
      />

      <div className="hnode-content">
        <div className="hnode-icon-wrap" style={{ background: `${s.border}20` }}>
          <Icon size={18} color={s.border} strokeWidth={2} />
        </div>

        <div className="hnode-info">
          <div className="hnode-top-row">
            <span className="hnode-part" style={{ color: s.text }}>
              {data.partNo}
            </span>
            {data.qty !== null && data.qty !== undefined && data.qty !== 1 && (
              <span
                className="hnode-qty"
                style={{ background: s.badgeBg, color: s.badgeText }}
              >
                ×{data.qty}
              </span>
            )}
          </div>
          <div className="hnode-desc" style={{ color: s.sub }}>
            {data.description || "—"}
          </div>
          <div className="hnode-meta">
            {data.operation && String(data.operation) !== "None" && (
              <span className="hnode-tag" style={{ background: s.badgeBg, color: s.badgeText }}>
                OP {data.operation}
              </span>
            )}
            {data.phantomBom && (
              <span className="hnode-tag" style={{ background: s.badgeBg, color: s.badgeText }}>
                BOM {data.phantomBom}
              </span>
            )}
            {data.partType && !["SubAssembly", "FinishedGood"].includes(data.partType) && (
              <span className="hnode-tag" style={{ background: s.badgeBg, color: s.badgeText }}>
                {data.partType}
              </span>
            )}
          </div>
        </div>

        {isExpandable && (
          <button
            className="hnode-expand"
            style={{ background: `${s.border}20`, color: s.border }}
            onClick={(e) => {
              e.stopPropagation();
              data.onToggle?.(data.id);
            }}
          >
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className="hnode-child-count">{data.totalDescendants}</span>
          </button>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="hnode-handle"
        style={{ background: s.border }}
      />
    </div>
  );
});

export default CustomNode;
