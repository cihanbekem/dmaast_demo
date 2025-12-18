import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSimulationStore } from '../store/simulationStore';

const Charts: React.FC = () => {
  const { results } = useSimulationStore();

  // Prepare bottleneck evolution data
  const bottleneckData = useMemo(() => {
    if (!results) return [];

    return results.time_series.map((snapshot) => ({
      time: snapshot.time,
      'Tampon 1': snapshot.queue_lengths.buffer1 || snapshot.queue_lengths.storage1 || 0,
      'CNC Kuyruğu': snapshot.queue_lengths.cnc || 0,
      'Tampon 2': snapshot.queue_lengths.buffer2 || snapshot.queue_lengths.storage2 || 0,
      // quality_control istasyonu için hem qc hem quality_control isimlerine bak
      'KK Kuyruğu': snapshot.queue_lengths.qc || snapshot.queue_lengths.quality_control || 0,
      'Üretim': snapshot.throughput || 0,
    }));
  }, [results]);

  // Prepare equipment effectiveness data
  const equipmentData = useMemo(() => {
    if (!results) return [];

    const machines = Object.entries(results.node_status)
      .filter(([_, status]) => status.type === 'machine')
      .map(([id, status]) => ({
        name: id.toUpperCase(),
        Kullanılabilirlik: status.availability || 0,
        Performans: status.utilization || 0,
        Verimlilik: status.efficiency || 0,
      }));

    return machines;
  }, [results]);

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <p className="text-muted-foreground">Grafikleri görmek için simülasyon çalıştırın</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bottleneck Evolution Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Darboğaz Gelişimi (Kuyruk Uzunlukları Zaman İçinde)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={bottleneckData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9ca3af"
              label={{ value: 'Zaman (dakika)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis stroke="#9ca3af" label={{ value: 'Kuyruk Uzunluğu', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #374151',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Tampon 1"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="CNC Kuyruğu"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="Tampon 2"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="KK Kuyruğu"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="stepAfter"
              dataKey="Üretim"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="10 5"
              dot={false}
              name="Üretim Hızı (parça/saat)"
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Equipment Effectiveness Chart */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Ekipman Etkinliği (OEE Bileşenleri)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={equipmentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" label={{ value: 'Yüzde (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #374151',
                borderRadius: '6px',
              }}
            />
            <Legend />
            <Bar dataKey="Kullanılabilirlik" fill="#3b82f6" />
            <Bar dataKey="Performans" fill="#10b981" />
            <Bar dataKey="Verimlilik" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;

