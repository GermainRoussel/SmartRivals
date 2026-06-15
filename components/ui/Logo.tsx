import Image from "next/image";

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <Image
      src="/logo.png"
      alt="Smart Rivals"
      width={350}
      height={350}
      priority
      className={`object-contain ${className}`}
    />
  );
};
