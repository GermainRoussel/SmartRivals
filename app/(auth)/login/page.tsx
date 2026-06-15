import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BrandName } from "@/components/ui/BrandName";

// Visual-only sign-in screen. Real Supabase auth is wired in Phase 2.
export default function LoginPage() {
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

        <form className="space-y-4">
          <div className="text-left">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              placeholder="Ex: GigaBrain2024"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <Link
            href="/"
            className="bg-primary hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30 border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 w-full px-8 py-4 text-lg rounded-xl font-display font-medium inline-flex items-center justify-center transition-all"
          >
            Se connecter / S&apos;inscrire
          </Link>
        </form>
        <p className="mt-6 text-xs text-slate-400">
          En continuant, vous acceptez nos CGU et notre politique de
          confidentialité.
        </p>
      </div>
    </div>
  );
}
