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

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
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

        {status !== "sent" && (
          <>
            <div className="relative flex py-5 items-center">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-4 text-slate-400 font-bold text-sm">OU</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!configured}
              className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl border-2 border-slate-200 bg-white font-display font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <GoogleIcon />
              Continuer avec Google
            </button>
          </>
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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
