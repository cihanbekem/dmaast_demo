export const translationData = {
  common_boxes: [
    {
      key: "suppliers",
      label: "Suppliers",
      tr: {
        title: "Tedarikçiler",
        description:
          "Ürün veya ham madde/komponenti üreten ve firmaya gönderen dış tedarikçilerdir.",
      },
      en: {
        title: "Suppliers",
        description:
          "External suppliers that manufacture and deliver materials, components, or raw materials to the company.",
      },
    },
    {
      key: "ext_logistics",
      label: "Ext. Logistics",
      tr: {
        title: "Dış Lojistik",
        description:
          "Dış lojistik/nakliye firmasıdır. Parantez içindeki kodlar taşımanın nereden nereye yapıldığını gösterir.",
        codes: [
          { code: "S2W", meaning: "Supplier → Warehouse (tedarikçiden depoya)" },
          { code: "S12W", meaning: "Supplier 1 → Warehouse (1. tedarikçi giriş akışı)" },
          { code: "S22W", meaning: "Supplier 2 → Warehouse (2. tedarikçi giriş akışı)" },
          { code: "Sale", meaning: "Satış sevkiyatı (QA/bitmiş ürün → müşteri yönü)" },
        ],
      },
      en: {
        title: "External Logistics",
        description:
          "An external logistics/carrier service. The codes in parentheses show the transport route.",
        codes: [
          { code: "S2W", meaning: "Supplier → Warehouse" },
          { code: "S12W", meaning: "Supplier 1 → Warehouse (inbound flow)" },
          { code: "S22W", meaning: "Supplier 2 → Warehouse (inbound flow)" },
          { code: "Sale", meaning: "Outbound shipment for sales" },
        ],
      },
    },
    {
      key: "int_logistics",
      label: "Int. Logistics",
      tr: {
        title: "İç Lojistik",
        description:
          "Firma içinde yapılan taşıma/transfer süreçleridir (forklift, iç sevkiyat).",
        codes: [
          { code: "W2PCB", meaning: "Warehouse → PCB Production" },
          { code: "PCB2WM", meaning: "PCB Production → WM Warehouse" },
          { code: "W2WM", meaning: "Warehouse → WM Production" },
          { code: "W2W", meaning: "Warehouse → Warehouse" },
          { code: "W2JPB", meaning: "Warehouse → JPB Production" },
          { code: "JPB2QA", meaning: "JPB Production → QA" },
          { code: "QA2W", meaning: "QA → Warehouse (Geri Dönüş)" },
        ],
      },
      en: {
        title: "Internal Logistics",
        description: "Internal transport/transfer within the company.",
        codes: [
          { code: "W2PCB", meaning: "Warehouse → PCB Production" },
          { code: "PCB2WM", meaning: "PCB Production → WM Warehouse" },
          { code: "W2WM", meaning: "Warehouse → WM Production" },
          { code: "W2W", meaning: "Inter-warehouse transfer" },
          { code: "W2JPB", meaning: "Warehouse → JPB Production" },
          { code: "JPB2QA", meaning: "JPB Production → QA" },
          { code: "QA2W", meaning: "QA → Warehouse (Return)" },
        ],
      },
    },
    {
      key: "warehouse_inventory",
      label: "Warehouse",
      tr: {
        title: "Depo / Stok",
        description:
          "Depolama ve stok alanlarıdır. Ham madde veya yarı mamuller burada tutulur.",
      },
      en: {
        title: "Warehouse / Inventory",
        description:
          "Storage and stock locations. Inventory points are monitored here.",
      },
    },
    {
      key: "production",
      label: "Production",
      tr: {
        title: "Üretim",
        description: "Üretim hattı/atölyedir. Malzemeler burada işlenir.",
      },
      en: {
        title: "Production",
        description: "Manufacturing area where materials are processed.",
      },
    },
    {
      key: "qa",
      label: "QA",
      tr: {
        title: "Kalite (QA)",
        description: "Kalite kontrol ve onay aşamasıdır.",
      },
      en: {
        title: "Quality Assurance (QA)",
        description: "Quality inspection and approval stage.",
      },
    },
    {
      key: "customers_delivery",
      label: "Customers",
      tr: {
        title: "Müşteri Teslimatı",
        description: "Ürünün ulaştığı nihai nokta.",
      },
      en: {
        title: "Customer Delivery",
        description: "The final destination where the product is delivered.",
      },
    },
  ],
};

