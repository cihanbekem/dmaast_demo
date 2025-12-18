import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { TrendingUp, Clock, Package, Activity } from 'lucide-react';

const MetricsPanel: React.FC = () => {
  const { results } = useSimulationStore();

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground">Metrikleri görmek için simülasyon çalıştırın</p>
      </div>
    );
  }

  const { metrics } = results;

  const metricCards = [
    {
      title: 'Üretim Hızı',
      value: `${metrics.throughput.toFixed(2)} parça/saat`,
      icon: TrendingUp,
      color: 'text-green-500',
    },
    {
      title: 'Ortalama Teslim Süresi',
      value: `${metrics.average_lead_time.toFixed(2)} dk`,
      icon: Clock,
      color: 'text-blue-500',
    },
    {
      title: 'Tamamlanan Parça',
      value: metrics.parts_completed.toString(),
      icon: Package,
      color: 'text-purple-500',
    },
    {
      title: 'Başlatılan Parça',
      value: metrics.parts_started.toString(),
      icon: Activity,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Temel Metrikler</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.title}
              className="bg-background border border-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${metric.color}`} />
                <span className="text-sm text-muted-foreground">{metric.title}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            </div>
          );
        })}
      </div>

      {/* Resource Utilization */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Kaynak Kullanımı</h3>
        <div className="space-y-3">
          {Object.entries(metrics.resource_utilization).map(([machine, utilization]) => (
            <div key={machine}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{machine.toUpperCase()}</span>
                <span className="text-muted-foreground">{utilization.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    utilization > 85
                      ? 'bg-red-500'
                      : utilization > 70
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricsPanel;

