/**
 * SonarPing — pulsing sonar rings around a center dot.
 */
export default function SonarPing({
  size = 8,
  color = '#f97316',
  rings = 3,
  className = '',
}) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {Array.from({ length: rings }).map((_, i) => (
        <span
          key={i}
          className="sonar-ring absolute"
          style={{
            width: size,
            height: size,
            color,
            borderColor: color,
            animationDelay: `${i * 0.8}s`,
            animationDuration: '2.5s',
          }}
        />
      ))}
      <span
        className="relative rounded-full z-10"
        style={{ width: size * 0.6, height: size * 0.6, background: color, boxShadow: `0 0 6px ${color}` }}
      />
    </div>
  );
}