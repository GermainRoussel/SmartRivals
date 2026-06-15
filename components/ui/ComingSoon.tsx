import { Construction } from "lucide-react";

/**
 * Temporary placeholder for screens that will be built in later phases.
 * Keeps the navigation fully browsable while the foundation is set up.
 */
export const ComingSoon: React.FC<{
  title: string;
  phase: string;
  description?: string;
}> = ({ title, phase, description }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
      <div className="w-24 h-24 bg-blue-100 rounded-[32px] flex items-center justify-center mb-8 text-blue-500 shadow-inner -rotate-3">
        <Construction size={48} strokeWidth={2} />
      </div>
      <h2 className="font-display text-4xl font-bold text-slate-800 mb-3">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-slate-500 max-w-md mb-6">{description}</p>
      )}
      <span className="px-4 py-1.5 bg-slate-100 text-slate-500 rounded-full text-sm font-bold tracking-wide">
        Arrive en {phase}
      </span>
    </div>
  );
};
