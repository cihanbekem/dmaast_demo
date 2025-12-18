import React from 'react';
import { useSimulationStore, type Insight } from '../store/simulationStore';
import { AlertTriangle, Info, CheckCircle, Lightbulb } from 'lucide-react';
import { cn } from '../lib/utils';

const InsightsPanel: React.FC = () => {
  const { results } = useSimulationStore();

  if (!results || !results.insights || results.insights.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">İçgörüler ve Öneriler</h2>
        <p className="text-muted-foreground">Simülasyon çalıştırıldığında otomatik analiz sonuçları burada görünecek.</p>
      </div>
    );
  }

  const getIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'suggestion':
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getBorderColor = (type: Insight['type'], severity: Insight['severity']) => {
    if (type === 'warning' || severity === 'critical' || severity === 'high') {
      return 'border-red-500/50 bg-red-500/10';
    }
    if (type === 'suggestion' || severity === 'medium') {
      return 'border-yellow-500/50 bg-yellow-500/10';
    }
    if (type === 'info') {
      return 'border-blue-500/50 bg-blue-500/10';
    }
    if (type === 'success') {
      return 'border-green-500/50 bg-green-500/10';
    }
    return 'border-border bg-background';
  };

  const getTextColor = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'text-red-400';
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      case 'suggestion':
        return 'text-yellow-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">İçgörüler ve Öneriler</h2>
      <div className="space-y-3">
        {results.insights.map((insight, index) => (
          <div
            key={index}
            className={cn(
              'border rounded-lg p-4 transition-all',
              getBorderColor(insight.type, insight.severity)
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn('flex-shrink-0 mt-0.5', getTextColor(insight.type))}>
                {getIcon(insight.type)}
              </div>
              <div className="flex-1">
                <h3 className={cn('font-semibold mb-1', getTextColor(insight.type))}>
                  {insight.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight.message}
                </p>
                {insight.severity === 'critical' && (
                  <span className="inline-block mt-2 text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded">
                    Kritik
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsightsPanel;


