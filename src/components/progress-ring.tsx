interface ProgressRingProps {
  /** 0 = empty (done), 1 = full (just started) */
  progress: number;
  /** px — should match the visual width of the timer text */
  size: number;
}

export function ProgressRing({ progress, size }: ProgressRingProps) {
  const strokeWidth = 1.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Clamp progress to [0, 1]
  const clamped = Math.min(1, Math.max(0, progress));
  // dashoffset: 0 = full ring, circumference = empty
  const dashOffset = circumference * (1 - clamped);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
        // Rotate so arc starts from 12 o'clock
        rotate: '-90deg',
      }}
    >
      {/* Track — faint full circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-border)"
        strokeWidth={strokeWidth}
      />
      {/* Depleting arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        style={{
          transition: `stroke-dashoffset 1s linear, stroke var(--dur-slow) var(--ease)`,
        }}
      />
    </svg>
  );
}
