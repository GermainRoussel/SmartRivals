import { SkeletonRow, Skeleton } from "@/components/ui/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 py-6 px-4">
      <Skeleton className="h-8 w-48 mx-auto" />
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
      <Skeleton className="h-8 w-48 mx-auto" />
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-50">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
      </div>
    </div>
  );
}
