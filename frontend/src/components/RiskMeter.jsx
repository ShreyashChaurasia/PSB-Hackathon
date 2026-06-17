import { useEffect, useRef, useState } from 'react';

export default function RiskMeter({ score = 0, level = 'LOW' }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const requestRef = useRef();

  // Animate the score on mount / change
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * score);
      setAnimatedScore(current);

      if (progress < 1) {
        requestRef.current = requestAnimationFrame(animate);
      }
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [score]);

  // SVG arc calculations
  const size = 220;
  const strokeWidth = 14;
  const center = size / 2;
  const radius = center - strokeWidth - 10;

  // Semi-circle: from 180° to 0° (left to right, bottom arc)
  const startAngle = 180;
  const endAngle = 0;
  const totalArc = 180;
  const circumference = Math.PI * radius;

  // Score arc
  const scoreAngle = (animatedScore / 100) * totalArc;
  const scoreDash = (scoreAngle / 360) * (2 * Math.PI * radius);

  // Color based on score
  const getColor = (s) => {
    if (s <= 30) return '#10b981';
    if (s <= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getGlowColor = (s) => {
    if (s <= 30) return 'rgba(16, 185, 129, 0.4)';
    if (s <= 60) return 'rgba(245, 158, 11, 0.4)';
    return 'rgba(239, 68, 68, 0.4)';
  };

  const color = getColor(animatedScore);
  const glowColor = getGlowColor(animatedScore);

  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy - r * Math.sin(angleRad),
    };
  };

  // Background arc path (full semi-circle)
  const bgStart = polarToCartesian(center, center, radius, startAngle);
  const bgEnd = polarToCartesian(center, center, radius, endAngle);
  const bgPath = `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 0 1 ${bgEnd.x} ${bgEnd.y}`;

  // Score arc path
  const arcEnd = startAngle - scoreAngle;
  const scoreEnd = polarToCartesian(center, center, radius, arcEnd);
  const largeArc = scoreAngle > 180 ? 1 : 0;
  const scorePath = scoreAngle > 0
    ? `M ${bgStart.x} ${bgStart.y} A ${radius} ${radius} 0 ${largeArc} 1 ${scoreEnd.x} ${scoreEnd.y}`
    : '';

  const levelText = level?.toUpperCase() || (
    animatedScore <= 30 ? 'LOW RISK' :
    animatedScore <= 60 ? 'MEDIUM RISK' : 'HIGH RISK'
  );

  return (
    <div style={containerStyle}>
      <div style={{
        ...glowWrapStyle,
        boxShadow: `0 0 60px ${glowColor}, 0 0 120px ${glowColor.replace('0.4', '0.15')}`,
      }}>
        <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`}>
          {/* Glow filter */}
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Background track */}
          <path
            d={bgPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Score arc */}
          {scorePath && (
            <path
              d={scorePath}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#glow)"
              style={{
                transition: 'stroke 0.3s ease',
              }}
            />
          )}

          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const tickAngle = 180 - (tick / 100) * 180;
            const inner = polarToCartesian(center, center, radius - strokeWidth / 2 - 4, tickAngle);
            const outer = polarToCartesian(center, center, radius - strokeWidth / 2 - 12, tickAngle);
            return (
              <line
                key={tick}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="1.5"
              />
            );
          })}

          {/* Score number */}
          <text
            x={center}
            y={center - 10}
            textAnchor="middle"
            fill={color}
            fontSize="42"
            fontWeight="800"
            fontFamily="Inter, sans-serif"
            style={{ transition: 'fill 0.3s ease' }}
          >
            {animatedScore}
          </text>

          {/* Label */}
          <text
            x={center}
            y={center + 20}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            letterSpacing="2"
          >
            {levelText}
          </text>
        </svg>
      </div>
    </div>
  );
}

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '10px',
};

const glowWrapStyle = {
  borderRadius: '50%',
  padding: '10px',
  transition: 'box-shadow 1s ease',
};
