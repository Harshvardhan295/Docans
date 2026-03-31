import { HTMLAttributes } from "react";

type BentoCardProps = HTMLAttributes<HTMLDivElement>;

const BentoCard = ({ className = "", ...props }: BentoCardProps) => {
  return <div className={className} {...props} />;
};

export default BentoCard;
