import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-lg mx-auto py-10 px-4 space-y-6">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
