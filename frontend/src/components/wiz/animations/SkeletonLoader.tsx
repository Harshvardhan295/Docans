const SkeletonLoader = ({ className = "" }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-lg bg-muted ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-background/60 to-transparent" />
  </div>
);

export default SkeletonLoader;
