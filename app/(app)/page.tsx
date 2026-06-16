import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { BrandName } from "@/components/ui/BrandName";
import { getProfile } from "@/lib/auth";

export default async function HomePage() {
  const profile = await getProfile();
  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto mt-4 pb-24 md:pb-0 px-4">
      {/* Hero */}
      <div className="bg-[#E0F2FE] rounded-[48px] p-8 md:p-16 text-center relative overflow-hidden border-4 border-white shadow-xl min-h-[400px] flex flex-col justify-center items-center w-full">
        <div className="absolute top-10 left-10 text-4xl animate-bounce [animation-delay:700ms] hidden md:block">
          ⚡
        </div>
        <div className="absolute bottom-10 right-10 text-4xl animate-bounce hidden md:block">
          ⭐
        </div>
        <div className="absolute top-10 right-20 text-blue-400 text-5xl rotate-12 hidden md:block">
          ✦
        </div>

        <div className="relative z-10 flex flex-col items-center w-full">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-600 mb-2">
            Bienvenue <span className="text-blue-600">{profile?.username ?? "Joueur"}</span> !
          </h2>

          <div className="flex items-center justify-center mb-4 w-full">
            <Logo className="w-full max-w-[350px] h-auto drop-shadow-lg hover:scale-105 transition-transform duration-500" />
          </div>

          <BrandName className="text-4xl md:text-6xl mb-6 drop-shadow-sm" />

          <p className="text-lg md:text-2xl text-slate-600 font-medium mb-10 px-4 font-display max-w-2xl">
            Battle the brightest minds!
          </p>

          <Link
            href="/multiplayer"
            className="bg-[#FCD34D] hover:bg-[#FBBF24] text-slate-900 border-b-8 border-[#F59E0B] text-xl md:text-2xl px-10 md:px-16 py-5 rounded-full shadow-xl active:border-b-0 active:translate-y-2 transition-all w-full md:w-auto font-display font-medium inline-flex items-center justify-center"
          >
            Start a Match
          </Link>
        </div>
      </div>

      {/* Menu grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          href="/daily"
          className="bg-white p-10 rounded-[40px] shadow-sm border-4 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden min-h-[200px] flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform shadow-sm">
              <span className="text-4xl">📅</span>
            </div>
            <h3 className="font-display font-bold text-3xl text-slate-800 mb-2">
              Quizz du Jour
            </h3>
            <p className="text-slate-500 font-medium text-lg">
              Challenge quotidien unique. Grimpez dans le classement !
            </p>
          </div>
        </Link>

        <Link
          href="/leaderboard"
          className="bg-white p-10 rounded-[40px] shadow-sm border-4 border-slate-100 hover:border-yellow-200 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden min-h-[200px] flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mb-4 group-hover:-rotate-12 transition-transform shadow-sm">
              <span className="text-4xl">🏆</span>
            </div>
            <h3 className="font-display font-bold text-3xl text-slate-800 mb-2">
              Classement
            </h3>
            <p className="text-slate-500 font-medium text-lg">
              Voir les meilleurs joueurs de la semaine.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
