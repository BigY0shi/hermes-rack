/**
 * BeamLine — animated SVG beam for vertical or horizontal connectors.
 * direction: 'vertical' | 'horizontal'
 * length: px number
 * color: stroke color (default orange)
 * delay: animation-delay in seconds
 */
export default function BeamLine({
  direction = 'vertical',
  length = 120,
  color = '#f97316',
  delay = 0,
  className = '',
  strokeWidth = 1,
}) {
  const isVertical = direction === 'vertical';
  const w = isVertical ? 2 : length;
  const h = isVertical ? length : 2;
  const x1 = isVertical ? 1 : 0;
  const y1 = isVertical ? 0 : 1;
  const x2 = isVertical ? 1 : length;
  const y2 = isVertical ? length : 1;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={`pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Static dim track */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeOpacity={0.12}
      />
      {/* Animated beam */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color}
        strokeWidth={strokeWidth + 0.5}
        strokeOpacity={0.9}
        strokeLinecap="round"
        className="beam-path"
        style={{ animationDelay: `${delay}s` }}
      />
    </svg>
  );
}