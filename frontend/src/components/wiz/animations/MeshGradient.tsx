import { motion } from "framer-motion";

const MeshGradient = ({ className = "" }: { className?: string }) => (
  <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
    <motion.div
      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
      animate={{
        rotate: [0, 360],
      }}
      transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-accent/8 blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-primary/5 blur-[100px]" />
    </motion.div>
  </div>
);

export default MeshGradient;
