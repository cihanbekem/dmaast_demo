import { useState, useMemo } from "react";
import {
  ChevronDown,
  Settings,
  Package,
  Search,
  Layers,
  Star,
  BarChart3,
  Box,
} from "lucide-react";
import { getXCConfigs, getF04Product, getHierarchyData } from "../utils/transformData";

export default function Sidebar({ selectedProduct, onProductChange, onNodeSearch }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfigOpen, setIsConfigOpen] = useState(true);

  const f04 = getF04Product();
  const xcConfigs = getXCConfigs();

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    onNodeSearch(e.target.value);
  };

  const configStats = useMemo(() => {
    if (!selectedProduct) return null;
    const data = getHierarchyData(selectedProduct);
    if (!data) return null;
    const h = data.hierarchy;
    const levels = {};
    for (const row of h) {
      const l = String(row.level);
      levels[l] = (levels[l] || 0) + 1;
    }
    const entities = data.entity_mapping || [];
    let sa = 0, cp = 0;
    for (const e of entities) {
      if (e.des_element_subtype === "SubAssembly") sa++;
      else if (e.des_element_subtype !== "FinishedGood") cp++;
    }
    return { total: h.length, levels, sa, cp };
  }, [selectedProduct]);

  return (
    <aside className="sidebar">
      <div className="sb-header">
        <Layers size={22} color="#38bdf8" />
        <div>
          <h1 className="sb-title">DES Hierarchy</h1>
          <p className="sb-sub">Ürün Ağacı Görüntüleyici</p>
        </div>
      </div>

      <div className="sb-search">
        <Search size={14} className="sb-search-icon" />
        <input
          type="text"
          placeholder="Parça no veya açıklama ara..."
          value={searchTerm}
          onChange={handleSearch}
          className="sb-search-input"
        />
      </div>

      <div className="sb-section">
        <div className="sb-label"><Star size={12} /> Referans Ürün</div>
        {f04 && (
          <button
            className={`sb-product ${selectedProduct === f04.key ? "active" : ""}`}
            onClick={() => onProductChange(f04.key)}
          >
            <Package size={16} />
            <div>
              <div className="sb-product-id">{f04.rootPart}</div>
              <div className="sb-product-desc">{f04.rootDesc}</div>
            </div>
          </button>
        )}
      </div>

      <div className="sb-section">
        <button className="sb-label sb-label--btn" onClick={() => setIsConfigOpen(!isConfigOpen)}>
          <Settings size={12} />
          <span>flowIQ® 2101 Konfigürasyonlar</span>
          <ChevronDown
            size={14}
            style={{
              marginLeft: "auto",
              transform: isConfigOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s",
            }}
          />
        </button>
        {isConfigOpen && (
          <div className="sb-configs">
            {xcConfigs.map((cfg) => (
              <button
                key={cfg.key}
                className={`sb-config ${selectedProduct === cfg.key ? "active" : ""}`}
                onClick={() => onProductChange(cfg.key)}
              >
                <span className="sb-config-id">{cfg.configId}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {configStats && (
        <div className="sb-section sb-stats">
          <div className="sb-label"><BarChart3 size={12} /> İstatistikler</div>
          <div className="sb-stats-grid">
            <div className="sb-stat">
              <span className="sb-stat-val">{configStats.total}</span>
              <span className="sb-stat-lbl">Satır</span>
            </div>
            <div className="sb-stat">
              <span className="sb-stat-val">{Object.keys(configStats.levels).length}</span>
              <span className="sb-stat-lbl">Seviye</span>
            </div>
            <div className="sb-stat">
              <span className="sb-stat-val">{configStats.sa}</span>
              <span className="sb-stat-lbl">Montaj</span>
            </div>
            <div className="sb-stat">
              <span className="sb-stat-val">{configStats.cp}</span>
              <span className="sb-stat-lbl">Bileşen</span>
            </div>
          </div>
          <div className="sb-levels">
            {Object.entries(configStats.levels)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([level, count]) => (
                <div key={level} className="sb-level-row">
                  <span className="sb-level-lbl">Seviye {level}</span>
                  <div className="sb-level-track">
                    <div className="sb-level-fill" style={{ width: `${(count / configStats.total) * 100}%` }} />
                  </div>
                  <span className="sb-level-num">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="sb-legend">
        <div className="sb-label"><Box size={12} /> Gösterim</div>
        <div className="sb-legend-items">
          <LegendItem color="#0f172a" border="#38bdf8" label="Bitmiş Ürün" />
          <LegendItem color="#0c4a6e" border="#22d3ee" label="Alt Montaj" />
          <LegendItem color="#ffffff" border="#cbd5e1" label="Bileşen" />
          <LegendItem color="#fffbeb" border="#f59e0b" label="Sarf Malzeme" />
        </div>
      </div>
    </aside>
  );
}

function LegendItem({ color, border, label }) {
  return (
    <div className="sb-legend-item">
      <div className="sb-legend-dot" style={{ background: color, borderColor: border }} />
      <span>{label}</span>
    </div>
  );
}
