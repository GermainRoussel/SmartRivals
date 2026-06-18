import Link from "next/link";
import { BrandName } from "@/components/ui/BrandName";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 py-4 px-6">
        <Link href="/" className="inline-block">
          <BrandName className="text-2xl" />
        </Link>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>
      <footer className="text-center text-sm text-slate-400 py-8">
        <Link href="/cgu" className="hover:text-slate-600 mr-4">CGU</Link>
        <Link href="/confidentialite" className="hover:text-slate-600">Confidentialité</Link>
      </footer>
    </div>
  );
}
