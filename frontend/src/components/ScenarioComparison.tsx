import React, { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { BarChart3 } from 'lucide-react';

const ScenarioComparison: React.FC = () => {
  const { savedScenarios, clearScenarios, results } = useSimulationStore();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);

  if (savedScenarios.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground">Kaydedilmiş senaryo yok. Karşılaştırmak için bir senaryo kaydedin.</p>
      </div>
    );
  }

  const toggleScenario = (name: string) => {
    setSelectedScenarios((prev) =>
      prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]
    );
  };

  const scenariosToCompare = savedScenarios.filter((s) =>
    selectedScenarios.includes(s.name)
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Senaryo Karşılaştırması
        </h2>
        <button
          onClick={clearScenarios}
          className="text-sm text-destructive hover:text-destructive/80"
        >
          Tümünü Temizle
        </button>
      </div>

      {/* Scenario List */}
      <div className="space-y-2">
        {savedScenarios.map((scenario) => (
          <div
            key={scenario.name}
            className="flex items-center justify-between p-3 bg-background border border-border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selectedScenarios.includes(scenario.name)}
                onChange={() => toggleScenario(scenario.name)}
                className="w-4 h-4"
              />
              <div>
                <div className="font-medium text-foreground">{scenario.name}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(scenario.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="text-sm text-foreground">
              {scenario.results.metrics.throughput.toFixed(2)} parça/saat
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      {scenariosToCompare.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-2 text-foreground">Metrik</th>
                {scenariosToCompare.map((scenario) => (
                  <th key={scenario.name} className="text-right p-2 text-foreground">
                    {scenario.name}
                  </th>
                ))}
                {results && (
                  <th className="text-right p-2 text-primary font-semibold">Mevcut</th>
                )}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="p-2 text-muted-foreground">Üretim Hızı (parça/saat)</td>
                {scenariosToCompare.map((scenario) => (
                  <td key={scenario.name} className="text-right p-2 text-foreground">
                    {scenario.results.metrics.throughput.toFixed(2)}
                  </td>
                ))}
                {results && (
                  <td className="text-right p-2 text-primary font-semibold">
                    {results.metrics.throughput.toFixed(2)}
                  </td>
                )}
              </tr>
              <tr className="border-b border-border">
                <td className="p-2 text-muted-foreground">Ort. Teslim Süresi (dk)</td>
                {scenariosToCompare.map((scenario) => (
                  <td key={scenario.name} className="text-right p-2 text-foreground">
                    {scenario.results.metrics.average_lead_time.toFixed(2)}
                  </td>
                ))}
                {results && (
                  <td className="text-right p-2 text-primary font-semibold">
                    {results.metrics.average_lead_time.toFixed(2)}
                  </td>
                )}
              </tr>
              <tr className="border-b border-border">
                <td className="p-2 text-muted-foreground">Tamamlanan Parça</td>
                {scenariosToCompare.map((scenario) => (
                  <td key={scenario.name} className="text-right p-2 text-foreground">
                    {scenario.results.metrics.parts_completed}
                  </td>
                ))}
                {results && (
                  <td className="text-right p-2 text-primary font-semibold">
                    {results.metrics.parts_completed}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ScenarioComparison;

