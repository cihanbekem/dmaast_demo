import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '../../lib/utils';
import { AlertTriangle } from 'lucide-react';

interface MachineNodeData {
  label: string;
  utilization: number;
  availability?: number;
  efficiency?: number;
  isBottleneck: boolean;
  isBroken?: boolean;
}

const MachineNode: React.FC<NodeProps<MachineNodeData>> = ({ data }) => {
  const { label, utilization, availability = 100, efficiency = 0, isBottleneck, isBroken } = data;

  // Calculate progress bar color
  const getColor = () => {
    if (isBroken) return 'bg-red-500';
    if (utilization > 85) return 'bg-red-500';
    if (utilization > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 min-w-[180px] bg-card',
        isBottleneck && 'pulse-bottleneck border-red-500',
        !isBottleneck && 'border-border',
        isBroken && 'border-red-600 bg-red-950/20'
      )}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-sm text-foreground">{label}</div>
        {isBottleneck && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
        {isBroken && (
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        )}
      </div>

      {/* Utilization Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Kullanım</span>
          <span className="text-foreground font-medium">{utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getColor())}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>

      {/* Availability & Efficiency */}
      {(availability !== undefined || efficiency !== undefined) && (
        <div className="grid grid-cols-2 gap-2 text-xs mt-2">
          {availability !== undefined && (
            <div>
              <div className="text-muted-foreground">Kullanılabilirlik</div>
              <div className="text-foreground font-medium">{availability.toFixed(1)}%</div>
            </div>
          )}
          {efficiency !== undefined && (
            <div>
              <div className="text-muted-foreground">Verimlilik</div>
              <div className="text-foreground font-medium">{efficiency.toFixed(1)}%</div>
            </div>
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} className="w-3 h-3" />
    </div>
  );
};

export default MachineNode;

