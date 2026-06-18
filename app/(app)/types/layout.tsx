import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Types de Quizz",
  description:
    "Explorez les 21 formats de questions SmartRivals : QCM, échecs, blind test, Wordle, point & click, et bien d'autres.",
  openGraph: {
    title: "Types de Quizz — SmartRivals",
    description: "21 formats de questions pour tous les niveaux.",
  },
};

export default function TypesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
