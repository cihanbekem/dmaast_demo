import ProcessMap from './components/ProcessMap';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import Charts from './components/Charts';
import ScenarioComparison from './components/ScenarioComparison';
import InsightsPanel from './components/InsightsPanel';
import OperationalImpactPanel from './components/OperationalImpactPanel';
import InfoPanel from './components/InfoPanel';
import { Factory, Globe } from 'lucide-react';
import { useSimulationStore } from './store/simulationStore';

function App() {
  const { language, setLanguage, parameters } = useSimulationStore();

  const toggleLanguage = () => {
    setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  const topologyLabel = parameters.topology_type === 'pcb_kam' ? 'PCB + KAM' : 'JPB';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Factory className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {language === 'tr' ? 'DMaaST Değer Zinciri Dijital İkizi' : 'DMaaST Value Chain Digital Twin'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {language === 'tr' 
                    ? `${topologyLabel} Simülasyonu ve Analitik Paneli` 
                    : `${topologyLabel} Simulation & Analytics Dashboard`}
                </p>
              </div>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="font-medium">{language.toUpperCase()}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Full Width */}
      <main className="max-w-[1920px] mx-auto px-6 py-6">
        {/* Topology Section - Full Width */}
        <div className="bg-card border border-border rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              {language === 'tr' ? 'Değer Zinciri Topolojisi' : 'Value Chain Topology'}
            </h2>
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {language === 'tr' ? 'Detaylar için düğüme tıklayın' : 'Click a node for details'}
            </span>
          </div>
          <div className="h-[500px] lg:h-[600px] xl:h-[700px]">
            <ProcessMap />
          </div>
        </div>

        {/* Bottom Section - Controls & Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Left Column - Controls (narrower) */}
          <div className="lg:col-span-1 space-y-6">
            <SimulationControls />
          </div>

          {/* Middle Column - Metrics & Insights */}
          <div className="lg:col-span-1 space-y-6">
            <MetricsPanel />
            <InsightsPanel />
          </div>

          {/* Right Column - Charts (wider) */}
          <div className="lg:col-span-2 xl:col-span-3">
            <Charts />
            <div className="mt-6">
              <OperationalImpactPanel />
            </div>
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="mt-6">
          <ScenarioComparison />
        </div>
      </main>

      {/* Info Panel (slides in from right) */}
      <InfoPanel />
    </div>
  );
}

export default App;
