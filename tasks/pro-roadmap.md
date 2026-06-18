# SmartRivals — Plan d'implémentation « niveau pro / grand public »

Plan détaillé dérivé de l'audit produit/tech. Objectif : passer du MVP solide
actuel à une version **publiable pour le grand public**.

## Comment lire / utiliser ce plan
- Chantiers regroupés en **Phase 0 → C**, dans l'ordre conseillé de réalisation.
- Chaque tâche : **Objectif · Fichiers · Étapes · Critères d'acceptation · Effort · Dépendances**.
- **Effort** : `S` (≤ ½ j) · `M` (1-2 j) · `L` (3-5 j) · `XL` (> 1 sem).
- **Définition de « fait »** (commune à toutes) : `npm run build` ✓, `npm run lint`
  (0 erreur), `npm test` ✓, vérif navigateur quand l'écran change, migration SQL
  fournie + appliquée (`npm run db:migrate -- <fichier>`), commit atomique.
- Numérotation migrations : prochaine dispo = `0009_*` (0001→0008 pris ; `0007`
  mp_leaderboard et `0008` answered_index restent à appliquer en prod).

---

# Phase 0 — Quick wins (faible effort, fort impact)

À enchaîner en premier : visibles, sans risque, débloquent de la confiance.

### 0.1 — Corriger la métrique « Précision » du Quizz du Jour · `S`
- **Objectif** : la tuile « Précision » affiche en réalité `score / scoreMax`, pas
  la précision. Trompeur (la vraie précision = `correct/total`, déjà en « Correctes »).
- **Fichiers** : [app/(app)/daily/page.tsx](app/(app)/daily/page.tsx) (écran résultat).
- **Étapes** : renommer la tuile en « Score max % » **ou** la remplacer par la vraie
  précision `Math.round(correct/total*100)`. Aligner le wording avec le profil.
- **Acceptation** : la valeur affichée correspond au libellé ; cohérent avec le profil.

### 0.2 — Unifier les couleurs sur les design tokens · `S`
- **Objectif** : supprimer les hex en dur (`#E0F2FE`, `#FCD34D`, `#F59E0B`…) au profit
  des tokens `@theme`.
- **Fichiers** : [app/globals.css](app/globals.css) (ajouter tokens manquants :
  `--color-hero`, `--color-cta`, `--color-cta-hover`, `--color-cta-border`),
  [app/(app)/page.tsx](app/(app)/page.tsx) (hero + CTA), + occurrences inline.
- **Acceptation** : plus aucun hex de marque codé en dur hors `globals.css` (grep) ;
  rendu identique en capture.

### 0.3 — Pages légales réelles + footer · `S`
- **Objectif** : les liens « CGU / Confidentialité » du login sont du texte mort.
- **Fichiers** : créer `app/(legal)/cgu/page.tsx`, `app/(legal)/confidentialite/page.tsx`
  (contenu statique FR) ; un petit `components/layout/Footer.tsx` ; lier depuis
  [app/(auth)/login/page.tsx](app/(auth)/login/page.tsx).
- **Acceptation** : les liens pointent vers de vraies pages accessibles (même non
  connecté — ajouter à `PUBLIC_PATHS` dans [lib/supabase/proxy.ts](lib/supabase/proxy.ts)).
- **Note** : contenu juridique = à faire relire ; placeholder structuré acceptable d'ici là.

### 0.4 — Metadata + Open Graph par page · `M`
- **Objectif** : SEO + partage social (croissance). Aujourd'hui un seul `<title>` global.
- **Fichiers** : [app/layout.tsx](app/layout.tsx) (metadataBase, template de titre),
  `generateMetadata`/`export const metadata` par route (`daily`, `multiplayer`,
  `leaderboard`, `types`, `login`, `u/[id]`), `app/opengraph-image.tsx` (image OG par
  défaut via `next/og`), `app/sitemap.ts`, `app/robots.ts`.
- **Acceptation** : chaque page a un titre/description propre ; une image OG s'affiche
  au partage (test via metatags) ; sitemap/robots servis.

### 0.5 — Skeletons à la place des spinners · `M`
- **Objectif** : ressenti pro au chargement.
- **Fichiers** : `app/(app)/**/loading.tsx` (App Router) + un `components/ui/Skeleton.tsx`.
  Remplacer les `<Loader2 className="animate-spin">` des états vides clés (leaderboard,
  room, profil) par des squelettes.
- **Acceptation** : navigation entre pages montre des squelettes cohérents, pas de saut
  de layout (CLS).

### 0.6 — Choix thème/difficulté sur le Quizz du Jour · `M`
- **Objectif** : réutiliser l'infra existante (`pickFilteredQuestionIds`) déjà branchée
  en multi pour proposer un mode « entraînement filtré ».
