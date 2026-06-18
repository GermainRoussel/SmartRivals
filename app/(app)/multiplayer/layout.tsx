import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Multijoueur",
  description:
    "Affrontez des joueurs du monde entier en temps réel sur SmartRivals. Parties publiques ou salles privées avec vos amis.",
  openGraph: {
    title: "Multijoueur — SmartRivals",
    description: "Quiz en temps réel contre des joueurs du monde entier.",
  },
};

export default function MultiplayerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
