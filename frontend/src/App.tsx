import ProcessMap from './components/ProcessMap';
import SimulationControls from './components/SimulationControls';
import MetricsPanel from './components/MetricsPanel';
import Charts from './components/Charts';
import ScenarioComparison from './components/ScenarioComparison';
import InsightsPanel from './components/InsightsPanel';
import OperationalImpactPanel from './components/OperationalImpactPanel';
import { Factory } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <Factory className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Kritik Altyapı Dijital İkiz
              </h1>
              <p className="text-sm text-muted-foreground">
                Üretim Hattı Simülasyonu ve Analitik Paneli
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <SimulationControls />
            <MetricsPanel />
            <InsightsPanel />
            <OperationalImpactPanel />
          </div>

          {/* Middle Column - Process Map */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Üretim Hattı Topolojisi
              </h2>
              <div className="h-[600px]">
                <ProcessMap />
              </div>
            </div>

            {/* Charts */}
            <Charts />
          </div>
        </div>

        {/* Scenario Comparison */}
        <div className="mt-6">
          <ScenarioComparison />
        </div>
      </main>
    </div>
  );
}

export default App;
