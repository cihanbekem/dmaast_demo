import React from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { Play, Save } from 'lucide-react';

const SimulationControls: React.FC = () => {
  const {
    parameters,
    setParameters,
    runSimulation,
    saveScenario,
    isLoading,
    error,
  } = useSimulationStore();

  const handleRun = async () => {
    await runSimulation();
  };

  const handleSave = () => {
    const name = prompt('Senaryo adını girin:');
    if (name) {
      saveScenario(name);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <h2 className="text-xl font-semibold text-foreground mb-4">Simülasyon Parametreleri</h2>
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Machine Counts */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            CNC Makine Sayısı
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={parameters.machine_counts.cnc}
            onChange={(e) =>
              setParameters({
                machine_counts: {
                  ...parameters.machine_counts,
                  cnc: parseInt(e.target.value) || 1,
                },
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kalite Kontrol Makine Sayısı
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={parameters.machine_counts.quality_control}
            onChange={(e) =>
              setParameters({
                machine_counts: {
                  ...parameters.machine_counts,
                  quality_control: parseInt(e.target.value) || 1,
                },
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        {/* Processing Times */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            CNC İşlem Süresi (dakika)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={parameters.mean_processing_times.cnc}
            onChange={(e) =>
              setParameters({
                mean_processing_times: {
                  ...parameters.mean_processing_times,
                  cnc: parseFloat(e.target.value) || 10.0,
                },
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Kalite Kontrol İşlem Süresi (dakika)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={parameters.mean_processing_times.quality_control}
            onChange={(e) =>
              setParameters({
                mean_processing_times: {
                  ...parameters.mean_processing_times,
                  quality_control: parseFloat(e.target.value) || 5.0,
                },
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        {/* Arrival Rate */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Geliş Hızı (parça/dakika)
          </label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={parameters.arrival_rates}
            onChange={(e) =>
              setParameters({
                arrival_rates: parseFloat(e.target.value) || 0.1,
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        {/* Simulation Duration */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Simülasyon Süresi (dakika)
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

        {/* Buffer Capacities */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tampon 1 Kapasitesi
          </label>
          <input
            type="number"
            min="1"
            value={parameters.buffer_capacities.buffer1}
            onChange={(e) =>
              setParameters({
                buffer_capacities: {
                  ...parameters.buffer_capacities,
                  buffer1: parseInt(e.target.value) || 20,
                },
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tampon 2 Kapasitesi
          </label>
          <input
            type="number"
            min="1"
            value={parameters.buffer_capacities.buffer2}
            onChange={(e) =>
              setParameters({
                buffer_capacities: {
                  ...parameters.buffer_capacities,
                  buffer2: parseInt(e.target.value) || 20,
                },
              })
            }
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground"
          />
        </div>
      </div>

      {/* Info Message */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
        <p className="font-medium mb-1">ℹ️ Simülasyon Hakkında</p>
        <p className="text-xs">
          Simülasyon zamanı (örn. 480 dk) gerçek zamanlı değildir. SimPy discrete event simulation kullanır, 
          bu yüzden 480 dakikalık simülasyon birkaç saniye içinde tamamlanır.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleRun}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Play className="w-4 h-4" />
          {isLoading ? 'Çalışıyor...' : 'Simülasyonu Başlat'}
        </button>

        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="w-4 h-4" />
          Senaryoyu Kaydet
        </button>
      </div>
    </div>
  );
};

export default SimulationControls;

