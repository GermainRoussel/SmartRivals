import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quizz du Jour",
  description:
    "Testez vos connaissances avec le défi quotidien SmartRivals. 10 questions, 15 secondes chacune — battez le classement !",
  openGraph: {
    title: "Quizz du Jour — SmartRivals",
    description: "Le défi quotidien t'attend. Bats le classement !",
  },
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
