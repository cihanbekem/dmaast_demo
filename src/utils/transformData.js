import hierarchyData from "../data/hierarchyData.json";

export function getProductList() {
  const products = [];
  for (const key of Object.keys(hierarchyData)) {
    const h = hierarchyData[key].hierarchy;
    if (!h || h.length === 0) continue;
    const rootPart = h[0].parent_part;
    const rootDesc = h[0].parent_desc;
    const isXC = key.startsWith("021XCXXXXXX");
    const configId = isXC ? key.replace("021XCXXXXXX_Config", "") : null;
    products.push({ key, rootPart, rootDesc, isXC, configId });
  }
  return products;
}

export function getXCConfigs() {
  return getProductList().filter((p) => p.isXC);
}

export function getF04Product() {
  return getProductList().find((p) => !p.isXC);
}

export function getHierarchyData(productKey) {
  return hierarchyData[productKey] || null;
}

export function buildTreeData(productKey) {
  const product = hierarchyData[productKey];
  if (!product) return null;

  const { hierarchy, entity_mapping, process_mapping, bom_relation_nodes } = product;

  const entityMap = {};
  if (entity_mapping) {
    for (const e of entity_mapping) {
      entityMap[String(e.part_no)] = e;
    }
  }

  const bomNodeMap = {};
  if (bom_relation_nodes) {
    for (const b of bom_relation_nodes) {
      bomNodeMap[String(b.phantom_bom)] = b;
    }
  }

  const rootPart = String(hierarchy[0]?.parent_part);
  const rootDesc = String(hierarchy[0]?.parent_desc || "");

  function getSubtype(partNo) {
    const e = entityMap[partNo];
    if (e) return e.des_element_subtype;
    const subs = ["5962204", "55501572", "5401021", "55501649"];
    if (subs.includes(partNo)) return "SubAssembly";
    return "Component";
  }

  const childrenByParent = {};
  for (const row of hierarchy) {
    const pp = String(row.parent_part);
    const cp = String(row.component_part);
    if (cp === pp) continue;
    if (!childrenByParent[pp]) childrenByParent[pp] = [];
    childrenByParent[pp].push(row);
  }

  function buildNode(partNo, desc, level, row) {
    const subtype = getSubtype(partNo);
    const entity = entityMap[partNo];
    const children = (childrenByParent[partNo] || []).map((r) => {
      return buildNode(
        String(r.component_part),
        String(r.component_desc || ""),
        Number(r.level) || level + 1,
        r
      );
    });

    const phantomGroups = {};
    for (const child of children) {
      const pb = child.phantomBom || "direct";
      if (!phantomGroups[pb]) phantomGroups[pb] = [];
      phantomGroups[pb].push(child);
    }

    return {
      id: partNo,
      partNo,
      description: desc.replace(/\*+/g, "").replace(/\s+/g, " ").trim(),
      subtype,
      level,
      qty: row?.qty_per_assembly ?? null,
      operation: row?.operation_no ?? null,
      phantomBom: row?.phantom_bom && String(row.phantom_bom) !== "None" ? String(row.phantom_bom) : null,
      source: row?.source || null,
      partType: row?.component_part_type || entity?.des_element_subtype || "",
      desModelName: entity?.des_model_name || null,
      children,
      phantomGroups,
      childCount: children.length,
      totalDescendants: children.reduce((s, c) => s + 1 + (c.totalDescendants || 0), 0),
    };
  }

  const tree = buildNode(rootPart, rootDesc, 0, null);
  tree.subtype = "FinishedGood";

  return { tree, entityMap, bomNodeMap };
}
