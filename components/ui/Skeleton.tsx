interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-100 ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <div className={`bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 ${className}`}>
      <Skeleton className="h-4 w-1/3 mb-4" />
      <Skeleton className="h-6 w-full mb-2" />
      <Skeleton className="h-6 w-4/5" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center p-4 gap-3">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-5 w-14" />
    </div>
  );
}
