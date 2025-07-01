'use client';

import { useEffect, useState, useRef } from 'react';

interface PerformanceMonitorProps {
  isVisible?: boolean;
}

export function PerformanceMonitor({ isVisible = true }: PerformanceMonitorProps) {
  const [fps, setFps] = useState(0);
  const [renderTime, setRenderTime] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const renderStartRef = useRef(0);

  useEffect(() => {
    if (!isVisible) return;

    let animationId: number;

    const measurePerformance = () => {
      renderStartRef.current = performance.now();
      
      const now = performance.now();
      frameCountRef.current++;

      // Calculate FPS every second
      if (now - lastTimeRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastTimeRef.current)));
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      // Simulate render time measurement
      setTimeout(() => {
        const renderEnd = performance.now();
        setRenderTime(Math.round((renderEnd - renderStartRef.current) * 100) / 100);
      }, 0);

      animationId = requestAnimationFrame(measurePerformance);
    };

    animationId = requestAnimationFrame(measurePerformance);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  // Performance indicators
  const fpsColor = fps >= 55 ? 'text-green-600' : fps >= 30 ? 'text-yellow-600' : 'text-red-600';
  const renderColor = renderTime <= 16 ? 'text-green-600' : renderTime <= 33 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg font-mono text-sm z-50">
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span>FPS:</span>
          <span className={`font-bold ${fpsColor}`}>{fps}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Render:</span>
          <span className={`font-bold ${renderColor}`}>{renderTime}ms</span>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Target: 60 FPS (&lt;16ms)
        </div>
      </div>
    </div>
  );
}
