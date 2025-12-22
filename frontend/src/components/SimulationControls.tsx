import React from 'react';
import { Play, Save, RotateCcw } from 'lucide-react';
import { useSimulationStore, type TopologyType } from '../store/simulationStore';

// ═══════════════════════════════════════════════════════════════════════════════
// TOPOLOGY METADATA
// ═══════════════════════════════════════════════════════════════════════════════

const TOPOLOGY_INFO = {
  pcb_kam: {
    name: { tr: 'PCB + KAM', en: 'PCB + KAM' },
    description: {
      tr: 'PCB üretimi ve Warehouse Manufacturing akışı',
      en: 'PCB production and Warehouse Manufacturing flow',
    },
    color: 'bg-blue-500',
  },
  jpb: {
    name: { tr: 'JPB', en: 'JPB' },
    description: {
      tr: 'JPB montaj hattı - Spring ve hammadde besleme',
      en: 'JPB assembly line - Spring and raw material supply',
    },
    color: 'bg-orange-500',
  },
};

const LABELS = {
  tr: {
    title: 'Simülasyon Kontrol Paneli',
    topologySelect: 'Değer Zinciri Seçimi',
    arrivalRate: 'Geliş Hızı (parça/dakika)',
    duration: 'Simülasyon Süresi (dakika)',
    error: 'Hata',
    infoTitle: 'Simülasyon Hakkında',
    infoItems: [
      'Her düğüm varsayılan olarak 10 dk işlem süresi ve 100 kapasite kullanır',
      'SimPy discrete event simulation kullanılır - 480 dk birkaç saniyede tamamlanır',
    ],
    pcbKamInfo: 'PCB hattında %70 PCB, %30 direkt WM akışı var',
    jpbInfo: 'JPB hattında %10 QA ret oranı ve geri besleme döngüsü var',
    resultsTitle: 'Son Simülasyon Sonuçları',
    partsPerHour: 'parça/saat',
    avgMinutes: 'dk ortalama',
    completed: 'tamamlanan',
    started: 'başlatılan',
    runSimulation: 'Simülasyonu Başlat',
    running: 'Çalışıyor...',
    save: 'Kaydet',
  },
  en: {
    title: 'Simulation Control Panel',
    topologySelect: 'Value Chain Selection',
    arrivalRate: 'Arrival Rate (parts/min)',
    duration: 'Simulation Duration (minutes)',
    error: 'Error',
    infoTitle: 'About Simulation',
    infoItems: [
      'Each node uses default 10 min processing time and 100 capacity',
      'SimPy discrete event simulation is used - 480 min completes in seconds',
    ],
    pcbKamInfo: 'PCB line has 70% PCB, 30% direct WM flow',
    jpbInfo: 'JPB line has 10% QA rejection rate and feedback loop',
    resultsTitle: 'Latest Simulation Results',
    partsPerHour: 'parts/hour',
    avgMinutes: 'min average',
    completed: 'completed',
    started: 'started',
    runSimulation: 'Run Simulation',
    running: 'Running...',
    save: 'Save',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const SimulationControls: React.FC = () => {
  const {
    parameters,
    setParameters,
    setTopology,
    runSimulation,
    saveScenario,
    isLoading,
    error,
    results,
    language,
  } = useSimulationStore();

  const labels = LABELS[language];

  const handleRun = async () => {
    await runSimulation();
  };

  const handleSave = () => {
    const promptText = language === 'tr' ? 'Senaryo adını girin:' : 'Enter scenario name:';
    const name = prompt(promptText);
    if (name) {
      saveScenario(name);
    }
  };

  const handleTopologyChange = (topology: TopologyType) => {
    setTopology(topology);
  };

  const currentTopology = TOPOLOGY_INFO[parameters.topology_type];

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">{labels.title}</h2>
        <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${currentTopology.color}`}>
          {currentTopology.name[language]}
        </div>
      </div>

      {/* Workflow Selector */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-foreground">{labels.topologySelect}</label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(TOPOLOGY_INFO) as TopologyType[]).map((topology) => {
            const info = TOPOLOGY_INFO[topology];
            const isSelected = parameters.topology_type === topology;
            return (
              <button
                key={topology}
                onClick={() => handleTopologyChange(topology)}
                disabled={isLoading}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${isSelected
                    ? `border-primary ${info.color}/20 ring-2 ring-primary/50`
                    : 'border-border hover:border-primary/50'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-3 h-3 rounded-full ${info.color}`} />
                  <span className="font-medium text-foreground">{info.name[language]}</span>
                </div>
                <p className="text-xs text-muted-foreground">{info.description[language]}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
          <p className="font-medium">{labels.error}</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Simulation Parameters */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {labels.arrivalRate}
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={parameters.arrival_rate}
            onChange={(e) =>
              setParameters({
                arrival_rate: parseFloat(e.target.value) || 0.1,
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {labels.duration}
          </label>
          <input
            type="number"
            min="10"
            step="10"
            value={parameters.simulation_duration}
            onChange={(e) =>
              setParameters({
                simulation_duration: parseFloat(e.target.value) || 480.0,
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-2">
        <p className="font-medium text-blue-300 text-sm">ℹ️ {labels.infoTitle}</p>
        <ul className="text-xs text-blue-300/80 space-y-1">
          {labels.infoItems.map((item, i) => (
            <li key={i}>• {item}</li>
          ))}
          <li>
            • {parameters.topology_type === 'pcb_kam' ? labels.pcbKamInfo : labels.jpbInfo}
          </li>
        </ul>
      </div>

      {/* Results Summary */}
      {results && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="font-medium text-green-300 text-sm mb-2">📊 {labels.resultsTitle}</p>
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">{results.metrics.throughput}</div>
              <div className="text-xs text-green-300/70">{labels.partsPerHour}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">
                {results.metrics.average_lead_time.toFixed(1)}
              </div>
              <div className="text-xs text-green-300/70">{labels.avgMinutes}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{results.metrics.parts_completed}</div>
              <div className="text-xs text-green-300/70">{labels.completed}</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-400">{results.metrics.parts_started}</div>
              <div className="text-xs text-green-300/70">{labels.started}</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleRun}
          disabled={isLoading}
          className={`
            flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-md
            font-medium transition-colors
            ${currentTopology.color} text-white
            hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isLoading ? (
            <>
              <RotateCcw className="w-4 h-4 animate-spin" />
              {labels.running}
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              {labels.runSimulation}
            </>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={isLoading || !results}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          {labels.save}
        </button>
      </div>
    </div>
  );
};

export default SimulationControls;
