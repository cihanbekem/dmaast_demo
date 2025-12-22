"""
Rule-based Analysis Engine for DMaaST Value Chain Simulations
Provides topology-agnostic insights based on simulation results
"""
from typing import Any, Dict, List
from enum import Enum


class InsightType(str, Enum):
    WARNING = "warning"
    INFO = "info"
    SUCCESS = "success"
    SUGGESTION = "suggestion"


def analyze_simulation_results(results: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Analyze simulation results and generate insights.
    Works with any topology (PCB_KAM or JPB).
    """
    insights = []
    metrics = results.get("metrics", {})
    node_status = results.get("node_status", {})
    resource_utilization = metrics.get("resource_utilization", {})

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 1: Bottleneck Detection
    # ═══════════════════════════════════════════════════════════════════════════
    bottlenecks = []
    high_utilization_nodes = []

    for node_id, status in node_status.items():
        utilization = status.get("utilization", 0)
        if utilization > 85:
            bottlenecks.append((node_id, utilization))
        elif utilization > 70:
            high_utilization_nodes.append((node_id, utilization))

    if bottlenecks:
        bottleneck_names = ", ".join([f"{n} (%{u:.1f})" for n, u in bottlenecks[:3]])
        insights.append({
            "type": InsightType.WARNING,
            "title": "Darboğaz Tespit Edildi",
            "message": f"Şu düğümler darboğaz oluşturuyor: {bottleneck_names}. Kapasite artırımı veya paralel hat değerlendirin.",
            "severity": "high" if len(bottlenecks) > 2 else "medium"
        })

    if high_utilization_nodes:
        high_util_names = ", ".join([f"{n} (%{u:.1f})" for n, u in high_utilization_nodes[:3]])
        insights.append({
            "type": InsightType.INFO,
            "title": "Yüksek Kullanım Oranı",
            "message": f"Şu düğümler yüksek kullanım oranına sahip: {high_util_names}. Yakın gelecekte darboğaz riski var.",
            "severity": "medium"
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 2: Underutilized Resources
    # ═══════════════════════════════════════════════════════════════════════════
    underutilized = []
    for node_id, status in node_status.items():
        utilization = status.get("utilization", 0)
        node_type = status.get("type", "")
        # Only flag production/process nodes, not logistics or sinks
        if utilization < 20 and utilization > 0 and node_type in ["production", "process", "quality"]:
            underutilized.append((node_id, utilization))

    if underutilized:
        under_names = ", ".join([f"{n} (%{u:.1f})" for n, u in underutilized[:3]])
        insights.append({
            "type": InsightType.SUGGESTION,
            "title": "Düşük Kullanım Oranı",
            "message": f"Şu düğümler düşük kullanım oranına sahip: {under_names}. Kapasite azaltımı veya iş yükü dengeleme değerlendirin.",
            "severity": "low"
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 3: Lead Time Analysis
    # ═══════════════════════════════════════════════════════════════════════════
    avg_lead_time = metrics.get("average_lead_time", 0)

    if avg_lead_time > 300:  # 5+ hours
        insights.append({
            "type": InsightType.WARNING,
            "title": "Yüksek Teslim Süresi",
            "message": f"Ortalama teslim süresi {avg_lead_time:.1f} dakika ({avg_lead_time/60:.1f} saat). Bu çok yüksek. Lojistik ve üretim süreçlerini optimize edin.",
            "severity": "high"
        })
    elif avg_lead_time > 180:  # 3+ hours
        insights.append({
            "type": InsightType.INFO,
            "title": "Teslim Süresi İyileştirilebilir",
            "message": f"Ortalama teslim süresi {avg_lead_time:.1f} dakika. Optimizasyon fırsatı var.",
            "severity": "medium"
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 4: Completion Rate
    # ═══════════════════════════════════════════════════════════════════════════
    parts_started = metrics.get("parts_started", 0)
    parts_completed = metrics.get("parts_completed", 0)

    if parts_started > 0:
        completion_rate = (parts_completed / parts_started) * 100
        if completion_rate < 50:
            insights.append({
                "type": InsightType.WARNING,
                "title": "Düşük Tamamlanma Oranı",
                "message": f"Başlatılan parçaların sadece %{completion_rate:.1f}'i tamamlandı. Simülasyon süresini artırın veya darboğazları giderin.",
                "severity": "high"
            })
        elif completion_rate < 80:
            insights.append({
                "type": InsightType.INFO,
                "title": "Tamamlanma Oranı",
                "message": f"Parçaların %{completion_rate:.1f}'i tamamlandı. Daha uzun simülasyon veya kapasite artışı değerlendirin.",
                "severity": "medium"
            })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 5: Broken Nodes
    # ═══════════════════════════════════════════════════════════════════════════
    broken_nodes = []
    for node_id, status in node_status.items():
        if status.get("is_broken", False):
            broken_nodes.append(node_id)

    if broken_nodes:
        broken_names = ", ".join(broken_nodes[:5])
        insights.append({
            "type": InsightType.WARNING,
            "title": "Arızalı Düğümler",
            "message": f"Simülasyon sonunda şu düğümler arızalı: {broken_names}. Bakım planlamasını gözden geçirin.",
            "severity": "high"
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 6: Low Availability
    # ═══════════════════════════════════════════════════════════════════════════
    low_availability = []
    for node_id, status in node_status.items():
        availability = status.get("availability", 100)
        if availability < 80 and status.get("type", "") in ["production", "process", "quality"]:
            low_availability.append((node_id, availability))

    if low_availability:
        low_avail_names = ", ".join([f"{n} (%{a:.1f})" for n, a in low_availability[:3]])
        insights.append({
            "type": InsightType.WARNING,
            "title": "Düşük Kullanılabilirlik",
            "message": f"Şu düğümlerin kullanılabilirliği düşük: {low_avail_names}. MTBF/MTTR değerlerini ve bakım süreçlerini inceleyin.",
            "severity": "high"
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 7: Overall Performance
    # ═══════════════════════════════════════════════════════════════════════════
    throughput = metrics.get("throughput", 0)

    if not bottlenecks and not broken_nodes and avg_lead_time < 180 and throughput > 0:
        insights.append({
            "type": InsightType.SUCCESS,
            "title": "İyi Performans",
            "message": f"Değer zinciri dengeli çalışıyor. Verimlilik: {throughput:.1f} parça/saat, Ortalama teslim: {avg_lead_time:.1f} dk.",
            "severity": "low"
        })

    # ═══════════════════════════════════════════════════════════════════════════
    # Rule 8: Throughput Analysis
    # ═══════════════════════════════════════════════════════════════════════════
    if throughput < 1 and parts_started > 10:
        insights.append({
            "type": InsightType.WARNING,
            "title": "Çok Düşük Verimlilik",
            "message": f"Saat başına sadece {throughput:.2f} parça tamamlanıyor. Sistemde ciddi bir tıkanıklık var.",
            "severity": "critical"
        })

    # Sort by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    insights.sort(key=lambda x: severity_order.get(x.get("severity", "medium"), 2))

    return insights
