/**
 * The "SmartRivals" wordmark: S(blue)mart R(yellow)ivals.
 * Factored out of the v1 codebase where it was duplicated across
 * the Home, Sidebar and Auth screens.
 */
export const BrandName: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  return (
    <div
      className={`font-display font-extrabold tracking-tighter flex flex-row items-baseline justify-center gap-[2px] leading-none select-none ${className}`}
    >
      <span className="relative">
        <span className="text-brand-blue">S</span>
        <span className="text-black">mart</span>
      </span>
      <span className="relative ml-2">
        <span className="text-brand-yellow">R</span>
        <span className="text-black">ivals</span>
      </span>
    </div>
  );
};
