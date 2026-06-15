import { Home, Brain, Swords, Trophy, User, Library, LucideIcon } from "lucide-react";

export interface NavItem {
  path: string;
  icon: LucideIcon;
  label: string;
  shortLabel: string;
}

export const NAV_ITEMS: NavItem[] = [
  { path: "/", icon: Home, label: "Accueil", shortLabel: "Accueil" },
  { path: "/daily", icon: Brain, label: "Quizz du Jour", shortLabel: "Quizz" },
  { path: "/multiplayer", icon: Swords, label: "Multijoueur", shortLabel: "Versus" },
  { path: "/types", icon: Library, label: "Types de Quizz", shortLabel: "Types" },
  { path: "/leaderboard", icon: Trophy, label: "Classement", shortLabel: "Top" },
  { path: "/profile", icon: User, label: "Profil", shortLabel: "Profil" },
];
