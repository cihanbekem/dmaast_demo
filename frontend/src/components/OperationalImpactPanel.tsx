import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { TrendingUp, Clock, Package } from 'lucide-react';

const OperationalImpactPanel: React.FC = () => {
  const { results } = useSimulationStore();

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Operasyonel Etki Analizi</h2>
        <p className="text-muted-foreground text-sm">
          Operasyonel etkiyi görmek için önce bir simülasyon çalıştırın.
        </p>
      </div>
    );
  }

  const metrics = results.metrics;
  const throughput = metrics.throughput || 0;
  const avgLeadTime = metrics.average_lead_time || 0;
  const partsCompleted = metrics.parts_completed || 0;
  const partsStarted = metrics.parts_started || 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-foreground">Operasyonel Etki Analizi</h2>
      </div>

      <div className="space-y-4">
        {/* Hız ve Teslim Süresi */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-foreground">Üretim Hızı</span>
            </div>
            <span className="text-2xl font-bold text-green-500">
              {throughput.toFixed(2)} parça/saat
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Bu hız, simülasyon süresi boyunca tamamlanan parça sayısına göre hesaplanmıştır.
          </p>
        </div>

        {/* Teslim Süresi */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-foreground">Ortalama Teslim Süresi</span>
            </div>
            <span className="text-2xl font-bold text-blue-500">
              {avgLeadTime.toFixed(2)} dk
            </span>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Daha düşük süre</span>
              <span className="text-foreground font-medium">daha hızlı akış anlamına gelir.</span>
            </div>
          </div>
        </div>

        {/* Etki Özeti */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Etki Özeti</span>
          </div>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              • Toplam tamamlanan parça: {partsCompleted}.
            </p>
            <p>
              • Başlatılan parça sayısı: {partsStarted}.
            </p>
            <p>
              • Tamamlanma oranı:{" "}
              {partsStarted > 0
                ? `${((partsCompleted / partsStarted) * 100).toFixed(1)}%`
                : 'N/A'}
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperationalImpactPanel;


