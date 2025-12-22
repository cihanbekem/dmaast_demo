import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '../../lib/utils';
import { Package, AlertTriangle, Warehouse, Users, ArrowDownToLine } from 'lucide-react';

interface BufferNodeData {
  label: string;
  type?: 'source' | 'sink';
  capacity?: number;
  current?: number;
  isBottleneck?: boolean;
  nodeId?: string;
}

// Determine icon based on node type and ID
const getNodeIcon = (type?: string, nodeId?: string) => {
  if (type === 'source') return <ArrowDownToLine className="w-4 h-4" />;
  if (type === 'sink') return <Users className="w-4 h-4" />;
  if (nodeId?.includes('warehouse') || nodeId?.includes('inventory')) {
    return <Warehouse className="w-4 h-4" />;
  }
  return <Package className="w-4 h-4" />;
};

const BufferNode: React.FC<NodeProps<BufferNodeData>> = ({ data, selected }) => {
  const {
    label,
    type,
    capacity = 100,
    current = 0,
    isBottleneck = false,
    nodeId,
  } = data;

  const utilization = capacity > 0 ? (current / capacity) * 100 : 0;
  const isSource = type === 'source';
  const isSink = type === 'sink';

  const Icon = () => getNodeIcon(type, nodeId);

  // Border color based on type
  const getBorderColor = () => {
    if (isBottleneck) return 'border-red-500';
    if (isSource) return 'border-emerald-500';
    if (isSink) return 'border-emerald-500';
    return 'border-border';
  };

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 bg-card transition-all duration-200',
        'min-w-[180px] max-w-[200px]',
        getBorderColor(),
        isBottleneck && 'pulse-bottleneck',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
    >
      {!isSource && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-primary"
        />
      )}

      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            'p-1.5 rounded',
            isSource && 'bg-emerald-500/10 text-emerald-500',
            isSink && 'bg-emerald-500/10 text-emerald-500',
            !isSource && !isSink && 'bg-blue-500/10 text-blue-500'
          )}
        >
          <Icon />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground truncate" title={label}>
            {label}
          </div>
        </div>
        {isBottleneck && <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />}
      </div>

      {/* Source shows entry point indicator */}
      {isSource && (
        <div className="text-xs text-emerald-400 font-medium flex items-center gap-1">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Entry Point
        </div>
      )}

      {/* Regular buffer shows capacity */}
      {!isSource && !isSink && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Capacity</span>
              <span className="text-foreground font-medium">
                {current} / {capacity}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  utilization > 85
                    ? 'bg-red-500'
                    : utilization > 70
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                )}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">{utilization.toFixed(0)}% full</div>
        </>
      )}

      {/* Sink shows completed count */}
      {isSink && (
        <div className="bg-emerald-500/10 rounded-lg p-2 mt-1">
          <div className="text-xs text-muted-foreground">Completed</div>
          <div className="text-xl font-bold text-emerald-400">{current}</div>
        </div>
      )}

      {!isSink && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary"
        />
      )}
    </div>
  );
};

export default BufferNode;
