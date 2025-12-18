import React, { useEffect, useState, useRef } from 'react';
import { type EdgeProps, getBezierPath } from 'reactflow';

const AnimatedEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [particles, setParticles] = useState<Array<{ id: number; progress: number }>>([]);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    // Create particles that move along the edge
    const interval = setInterval(() => {
      setParticles((prev) => {
        const newParticles = prev
          .map((p) => ({ ...p, progress: p.progress + 0.015 }))
          .filter((p) => p.progress < 1);
        
        // Add new particle periodically
        if (Math.random() > 0.85) {
          newParticles.push({ id: Date.now() + Math.random(), progress: 0 });
        }
        
        // Limit particles
        return newParticles.slice(-5);
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getPointAtLength = (progress: number) => {
    if (!pathRef.current) return null;
    const pathLength = pathRef.current.getTotalLength();
    return pathRef.current.getPointAtLength(pathLength * progress);
  };

  return (
    <>
      <path
        ref={pathRef}
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        stroke="#64748b"
        strokeWidth={2}
        fill="none"
      />
      {particles.map((particle) => {
        const point = getPointAtLength(particle.progress);
        if (!point) return null;

        return (
          <circle
            key={particle.id}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#3b82f6"
            opacity={0.8}
            style={{
              filter: 'drop-shadow(0 0 6px #3b82f6)',
              transition: 'opacity 0.1s',
            }}
          />
        );
      })}
    </>
  );
};

export default AnimatedEdge;

