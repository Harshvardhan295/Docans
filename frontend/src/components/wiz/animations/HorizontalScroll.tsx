import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

const HorizontalScroll = ({ children, className = "" }: HorizontalScrollProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["10%", "-30%"]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <motion.div className="flex gap-6" style={{ x }}>
        {children}
      </motion.div>
    </div>
  );
};

export default HorizontalScroll;
