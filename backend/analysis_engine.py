from typing import Dict, List, Any
from enum import Enum


class InsightType(str, Enum):
    WARNING = "warning"  # Kırmızı - Darboğaz, kritik sorun
    INFO = "info"  # Mavi - Bilgilendirme
    SUCCESS = "success"  # Yeşil - İyi durum
    SUGGESTION = "suggestion"  # Sarı - Öneri


class Insight:
    def __init__(self, type: InsightType, title: str, message: str, severity: str = "medium"):
        self.type = type
        self.title = title
        self.message = message
        self.severity = severity  # low, medium, high, critical


def analyze_simulation_results(results: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Kural tabanlı analiz motoru - Simülasyon sonuçlarını analiz eder ve içgörüler üretir.
    """
    insights = []
    metrics = results.get("metrics", {})
    node_status = results.get("node_status", {})
    resource_utilization = metrics.get("resource_utilization", {})
    
    # Kural 1: CNC Darboğaz Kontrolü
    cnc_utilization = resource_utilization.get("cnc", 0)
    if cnc_utilization > 85:
        insights.append({
            "type": InsightType.WARNING,
            "title": "CNC Darboğaz Tespit Edildi",
            "message": f"CNC makinelerinin kullanım oranı %{cnc_utilization:.1f}. Bu, üretim hattında darboğaz oluşturabilir. CNC makine sayısını artırmayı veya işlem sürelerini optimize etmeyi düşünün.",
            "severity": "high"
        })
    elif cnc_utilization > 70:
        insights.append({
            "type": InsightType.INFO,
            "title": "CNC Kullanımı Yüksek",
            "message": f"CNC makinelerinin kullanım oranı %{cnc_utilization:.1f}. Yakın gelecekte darboğaz riski var.",
            "severity": "medium"
        })
    
    # Kural 2: QC Kullanım Kontrolü
    qc_utilization = resource_utilization.get("quality_control", 0)
    if qc_utilization < 20 and qc_utilization > 0:
        insights.append({
            "type": InsightType.SUGGESTION,
            "title": "QC Makine Fazlası",
            "message": f"Kalite kontrol makinelerinin kullanım oranı sadece %{qc_utilization:.1f}. Makine sayısını azaltarak maliyet tasarrufu sağlayabilirsiniz.",
            "severity": "low"
        })
    elif qc_utilization > 85:
        insights.append({
            "type": InsightType.WARNING,
            "title": "QC Darboğaz Riski",
            "message": f"Kalite kontrol makinelerinin kullanım oranı %{qc_utilization:.1f}. Darboğaz oluşabilir.",
            "severity": "high"
        })
    
    # Kural 3: Tampon Kapasite Kontrolü
    buffer1_status = node_status.get("buffer1", {})
    buffer1_utilization = buffer1_status.get("utilization", 0)
    if buffer1_utilization > 90:
        insights.append({
            "type": InsightType.WARNING,
            "title": "Tampon 1 Kapasitesi Dolu",
            "message": f"Tampon 1 %{buffer1_utilization:.1f} dolu. Kapasiteyi artırmayı veya önceki aşamaları hızlandırmayı düşünün.",
            "severity": "critical"
        })
    elif buffer1_utilization > 75:
        insights.append({
            "type": InsightType.INFO,
            "title": "Tampon 1 Doluluk Oranı Yüksek",
            "message": f"Tampon 1 %{buffer1_utilization:.1f} dolu. Yakında kapasite sorunu yaşanabilir.",
            "severity": "medium"
        })
    
    buffer2_status = node_status.get("buffer2", {})
    buffer2_utilization = buffer2_status.get("utilization", 0)
    if buffer2_utilization > 90:
        insights.append({
            "type": InsightType.WARNING,
            "title": "Tampon 2 Kapasitesi Dolu",
            "message": f"Tampon 2 %{buffer2_utilization:.1f} dolu. CNC makinelerinden gelen parçalar birikebilir.",
            "severity": "high"
        })
    
    # Kural 4: Ortalama Teslim Süresi Analizi
    avg_lead_time = metrics.get("average_lead_time", 0)
    if avg_lead_time > 300:  # 5 saatten fazla
        insights.append({
            "type": InsightType.WARNING,
            "title": "Yüksek Teslim Süresi",
            "message": f"Ortalama teslim süresi {avg_lead_time:.1f} dakika. Bu çok yüksek. Üretim hattını optimize etmek gerekebilir.",
            "severity": "high"
        })
    elif avg_lead_time > 180:  # 3 saatten fazla
        insights.append({
            "type": InsightType.INFO,
            "title": "Teslim Süresi İyileştirilebilir",
            "message": f"Ortalama teslim süresi {avg_lead_time:.1f} dakika. Optimizasyon fırsatı var.",
            "severity": "medium"
        })
    
    # Kural 5: Kullanılmayan Makineler
    idle_machines = []
    for node_id, status in node_status.items():
        if status.get("type") == "machine":
            utilization = status.get("utilization", 0)
            if utilization < 1 and utilization >= 0:  # %1'den az kullanım
                machine_type = status.get("machine_type", "unknown")
                idle_machines.append({
                    "id": node_id,
                    "type": machine_type,
                    "utilization": utilization
                })
    
    if idle_machines:
        idle_count = len(idle_machines)
        machine_names = ", ".join([m["id"].upper() for m in idle_machines[:3]])  # İlk 3'ü göster
        if idle_count > 3:
            machine_names += f" ve {idle_count - 3} makine daha"
        
        insights.append({
            "type": InsightType.SUGGESTION,
            "title": "Kullanılmayan Makineler",
            "message": f"{machine_names} neredeyse hiç kullanılmıyor (%0-1 kullanım). Bu makineleri kaldırarak veya iş yükünü yeniden dağıtarak maliyet tasarrufu sağlayabilirsiniz.",
            "severity": "medium"
        })
    
    # Kural 6: Üretim Hızı Analizi
    throughput = metrics.get("throughput", 0)
    parts_started = metrics.get("parts_started", 0)
    parts_completed = metrics.get("parts_completed", 0)
    
    if parts_started > 0:
        completion_rate = (parts_completed / parts_started) * 100
        if completion_rate < 50:
            insights.append({
                "type": InsightType.WARNING,
                "title": "Düşük Tamamlanma Oranı",
                "message": f"Başlatılan parçaların sadece %{completion_rate:.1f}'i tamamlandı. Simülasyon süresini artırmayı veya üretim hattını hızlandırmayı düşünün.",
                "severity": "high"
            })
    
    # Kural 7: Makine Arıza Analizi
    broken_machines = []
    for node_id, status in node_status.items():
        if status.get("type") == "machine" and status.get("is_broken", False):
            broken_machines.append(node_id.upper())
    
    if broken_machines:
        insights.append({
            "type": InsightType.WARNING,
            "title": "Arızalı Makineler",
            "message": f"{', '.join(broken_machines)} şu anda arızalı. Bakım planlamasını gözden geçirin.",
            "severity": "high"
        })
    
    # Kural 8: Genel Performans Değerlendirmesi
    if cnc_utilization < 85 and qc_utilization < 85 and buffer1_utilization < 75 and buffer2_utilization < 75:
        if avg_lead_time < 180 and throughput > 0:
            insights.append({
                "type": InsightType.SUCCESS,
                "title": "İyi Performans",
                "message": "Üretim hattı dengeli çalışıyor. Darboğaz yok ve kaynaklar verimli kullanılıyor.",
                "severity": "low"
            })
    
    # Severity'ye göre sırala (critical -> high -> medium -> low)
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    insights.sort(key=lambda x: severity_order.get(x.get("severity", "medium"), 2))
    
    return insights

