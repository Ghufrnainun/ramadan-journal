interface LanternProps {
  className?: string;
  delay?: number;
  speed?: 'slow' | 'normal' | 'fast';
}

export function Lantern({ className = '', delay = 0, speed = 'normal' }: LanternProps) {
  const animationClass = {
    slow: 'animate-lantern-swing-slow',
    normal: 'animate-lantern-swing',
    fast: 'animate-lantern-swing-fast',
  }[speed];

  return (
    <div 
      className={`${className} ${animationClass}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <svg
        width="40"
        height="80"
        viewBox="0 0 40 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* String */}
        <line x1="20" y1="0" x2="20" y2="15" stroke="hsl(var(--gold) / 0.6)" strokeWidth="1" />
        
        {/* Top cap */}
        <path
          d="M14 15 L26 15 L24 20 L16 20 Z"
          fill="hsl(var(--gold))"
        />
        
        {/* Lantern body */}
        <path
          d="M12 20 C12 20 8 35 8 45 C8 55 12 65 20 65 C28 65 32 55 32 45 C32 35 28 20 28 20 L12 20"
          fill="hsl(var(--gold) / 0.3)"
          stroke="hsl(var(--gold))"
          strokeWidth="1.5"
        />
        
        {/* Inner glow */}
        <ellipse
          cx="20"
          cy="42"
          rx="8"
          ry="12"
          fill="hsl(var(--gold-glow))"
          className="animate-glow-pulse"
        />
        
        {/* Decorative bands */}
        <path
          d="M10 30 Q20 28 30 30"
          stroke="hsl(var(--gold))"
          strokeWidth="1"
          fill="none"
        />
        <path
          d="M9 45 Q20 43 31 45"
          stroke="hsl(var(--gold))"
          strokeWidth="1"
          fill="none"
        />
        
        {/* Bottom tip */}
        <path
          d="M16 65 L20 75 L24 65"
          fill="hsl(var(--gold))"
        />
      </svg>
      
      {/* Glow effect below lantern */}
      <div 
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gold-glow/20 blur-xl animate-glow-pulse"
        style={{ animationDelay: `${delay + 0.5}s` }}
      />
    </div>
  );
}

export function LanternRow() {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-around px-8 pointer-events-none">
      <Lantern className="relative" delay={0} speed="slow" />
      <Lantern className="relative mt-4" delay={0.5} speed="normal" />
      <Lantern className="relative hidden sm:block" delay={1} speed="fast" />
      <Lantern className="relative mt-2 hidden md:block" delay={1.5} speed="slow" />
      <Lantern className="relative hidden lg:block" delay={2} speed="normal" />
    </div>
  );
}