export type Language = "tr" | "en";

export interface TranslationCode {
  code: string;
  meaning: string;
}

export interface TranslationContent {
  title: string;
  description: string;
  codes?: TranslationCode[];
}

export interface TranslationBox {
  key: string;
  label: string;
  tr: TranslationContent;
  en: TranslationContent;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE ID TO TRANSLATION KEY MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const NODE_KEY_MAP: Record<string, { key: string; codeHint?: string }> = {
  // PCB_KAM nodes
  suppliers: { key: "suppliers" },
  ext_logistics_s2w: { key: "ext_logistics", codeHint: "S2W" },
  pcb_sqa: { key: "qa" },
  pcb_warehouse: { key: "warehouse_inventory" },
  int_log_w2pcb: { key: "int_logistics", codeHint: "W2PCB" },
  pcb_production: { key: "production" },
  int_log_pcb2wm: { key: "int_logistics", codeHint: "PCB2WM" },
  wm_sqa: { key: "qa" },
  wm_warehouse: { key: "warehouse_inventory" },
  int_log_w2wm: { key: "int_logistics", codeHint: "W2WM" },
  wm_production: { key: "production" },
  ext_logistics_out: { key: "ext_logistics", codeHint: "Sale" },
  customers: { key: "customers_delivery" },

  // JPB nodes
  spring_supplier: { key: "suppliers" },
  rm_supplier_1: { key: "suppliers" },
  rm_supplier_2: { key: "suppliers" },
  ext_log_s2w: { key: "ext_logistics", codeHint: "S2W" },
  ext_log_s12w: { key: "ext_logistics", codeHint: "S12W" },
  ext_log_s22w: { key: "ext_logistics", codeHint: "S22W" },
  spring_inventory: { key: "warehouse_inventory" },
  lh_building_inv: { key: "warehouse_inventory" },
  int_log_w2w: { key: "int_logistics", codeHint: "W2W" },
  material_inventory: { key: "warehouse_inventory" },
  int_log_w2jpb_spring: { key: "int_logistics", codeHint: "W2JPB" },
  int_log_w2jpb_mat: { key: "int_logistics", codeHint: "W2JPB" },
  jpb_production: { key: "production" },
  int_log_jpb2qa: { key: "int_logistics", codeHint: "JPB2QA" },
  qa: { key: "qa" },
  int_log_qa2w: { key: "int_logistics", codeHint: "QA2W" },
  ext_log_sale: { key: "ext_logistics", codeHint: "Sale" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get translation content for a node ID
 */
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

  // Find specific code meaning if available
  if (mapping.codeHint && content.codes) {
    specificCode = content.codes.find((c) => c.code === mapping.codeHint);
  }

  return {
    content,
    codeHint: mapping.codeHint,
    specificCode,
  };
}

/**
 * Get clean display label for a node
 */
export function getNodeLabel(nodeId: string, lang: Language): string {
  const mapping = NODE_KEY_MAP[nodeId];
  if (!mapping) {
    // Fallback: convert ID to readable format
    return nodeId
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  const box = translationData.common_boxes.find((b) => b.key === mapping.key);
  if (!box) return nodeId;

  const title = box[lang].title;

  // Append code hint if exists
  if (mapping.codeHint) {
    return `${title} (${mapping.codeHint})`;
  }

  return title;
}

/**
 * UI Labels for the interface
 */
export const UI_LABELS = {
  tr: {
    infoPanel: {
      title: "Düğüm Bilgisi",
      close: "Kapat",
      noSelection: "Bilgi görmek için haritadan bir düğüme tıklayın",
      codeLabel: "Kod Açıklaması",
      nodeId: "Düğüm ID",
    },
    controls: {
      language: "Dil",
      simulation: "Simülasyon",
      topology: "Topoloji",
    },
  },
  en: {
    infoPanel: {
      title: "Node Information",
      close: "Close",
      noSelection: "Click a node on the map to see its details",
      codeLabel: "Code Description",
      nodeId: "Node ID",
    },
    controls: {
      language: "Language",
      simulation: "Simulation",
      topology: "Topology",
    },
  },
};

