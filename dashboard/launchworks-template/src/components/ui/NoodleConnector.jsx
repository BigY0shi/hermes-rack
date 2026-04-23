import { useEffect, useRef } from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/**
 * NoodleConnector — curved SVG path connecting two DOM elements visually.
 * For static layout connections (provide from/to positions manually).
 */
export default function NoodleConnector({
  x1 = 0, y1 = 0, x2 = 200, y2 = 0,
  curvature = 0.4,
  color = '#f97316',
  strokeWidth = 1.5,
  delay = 0,
  animated = true,
  className = '',
}) {
  const [ref, isVisible] = useScrollReveal();

  const dx = x2 - x1;
  const dy = y2 - y1;
  const cx1 = x1 + dx * curvature;
  const cy1 = y1;
  const cx2 = x2 - dx * curvature;
  const cy2 = y2;

  const totalLen = Math.sqrt(dx * dx + dy * dy) * 1.3;
  const pathD = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

  return (
    <div ref={ref} className={`pointer-events-none ${className}`} aria-hidden="true">
      <svg
        style={{ overflow: 'visible', position: 'absolute', top: 0, left: 0 }}
        width="100%" height="100%"
      >
        <defs>
          <linearGradient id={`ng-${x1}-${y1}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0" />
            <stop offset="40%" stopColor={color} stopOpacity="0.8" />
            <stop offset="60%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Static ghost path */}
        <path d={pathD} fill="none" stroke={color} strokeOpacity={0.08} strokeWidth={strokeWidth} />
        {/* Animated beam path */}
        {animated && (
          <path
            d={pathD}
            fill="none"
            stroke={`url(#ng-${x1}-${y1})`}
            strokeWidth={strokeWidth + 0.5}
            strokeLinecap="round"
            style={{
              strokeDasharray: totalLen,
              strokeDashoffset: isVisible ? 0 : totalLen,
              transition: `stroke-dashoffset 1.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
              filter: `drop-shadow(0 0 4px ${color}80)`,
            }}
          />
        )}
      </svg>
    </div>
  );
}