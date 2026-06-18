"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Download, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { deleteAccount, exportMyData } from "@/app/actions/account";

export function DangerZone() {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    const res = await exportMyData();
    setExporting(false);
    if (!("ok" in res)) {
      setError((res as { error: string }).error);
      return;
    }
    const blob = new Blob([res.json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartrivals-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = () => {
    if (confirm !== "SUPPRIMER") return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount();
      if (res && "error" in res) setError(res.error);
    });
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-red-100 overflow-hidden">
      <div className="p-6 border-b border-red-50 flex items-center gap-3">
        <AlertTriangle size={20} className="text-red-500" />
        <h3 className="font-display font-bold text-lg text-slate-800">Zone de danger</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Data export */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-slate-700">Exporter mes données</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Téléchargez toutes vos données (profil, scores, matchs) au format JSON.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exporting}
            className="shrink-0"
          >
            <Download size={16} className="mr-1" />
            {exporting ? "Export…" : "Exporter"}
          </Button>
        </div>

        <div className="border-t border-slate-100" />

        {/* Account deletion */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-bold text-red-600">Supprimer mon compte</p>
            <p className="text-sm text-slate-400 mt-0.5">
              Suppression définitive de toutes vos données. Cette action est irréversible.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => { setDeleteOpen(true); setConfirm(""); setError(null); }}
          >
            <Trash2 size={16} className="mr-1" /> Supprimer
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            onClick={() => setDeleteOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-[28px] shadow-2xl border border-slate-100 max-w-md w-full p-8 animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800">Supprimer le compte</h3>
              </div>
              <button
                onClick={() => setDeleteOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-600 mb-6">
              Cette action <strong>supprimera définitivement</strong> votre compte, vos scores,
              vos succès et tout l&apos;historique associé.{" "}
              <span className="text-red-600 font-bold">Elle est irréversible.</span>
            </p>

            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tapez <span className="font-mono bg-slate-100 px-1 rounded">SUPPRIMER</span> pour confirmer
            </label>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none mb-6 font-mono"
            />

            <div className="flex gap-3">
              <Button variant="ghost" fullWidth onClick={() => setDeleteOpen(false)} disabled={isPending}>
                Annuler
              </Button>
              <button
                onClick={handleDelete}
                disabled={confirm !== "SUPPRIMER" || isPending}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                {isPending ? "Suppression…" : "Supprimer définitivement"}
              </button>
            </div>

            {error && <p className="mt-4 text-sm text-red-600 font-medium text-center">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
