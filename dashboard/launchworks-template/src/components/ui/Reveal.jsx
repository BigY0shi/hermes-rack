import { useScrollReveal } from '../../hooks/useScrollReveal';

const directionMap = {
  up: 'translateY(40px)',
  down: 'translateY(-40px)',
  left: 'translateX(-40px)',
  right: 'translateX(40px)',
  scale: 'scale(0.92)',
  none: 'none',
};

export default function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  duration = 800,
  scale = false,
  blur = true,
}) {
  const [ref, isVisible] = useScrollReveal();
  const transform = scale ? directionMap.scale : directionMap[direction] ?? directionMap.up;

  return (
    <div
      ref={ref}
      className={`will-change-transform ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(0) scale(1)' : transform,
        filter: isVisible ? 'blur(0px)' : blur ? 'blur(8px)' : 'blur(0px)',
        transition: `opacity ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter ${duration}ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}