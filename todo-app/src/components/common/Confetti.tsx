import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiParticle {
  id: number;
  x: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const COLORS = ['#60cdff', '#78d237', '#ffaa44', '#e81123', '#8764b8', '#00b7c3'];

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: ConfettiParticle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 720 - 360,
      scale: Math.random() * 0.5 + 0.5,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
      onComplete?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [active]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="confetti-container">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="confetti-particle"
              initial={{
                x: `${p.x}vw`,
                y: -20,
                opacity: 1,
                rotate: 0,
                scale: p.scale,
              }}
              animate={{
                y: '100vh',
                opacity: 0,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.5 + Math.random() * 1,
                ease: 'easeIn',
              }}
              style={{
                left: `${p.x}%`,
                backgroundColor: p.color,
                position: 'absolute',
                width: 8,
                height: 14,
                borderRadius: 2,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
