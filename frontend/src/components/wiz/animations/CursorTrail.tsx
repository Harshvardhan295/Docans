import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailDot {
  id: number;
  x: number;
  y: number;
}

const CursorTrail = () => {
  const [dots, setDots] = useState<TrailDot[]>([]);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let id = 0;
    const handleMove = (e: MouseEvent) => {
      setCursor({ x: e.clientX, y: e.clientY });
      id++;
      setDots((prev) => [...prev.slice(-12), { id, x: e.clientX, y: e.clientY }]);

      const target = e.target as HTMLElement;
      setIsHovering(
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") !== null ||
        target.closest("a") !== null
      );
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // Hide on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden lg:block">
      {/* Custom cursor dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full border-2 border-primary"
        animate={{
          x: cursor.x - (isHovering ? 20 : 10),
          y: cursor.y - (isHovering ? 20 : 10),
          width: isHovering ? 40 : 20,
          height: isHovering ? 40 : 20,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />
      {/* Trail */}
      <AnimatePresence>
        {dots.map((dot) => (
          <motion.div
            key={dot.id}
            className="fixed top-0 left-0 h-1.5 w-1.5 rounded-full bg-primary/40"
            initial={{ opacity: 0.6, scale: 1, x: dot.x - 3, y: dot.y - 3 }}
            animate={{ opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CursorTrail;
