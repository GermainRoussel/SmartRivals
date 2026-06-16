import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <Logo className="w-40 h-auto mb-6" />
      <h1 className="font-display text-6xl font-black text-slate-800 mb-2">404</h1>
      <p className="text-xl text-slate-500 mb-8">Cette page n&apos;existe pas.</p>
      <Link href="/">
        <Button size="lg">Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
