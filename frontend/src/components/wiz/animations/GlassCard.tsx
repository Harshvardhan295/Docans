import { ReactNode, useRef, useState } from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  depth?: number;
}

const GlassCard = ({ children, className = "", depth = 1 }: GlassCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * depth * 8;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * depth * 8;
    setOffset({ x, y });
  };

  return (
    <motion.div
      ref={ref}
      className={`relative backdrop-blur-xl bg-card/60 border border-border/50 rounded-2xl shadow-xl ${className}`}
      onMouseMove={handleMouse}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
