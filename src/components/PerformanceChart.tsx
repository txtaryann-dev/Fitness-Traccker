import React, { useState } from 'react';
import { PacePoint } from '../types';

interface PerformanceChartProps {
  data?: PacePoint[];
  totalTimeMinutes?: number;
  avgPace?: string;
  className?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  totalTimeMinutes = 48,
  className = '',
}) => {
  const [activeMetric, setActiveMetric] = useState<'pace' | 'elevation'>('pace');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string; time: string } | null>(null);

  // Default realistic pace curve if no specific points provided
  const points: PacePoint[] = data && data.length > 0
    ? data
    : [
        { time: 0, pace: 5.2, elevation: 120 },
        { time: 8, pace: 5.0, elevation: 128 },
        { time: 16, pace: 4.8, elevation: 140 },
        { time: 24, pace: 4.6, elevation: 155 },
        { time: 32, pace: 4.7, elevation: 145 },
        { time: 40, pace: 4.4, elevation: 135 },
        { time: 48, pace: 4.2, elevation: 125 },
      ];

  const maxVal = Math.max(...points.map((p) => (activeMetric === 'pace' ? p.pace : (p.elevation || 100))));
  const minVal = Math.min(...points.map((p) => (activeMetric === 'pace' ? p.pace : (p.elevation || 0))));
  const range = maxVal - minVal || 1;

  // SVG coordinate transformation (width: 100, height: 60)
  const svgPoints = points.map((p, index) => {
    const x = (index / (points.length - 1)) * 100;
    // For pace, lower pace number = faster (so higher on chart)
    const normalized = activeMetric === 'pace'
      ? (maxVal - p.pace) / range
      : (p.elevation! - minVal) / range;
    const y = 50 - normalized * 40; // keep padding
    return { x, y, point: p };
  });

  const pathString = svgPoints.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    // Smooth bezier curve control
    const prev = svgPoints[idx - 1];
    const cpX1 = prev.x + (curr.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (curr.x - prev.x) / 2;
    const cpY2 = curr.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
  }, '');

  const areaString = `${pathString} L 100 60 L 0 60 Z`;

  return (
    <div className={`bg-white p-5 md:p-6 rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col gap-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A]">
            {activeMetric === 'pace' ? 'Pace over Time' : 'Elevation Profile'}
          </h3>
          <p className="text-xs text-[#64748B]">
            {activeMetric === 'pace' ? 'Smoothed minute pacing curve' : 'Climb & descent topography'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0]">
          <button
            onClick={() => setActiveMetric('pace')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              activeMetric === 'pace'
                ? 'bg-[#FF5600] text-white'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            PACE
          </button>
          <button
            onClick={() => setActiveMetric('elevation')}
            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
              activeMetric === 'elevation'
                ? 'bg-[#FF5600] text-white'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            ELEVATION
          </button>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="w-full h-44 relative flex items-end pt-2">
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between border-l border-[#E2E8F0] pb-6 pointer-events-none">
          <div className="w-full border-t border-dashed border-[#E2E8F0] h-0"></div>
          <div className="w-full border-t border-dashed border-[#E2E8F0] h-0"></div>
          <div className="w-full border-t border-[#E2E8F0] h-0"></div>
        </div>

        {/* SVG Curve */}
        <div className="relative w-full h-full pb-6">
          <svg
            className="w-full h-full overflow-visible"
            viewBox="0 0 100 60"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="velocityChartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5600" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FF5600" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gradient Fill */}
            <path d={areaString} fill="url(#velocityChartGrad)" />

            {/* Line Stroke */}
            <path
              d={pathString}
              fill="none"
              stroke="#FF5600"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
            />

            {/* Interactive Circles */}
            {svgPoints.map((pt, idx) => (
              <g key={idx}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#FF5600"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  className="cursor-pointer hover:r-5 transition-all"
                  onMouseEnter={() =>
                    setHoveredPoint({
                      x: pt.x,
                      y: pt.y,
                      val:
                        activeMetric === 'pace'
                          ? `${pt.point.pace.toFixed(2)} min/km`
                          : `${pt.point.elevation} m`,
                      time: `${pt.point.time}m`,
                    })
                  }
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-[#0F172A] text-white text-[11px] px-2 py-1 rounded shadow-lg -translate-x-1/2 -translate-y-full"
              style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
            >
              <div className="font-bold">{hoveredPoint.val}</div>
              <div className="text-[10px] text-gray-300">at {hoveredPoint.time}</div>
            </div>
          )}
        </div>

        {/* X-Axis labels */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[11px] font-medium text-[#64748B]">
          <span>0m</span>
          <span>{Math.round(totalTimeMinutes * 0.25)}m</span>
          <span>{Math.round(totalTimeMinutes * 0.5)}m</span>
          <span>{Math.round(totalTimeMinutes * 0.75)}m</span>
          <span>{totalTimeMinutes}m</span>
        </div>
      </div>
    </div>
  );
};
