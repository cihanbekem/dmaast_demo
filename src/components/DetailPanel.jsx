import {
  X,
  Hash,
  FileText,
  Tag,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Star,
  Cpu,
  Info,
} from "lucide-react";

const typeConfig = {
  FinishedGood: { label: "Bitmiş Ürün", color: "#38bdf8", Icon: Star },
  SubAssembly: { label: "Alt Montaj", color: "#22d3ee", Icon: Layers },
  Component: { label: "Bileşen", color: "#64748b", Icon: Cpu },
  Expense: { label: "Sarf Malzeme", color: "#f59e0b", Icon: Package },
};

export default function DetailPanel({ nodeData, parents, children, onClose, onNavigate }) {
  if (!nodeData) return null;

  const cfg = typeConfig[nodeData.subtype] || typeConfig.Component;
  const Icon = cfg.Icon;

  const clean = (str) => {
    if (!str) return "—";
    return str.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
  };

  return (
    <div className="dpanel">
      <div className="dpanel-head">
        <div className="dpanel-head-left">
          <div className="dpanel-head-icon" style={{ background: `${cfg.color}20` }}>
            <Icon size={16} color={cfg.color} />
          </div>
          <span className="dpanel-head-title">Detay</span>
        </div>
        <button className="dpanel-close" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="dpanel-body">
        <div className="dpanel-badge" style={{ background: `${cfg.color}15`, color: cfg.color, borderColor: `${cfg.color}30` }}>
          {cfg.label}
        </div>

        <div className="dpanel-fields">
          <Field icon={<Hash size={14} />} label="Parça No" value={nodeData.partNo} mono />
          <Field icon={<FileText size={14} />} label="Açıklama" value={clean(nodeData.description)} />
          {nodeData.partType && <Field icon={<Tag size={14} />} label="Parça Tipi" value={nodeData.partType} />}
          {nodeData.qty !== null && nodeData.qty !== undefined && (
            <Field icon={<Activity size={14} />} label="Miktar" value={String(nodeData.qty)} mono />
          )}
          {nodeData.operation && String(nodeData.operation) !== "None" && (
            <Field icon={<Activity size={14} />} label="Operasyon" value={`OP ${nodeData.operation}`} mono />
          )}
          {nodeData.phantomBom && (
            <Field icon={<Layers size={14} />} label="Phantom BOM" value={nodeData.phantomBom} mono />
          )}
          {nodeData.source && <Field icon={<Info size={14} />} label="Kaynak" value={nodeData.source} />}
          {nodeData.desModelName && <Field icon={<Tag size={14} />} label="DES Model" value={nodeData.desModelName} mono />}
          {nodeData.childCount > 0 && (
            <Field icon={<Layers size={14} />} label="Alt Bileşen" value={`${nodeData.childCount} direkt, ${nodeData.totalDescendants} toplam`} />
          )}
        </div>

        {parents.length > 0 && (
          <div className="dpanel-conn">
            <div className="dpanel-conn-title">
              <ArrowUpRight size={14} /> Üst Bağlantılar ({parents.length})
            </div>
            {parents.map((p) => (
              <button key={p.partNo} className="dpanel-conn-btn" onClick={() => onNavigate(p.partNo)}>
                <span className="dpanel-conn-id">{p.partNo}</span>
                <span className="dpanel-conn-desc">{clean(p.description).slice(0, 35)}</span>
              </button>
            ))}
          </div>
        )}

        {children.length > 0 && (
          <div className="dpanel-conn">
            <div className="dpanel-conn-title">
              <ArrowDownRight size={14} /> Alt Bağlantılar ({children.length})
            </div>
            {children.map((c) => (
              <button key={c.partNo} className="dpanel-conn-btn" onClick={() => onNavigate(c.partNo)}>
                <span className="dpanel-conn-id">{c.partNo}</span>
                <span className="dpanel-conn-desc">{clean(c.description).slice(0, 35)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ icon, label, value, mono }) {
  return (
    <div className="dpanel-field">
      <div className="dpanel-field-label">
        {icon}
        {label}
      </div>
      <div className={`dpanel-field-value ${mono ? "mono" : ""}`}>{value}</div>
    </div>
  );
}
