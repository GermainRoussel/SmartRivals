"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-20 h-20 bg-red-100 rounded-[28px] flex items-center justify-center text-red-500 mb-6 shadow-inner">
        <AlertTriangle size={40} />
      </div>
      <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">
        Oups, une erreur est survenue
      </h1>
      <p className="text-slate-500 mb-8">Réessayez, ça devrait repartir.</p>
      <Button size="lg" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}
