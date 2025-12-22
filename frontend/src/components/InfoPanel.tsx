import React from 'react';
import { X, Info, ArrowRight, Box, Truck, Factory, CheckCircle, Users } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { getNodeTranslation, UI_LABELS, getNodeLabel } from '../data/translations';

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS FOR NODE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

const NODE_ICONS: Record<string, React.ReactNode> = {
  suppliers: <Users className="w-5 h-5" />,
  ext_logistics: <Truck className="w-5 h-5" />,
  int_logistics: <ArrowRight className="w-5 h-5" />,
  warehouse_inventory: <Box className="w-5 h-5" />,
  production: <Factory className="w-5 h-5" />,
  qa: <CheckCircle className="w-5 h-5" />,
  customers_delivery: <Users className="w-5 h-5" />,
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const InfoPanel: React.FC = () => {
  const { selectedNode, infoPanelOpen, language, toggleInfoPanel, results } = useSimulationStore();
  const labels = UI_LABELS[language].infoPanel;

  if (!infoPanelOpen) return null;

  const translation = selectedNode ? getNodeTranslation(selectedNode, language) : null;
  const nodeStatus = selectedNode && results?.node_status?.[selectedNode];
  const displayLabel = selectedNode ? getNodeLabel(selectedNode, language) : '';

  // Get the key for icon lookup
  const iconKey = translation?.content
    ? Object.keys(NODE_ICONS).find((k) =>
        translation.content.title.toLowerCase().includes(k.split('_')[0])
      ) || 'production'
    : 'production';

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-foreground">{labels.title}</h2>
        </div>
        <button
          onClick={() => toggleInfoPanel(false)}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label={labels.close}
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!selectedNode ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Info className="w-12 h-12 mb-4 opacity-50" />
            <p>{labels.noSelection}</p>
          </div>
        ) : translation ? (
          <>
            {/* Node Title */}
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                {NODE_ICONS[iconKey] || <Box className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{displayLabel}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {labels.nodeId}: <code className="bg-muted px-1.5 py-0.5 rounded">{selectedNode}</code>
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-foreground leading-relaxed">
                {translation.content.description}
              </p>
            </div>

            {/* Specific Code Meaning */}
            {translation.specificCode && (
              <div className="border border-primary/30 bg-primary/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-mono rounded">
                    {translation.specificCode.code}
                  </div>
                  <span className="text-sm font-medium text-foreground">{labels.codeLabel}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {translation.specificCode.meaning}
                </p>
              </div>
            )}

            {/* All Codes (if available and more than one) */}
            {translation.content.codes && translation.content.codes.length > 1 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">
                  {language === 'tr' ? 'Tüm Kodlar' : 'All Codes'}
                </h4>
                <div className="space-y-2">
                  {translation.content.codes.map((c) => (
                    <div
                      key={c.code}
                      className={`flex items-start gap-2 p-2 rounded-md ${
                        c.code === translation.codeHint
                          ? 'bg-primary/10 border border-primary/30'
                          : 'bg-muted/30'
                      }`}
                    >
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {c.code}
                      </code>
                      <span className="text-xs text-muted-foreground">{c.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Status (if simulation results available) */}
            {nodeStatus && (
              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="text-sm font-medium text-foreground">
                  {language === 'tr' ? 'Canlı Durum' : 'Live Status'}
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      {language === 'tr' ? 'Kullanım' : 'Utilization'}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {nodeStatus.utilization?.toFixed(1) || 0}%
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          (nodeStatus.utilization || 0) > 85
                            ? 'bg-red-500'
                            : (nodeStatus.utilization || 0) > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(nodeStatus.utilization || 0, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      {language === 'tr' ? 'Kullanılabilirlik' : 'Availability'}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {nodeStatus.availability?.toFixed(1) || 100}%
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                      <div
                        className="h-1.5 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${Math.min(nodeStatus.availability || 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      {language === 'tr' ? 'İşlenen' : 'Processed'}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {nodeStatus.processed_count || 0}
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-3">
                    <div className="text-xs text-muted-foreground mb-1">
                      {language === 'tr' ? 'Kuyruk' : 'Queue'}
                    </div>
                    <div className="text-lg font-bold text-foreground">
                      {nodeStatus.queue_length || 0}
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  {nodeStatus.is_bottleneck && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                      {language === 'tr' ? '⚠️ Darboğaz' : '⚠️ Bottleneck'}
                    </span>
                  )}
                  {nodeStatus.is_broken && (
                    <span className="px-2 py-1 bg-red-600/20 text-red-500 text-xs rounded-full">
                      {language === 'tr' ? '🔧 Arızalı' : '🔧 Broken'}
                    </span>
                  )}
                  {!nodeStatus.is_bottleneck && !nodeStatus.is_broken && (nodeStatus.utilization || 0) < 70 && (
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                      {language === 'tr' ? '✓ Normal' : '✓ Normal'}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Box className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">
              {language === 'tr'
                ? `"${selectedNode}" için çeviri bilgisi bulunamadı.`
                : `No translation found for "${selectedNode}".`}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          {language === 'tr'
            ? 'Başka bir düğüme tıklayarak geçiş yapabilirsiniz'
            : 'Click another node to switch'}
        </p>
      </div>
    </div>
  );
};

export default InfoPanel;