- **Fichiers** : [app/(app)/daily/page.tsx](app/(app)/daily/page.tsx) (écran intro :
  réutiliser le composant de filtres du multi — à extraire dans
  `components/quiz/FilterControls.tsx`), [lib/quiz/bank.ts](lib/quiz/bank.ts) (déjà OK).
- **Garde-fou** : le **daily officiel reste déterministe** (anti-triche du classement) ;
  le mode filtré est **hors classement** (ne persiste pas via `saveDailyAttempt`).
- **Acceptation** : on peut lancer un set filtré ; il n'impacte pas le classement.

### 0.7 — Retirer la dépendance morte `recharts` · `S`
- **Objectif** : nettoyage (plus aucun import depuis la refonte classement).
- **Fichiers** : `package.json`, `package-lock.json`.
- **Acceptation** : `grep recharts` = 0 dans le code ; build OK.

---

# Phase A — Crédibilité & sécurité (BLOQUANT lancement)

Sans ça, le classement n'a aucune valeur et le produit n'est pas conforme.

### A1 — Scoring server-authoritative (Quizz du Jour) · `L`  ⭐ chantier n°1
- **Objectif** : ne plus faire confiance au score calculé par le navigateur. Le serveur
  reçoit les **réponses brutes + timings**, revalide et recalcule.
- **Contexte** : aujourd'hui [app/actions/quiz.ts](app/actions/quiz.ts) persiste le `score`
  fourni par le client ([daily/page.tsx](app/(app)/daily/page.tsx)). Triviallement triché.
