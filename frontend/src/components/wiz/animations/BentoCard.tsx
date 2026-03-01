import { useRef, useState, ReactNode } from "react";
import { motion } from "framer-motion";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
}

const BentoCard = ({ children, className = "" }: BentoCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotateX((y - 0.5) * -10);
    setRotateY((x - 0.5) * 10);
    setGlowPos({ x: x * 100, y: y * 100 });
  };

  const reset = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      style={{ perspective: 800 }}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Glow border that follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(300px circle at ${glowPos.x}% ${glowPos.y}%, hsl(217 91% 60% / 0.15), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
};

export default BentoCard;
