import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Classement",
  description:
    "Découvrez le classement des meilleurs joueurs SmartRivals de la semaine et du multijoueur. Où êtes-vous ?",
  openGraph: {
    title: "Classement — SmartRivals",
    description: "Top joueurs de la semaine et du multijoueur.",
  },
};

export default function LeaderboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
