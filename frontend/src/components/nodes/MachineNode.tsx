import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '../../lib/utils';
import { AlertTriangle, Cog, Truck, CheckCircle } from 'lucide-react';

interface MachineNodeData {
  label: string;
  utilization: number;
  availability?: number;
  efficiency?: number;
  isBottleneck?: boolean;
  isBroken?: boolean;
  nodeId?: string;
}

// Determine icon based on node ID
const getNodeIcon = (nodeId?: string) => {
  if (!nodeId) return <Cog className="w-4 h-4" />;
  if (nodeId.includes('log')) return <Truck className="w-4 h-4" />;
  if (nodeId.includes('qa') || nodeId.includes('sqa')) return <CheckCircle className="w-4 h-4" />;
  return <Cog className="w-4 h-4" />;
};

const MachineNode: React.FC<NodeProps<MachineNodeData>> = ({ data, selected }) => {
  const {
    label,
    utilization = 0,
    availability = 100,
    efficiency = 0,
    isBottleneck = false,
    isBroken = false,
    nodeId,
  } = data;

  // Calculate progress bar color
  const getColor = () => {
    if (isBroken) return 'bg-red-500';
    if (utilization > 85) return 'bg-red-500';
    if (utilization > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const Icon = () => getNodeIcon(nodeId);

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card transition-all duration-200',
        'min-w-[200px] max-w-[220px]',
        isBottleneck && 'pulse-bottleneck border-red-500',
        !isBottleneck && !selected && 'border-border',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        isBroken && 'border-red-600 bg-red-950/20'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary"
      />

      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 bg-primary/10 rounded text-primary">
          <Icon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate" title={label}>
            {label}
          </div>
        </div>
        {isBottleneck && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
        {isBroken && (
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shrink-0" />
        )}
      </div>

      {/* Utilization Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Utilization</span>
          <span className="text-foreground font-medium">{utilization.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className={cn('h-2 rounded-full transition-all duration-300', getColor())}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>

      {/* Availability & Efficiency (compact) */}
      <div className="grid grid-cols-2 gap-2 text-xs mt-2 pt-2 border-t border-border/50">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Avail.</span>
          <span
            className={cn(
              'font-medium',
              availability < 80 ? 'text-red-400' : 'text-foreground'
            )}
          >
            {availability.toFixed(0)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Eff.</span>
          <span className="text-foreground font-medium">{efficiency.toFixed(0)}%</span>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary"
      />
    </div>
  );
};

export default MachineNode;
