import React from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { cn } from '../../lib/utils';
import { Package, AlertTriangle } from 'lucide-react';

interface BufferNodeData {
  label: string;
  type?: 'source' | 'sink';
  capacity?: number;
  current?: number;
  isBottleneck?: boolean;
}

const BufferNode: React.FC<NodeProps<BufferNodeData>> = ({ data }) => {
  const { label, type, capacity = 20, current = 0, isBottleneck = false } = data;
  
  const utilization = capacity > 0 ? (current / capacity) * 100 : 0;
  const isSource = type === 'source';
  const isSink = type === 'sink';

  return (
    <div
      className={cn(
        'px-4 py-3 shadow-lg rounded-lg border-2 min-w-[150px] bg-card',
        isBottleneck && 'pulse-bottleneck border-red-500',
        !isBottleneck && 'border-border',
        isSource && 'border-blue-500',
        isSink && 'border-green-500'
      )}
    >
      {!isSource && <Handle type="target" position={Position.Left} className="w-3 h-3" />}
      
      <div className="flex items-center gap-2 mb-2">
        <Package className="w-4 h-4 text-primary" />
        <div className="font-semibold text-sm text-foreground">{label}</div>
        {isBottleneck && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
      </div>

      {!isSource && (
        <>
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Kapasite</span>
              <span className="text-foreground font-medium">
                {current} / {capacity}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  utilization > 85 ? 'bg-red-500' : utilization > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                )}
                style={{ width: `${Math.min(utilization, 100)}%` }}
              />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {utilization.toFixed(1)}% dolu
          </div>
        </>
      )}

      {isSink && (
        <div className="text-xs text-green-400 font-medium mt-2">
          Tamamlanan: {current}
        </div>
      )}

      {!isSink && <Handle type="source" position={Position.Right} className="w-3 h-3" />}
    </div>
  );
};

export default BufferNode;