- **Atout** : `lib/quiz/validation.ts` et `lib/scoring.ts` sont **isomorphes** → réutilisables tels quels côté serveur.
- **Fichiers** :
  - `app/actions/quiz.ts` : remplacer `saveDailyAttempt(score,…)` par
    `submitDailyAttempt({ answers: Record<questionId, rawAnswer>, perQuestionMs })`.
  - Le serveur reconstruit le set du jour via `getDailyQuestions(todayKey())`
    (déterministe), valide chaque réponse (`isAnswerCorrect`), recalcule le score
    (`computePoints`) **en bornant le temps** (anti « j'ai répondu en 0 ms × 100 »).
  - `app/(app)/daily/page.tsx` : n'envoyer que les réponses + le temps restant par
    question (pas le score).
  - Tests : `app/actions/quiz.test.ts` (ou lib) — un set de réponses connu → score attendu.
- **Étapes** : 1) figer le contrat d'entrée ; 2) recomputation serveur ; 3) clamp temps
  serveur (le client ne fournit qu'un temps *plausible*, le serveur plafonne) ; 4) garder
  l'upsert 1/jour ; 5) brancher le front.
- **Acceptation** : envoyer un faux score depuis la console n'a plus d'effet ; le score
  persisté = recomputation serveur ; test vert.
- **Risque** : timing — on ne peut pas prouver le temps réel côté serveur. Mitigation :
  borne supérieure par question + (option) timestamp serveur de début de session daily.
- **Dépendances** : aucune (préalable à un classement crédible).

### A2 — Scoring multi vérifié côté serveur · `L`
- **Objectif** : idem en multijoueur — `setScore` accepte aujourd'hui n'importe quelle valeur.
- **Fichiers** : `lib/multiplayer.ts` (`setScore`/`setAnswered`), `app/(app)/multiplayer/[roomId]/page.tsx`,
  nouvelle RPC SQL `submit_answer(p_room, p_question_index, p_raw_answer)` **SECURITY DEFINER**
  qui valide côté serveur et incrémente le score de façon atomique.
- **Sous-étape** : exposer la table de vérité des bonnes réponses au serveur SQL — soit
  via la table `questions` (cf. B1), soit via une fonction de validation en plpgsql.
  → **dépend de B1** (contenu en DB) pour être propre. À défaut : Edge Function Deno qui
  importe la logique TS de validation.
- **Acceptation** : un client ne peut pas s'attribuer un score arbitraire ; le tableau
  des scores reflète des réponses validées serveur.
- **Dépendances** : idéalement **B1**.

### A3 — Conformité RGPD · `M`
- **Objectif** : prérequis légal pour un public EU.
- **Fichiers** :
  - Suppression de compte : RPC `delete_own_account()` SECURITY DEFINER (supprime
    `profiles` → cascade sur attempts/match_results/room_players) + action front dans
    [app/(app)/profile/page.tsx](app/(app)/profile/page.tsx) (zone danger, double confirmation).
  - Export de données : action `exportMyData()` → JSON (profil + attempts + matches).
  - Bannière cookies (si analytics, cf. C4) ; pages CGU/Conf (cf. 0.3).
- **Acceptation** : un utilisateur peut supprimer son compte (et ses données) et exporter
  ses données ; pages légales en place.

### A4 — Pseudos uniques + modération basique · `M`
- **Objectif** : éviter doublons et noms abusifs.
- **Fichiers** : migration `0009_username_unique.sql` (index unique **insensible à la
  casse** sur `profiles.username`, après dédoublonnage des existants) ;
  `app/actions/profile.ts` (gérer l'erreur d'unicité → message FR) ; liste de mots
  bloqués côté serveur (`lib/moderation.ts`).
- **Acceptation** : impossible de prendre un pseudo déjà pris / blacklisté ; message clair.

### A5 — Rate-limiting & abus · `M`
- **Objectif** : limiter magic-link, matchmaking, écritures de score.
- **Fichiers** : middleware/proxy + (option) Upstash Ratelimit ; vérifier les policies RLS
  (déjà own-only) ; throttle `signInWithOtp`.
- **Acceptation** : un script ne peut pas spammer les endpoints sensibles.

---

# Phase B — Scalabilité du contenu & du jeu

### B1 — Contenu en base + back-office · `XL`  ⭐ structurant
- **Objectif** : sortir le contenu de `bank.ts` (commit+deploy par question) vers une
  table éditable, avec modération.
- **Fichiers** :
  - Migration `0010_questions.sql` : table `questions` (`id`, `type`, `theme`,
    `difficulty`, `text`, `payload jsonb`, `status` draft/published, `created_by`,
    timestamps) + RLS (lecture publique des `published`, écriture réservée `admin`).
  - `lib/quiz/source.ts` : couche d'accès qui lit la DB **avec fallback sur `bank.ts`**
    si non configurée (zéro régression). `getDailyQuestions`/`pickFilteredQuestionIds`
    consomment cette couche.
  - Script `scripts/seed-questions.mjs` : importer `bank.ts` → table (one-shot).
  - Back-office : `app/(admin)/admin/questions/` (route protégée par rôle `admin` sur
    `profiles.role`), CRUD + prévisualisation via `QuestionPlayer`. **MVP acceptable :
    éditer d'abord via Supabase Studio**, l'UI admin en V2.
  - Réutiliser [docs/quiz-content-guide.md](docs/quiz-content-guide.md) et
    [docs/examples/](docs/examples/) comme spec de saisie.
- **Acceptation** : ajouter une question publiée la rend jouable **sans redéploiement** ;
  le daily reste déterministe ; fallback TS fonctionne hors-ligne.
- **Dépendances** : débloque **A2** (validation serveur propre).

### B2 — Autorité serveur du timing multi · `L`
- **Objectif** : la progression ne doit plus dépendre du `setTimeout` du navigateur-hôte.
- **Fichiers** : Edge Function planifiée ou `pg_cron` qui, à `question_ends_at`, avance
  `current_index` ; simplifier la logique hôte dans `[roomId]/page.tsx` (garder
  l'avance anticipée « tous ont répondu » de `0008`).
- **Acceptation** : si l'hôte lague/ferme l'onglet, la partie continue côté serveur.
- **Dépendances** : `promote_host` (déjà là) reste le filet.

### B3 — Anti cold-start : adversaires IA / mode fantôme · `L`  ⭐ UX lancement
- **Objectif** : au lancement la file sera vide → garantir une partie immédiate.
- **Fichiers** : `lib/multiplayer.ts` + RPC matchmaking : si attente > N s, créer une
  salle avec un **bot** (profil dédié, réponses simulées avec précision/vitesse
  paramétrées par difficulté) **ou** mode async « bats le score d'un fantôme » (rejouer
  les réponses enregistrées d'un autre joueur).
- **Acceptation** : un joueur seul obtient toujours un adversaire en < N s ; les bots sont
  identifiables (badge) pour rester honnête sur le classement (scores bots hors leaderboard).
- **Dépendances** : B2 (timing serveur) recommandé.

### B4 — Présence & reconnexion · `M`
- **Objectif** : gérer fermeture d'onglet (Realtime Presence) et reprise de partie.
- **Fichiers** : `useRoom.ts` (canal presence), `[roomId]/page.tsx` (UI déconnecté/repris),
  `promote_host` déclenché sur départ de présence (pas seulement sur « Quitter »).
- **Acceptation** : fermer l'onglet libère/þromeut correctement ; revenir reprend la partie.

### B5 — Images auto-hébergées + `next/image` · `M`
- **Objectif** : fiabilité/perf — sortir des CDN externes (DiceBear runtime, Unsplash,
  Wikimedia, flagcdn) déjà identifiés comme fragiles.
- **Fichiers** : `public/quiz/**` (assets), `next.config.ts` (`images.remotePatterns` si on
  garde certains), migrer les `<img>` critiques vers `next/image` ; avatars DiceBear →
  générer/snapshotter ou héberger.
- **Acceptation** : pas de dépendance réseau tierce sur les écrans clés ; LCP amélioré.

---

# Phase C — Rétention, finition & exploitation

### C1 — Rappel quotidien / PWA + push · `L`  ⭐ rétention
- **Objectif** : moteur de retour quotidien (cœur d'un « daily »).
- **Fichiers** : `app/manifest.ts` (PWA installable), service worker, Web Push (VAPID,
  table `push_subscriptions`), opt-in dans le profil, job planifié d'envoi du rappel.
- **Acceptation** : app installable ; un utilisateur opt-in reçoit un rappel quotidien.

### C2 — Boucle sociale · `L`
- **Objectif** : amis, défis directs, **revanche** après un match, partage de résultat.
- **Fichiers** : migration `friends` (+ RLS), UI profil/leaderboard (ajouter ami, défier),
  bouton « Revanche » sur l'écran de fin multi, **carte OG dynamique** « J'ai fait X pts »
  (`app/u/[id]/opengraph-image.tsx`, dépend de 0.4).
- **Acceptation** : on peut ajouter un ami, le défier, demander une revanche, partager un score.

### C3 — Progression : ligues / saisons / missions · `L`
- **Objectif** : profondeur de rétention au-delà des succès actuels (`lib/achievements.ts`).
- **Fichiers** : migration `seasons`/`league_tiers`, calcul hebdo (job), UI dédiée,
  missions hebdo (objectifs + récompenses XP).
- **Acceptation** : un cycle hebdo visible (montée/descente, récompenses).

### C4 — Observabilité & analytics · `M`
- **Objectif** : piloter le produit en prod.
- **Fichiers** : Sentry (front+server), analytics privacy-friendly (Plausible/PostHog),
  events clés (start daily, finish, match, signup). Bannière cookies (lié A3/RGPD).
- **Acceptation** : erreurs remontées ; funnel d'activation mesurable.

### C5 — CI/CD + E2E · `M`
- **Objectif** : qualité automatisée (aucune CI aujourd'hui).
- **Fichiers** : `.github/workflows/ci.yml` (install → lint → typecheck → test → build) ;
  Playwright `e2e/` (parcours daily, multi 2 joueurs mockés, auth) ; (option) preview deploys.
- **Acceptation** : PR bloquée si lint/test/build échoue ; E2E verts sur les parcours clés.

### C6 — Design system + finition DA · `L`
- **Objectif** : cohérence et ressenti « jeu » pro.
- **Fichiers** : `components/ui/*` consolidés (Button/Card/Badge/Tile/Modal documentés),
  tokens unifiés (suite 0.2), **dark mode** (variantes de tokens), **SFX** bonne/mauvaise
  réponse + micro-confettis victoire + haptique mobile, transitions d'écran, respect
  `prefers-reduced-motion`, illustrations d'empty states.
- **Acceptation** : composants réutilisés partout (plus de styles inline dupliqués) ; dark
  mode fonctionnel ; feedback sonore/haptique présent et désactivable.

### C7 — Résorption dette lint · `S`
- **Objectif** : repasser les 32 warnings downgradés (`set-state-in-effect`,
  `exhaustive-deps`) au vert plutôt que tolérés.
- **Fichiers** : composants `components/quiz/types/*`, effets divers ; `eslint.config.mjs`.
- **Acceptation** : warnings traités ou justifiés au cas par cas (pas de downgrade global).

---

## Graphe de dépendances (résumé)
- **A1** autonome (faire en premier).
- **A2** ⟶ dépend de **B1** (validation serveur propre) — sinon Edge Function temporaire.
- **B1** débloque A2 et l'édition de contenu à l'échelle.
- **B3** (bots) ⟶ recommande **B2** (timing serveur).
- **C2** (partage) ⟶ dépend de **0.4** (OG).
- **A3/C4** liés (bannière cookies / RGPD).

## Ordre conseillé
1. **Phase 0** (quick wins) →
2. **A1** (scoring daily) → **A3/A4** (RGPD/pseudos) →
3. **B1** (contenu DB) → **A2** (scoring multi) →
4. **B3** (bots) + **B2** (timing) →
5. **C1** (rappel/PWA) → **C2** (social) →
6. **C4/C5** (observabilité/CI) → **C6** (design system) → reste.
