"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { BrandName } from "@/components/ui/BrandName";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStatus(error ? "error" : "sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center border border-blue-100">
        <div className="flex justify-center mb-2">
          <Logo className="w-full max-w-[280px] h-auto" />
        </div>

        <BrandName className="text-4xl mb-6" />

        <p className="text-slate-500 mb-8 font-medium">
          Prêt pour votre duel cérébral quotidien ?
        </p>

        {status === "sent" ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col items-center gap-3 animate-in zoom-in-95">
            <MailCheck className="text-green-500" size={40} />
            <p className="font-bold text-green-700">Lien envoyé !</p>
            <p className="text-sm text-slate-500">
              Vérifiez votre boîte mail <strong>{email}</strong> et cliquez sur le lien
              pour vous connecter.
            </p>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <div className="text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                disabled={!configured}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all disabled:bg-slate-50"
              />
            </div>
            <Button fullWidth size="lg" type="submit" disabled={!configured || status === "loading"}>
              {status === "loading" ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} /> Envoi…
                </>
              ) : (
                "Recevoir le lien magique"
              )}
            </Button>
            {status === "error" && (
              <p className="text-sm text-red-500 font-medium">
                Une erreur est survenue. Réessayez.
              </p>
            )}
          </form>
        )}

        {!configured && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700">
            <p className="font-bold mb-1">Auth non configurée</p>
            <p>
              Supabase n&apos;est pas encore branché.{" "}
              <Link href="/" className="underline font-bold">
                Continuer sans compte
              </Link>
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400">
          En continuant, vous acceptez nos CGU et notre politique de confidentialité.
        </p>
      </div>
    </div>
  );
}
