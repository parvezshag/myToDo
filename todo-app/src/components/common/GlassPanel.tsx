import { ReactNode, CSSProperties } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  blur?: number;
}

export function GlassPanel({ children, className = '', style, blur = 40 }: GlassPanelProps) {
  return (
    <div
      className={`glass-panel ${className}`}
      style={{
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
