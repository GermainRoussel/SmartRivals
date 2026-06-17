# Guide de contenu — Types de quizz SmartRivals

Ce document est la **référence unique** pour ajouter du contenu à chaque type de
question. Pour chaque format : champs obligatoires, champs optionnels, règle de
validation, modèle copier-coller et pièges à éviter.

- **Où ajouter le contenu** : `lib/quiz/bank.ts`. Ajoutez vos questions dans le
  tableau `EXTRA_SAMPLES[<TYPE>]` (ou `SAMPLES[<TYPE>]`). Tout est fusionné au
  chargement ; le Daily Quiz, le catalogue `/types` et le multijoueur piochent
  tous dans cette même banque.
- **Validation** : centralisée dans `lib/quiz/validation.ts` (source de vérité).
  Ne dupliquez jamais la logique de correction ailleurs.
- **Types & enums** : `types/index.ts`.
- **Vérifier après ajout** : `npm test` (intégrité de la banque) puis
  `npm run build` (typage). Une question mal formée fait échouer le build/les tests.

---

## 1. Champs communs à TOUTES les questions

Chaque objet `Question` **doit** avoir ces 5 champs :

| Champ        | Type                | Détail |
|--------------|---------------------|--------|
| `id`         | `string` unique     | Convention : `"<type>-<n>"` → `"mcq-7"`, `"slider-5"`. Doit être unique dans toute la banque. |
| `type`       | `QuestionType`      | Ex. `QuestionType.MCQ`. |
| `theme`      | `QuestionTheme`     | Voir la liste ci-dessous. Sert au **catalogage** et au futur **filtre par thème**. |
| `difficulty` | `QuestionDifficulty`| Voir la liste ci-dessous. Sert au futur **tri par difficulté**. |
| `text`       | `string`            | L'énoncé affiché au-dessus de la question. En français. |

> Le **thème** et la **difficulté** sont obligatoires sur *tous* les types (pas
> seulement le QCM). L'infrastructure de filtrage existe déjà
> (`pickFilteredQuestionIds(seed, count, { themes, difficulty })` dans `bank.ts`) ;
> il ne manque que les contrôles d'interface. Renseignez-les toujours correctement.

### Thèmes disponibles (`QuestionTheme`) — valeur exacte attendue
`Histoire` · `Mathématiques` · `Géographie` · `Science` · `Culture G` ·
`Jeux Vidéo` · `Logique` · `Stratégie Échecs` · `Sport` · `Art & Littérature` ·
`Cinéma` · `Nature` · `Nutrition` · `Musique` · `Automobile`

### Difficultés disponibles (`QuestionDifficulty`)
`Facile` · `Moyen` · `Difficile` · `Expert`

### Règle d'or sur les images (fiabilité)
Les types qui dépendent d'une **URL d'image externe** (Unsplash, Wikimedia,
flagcdn…) peuvent casser si l'hébergeur bloque le hotlink ou est lent. Pour un
contenu fiable à 100 %, **auto-hébergez l'image** sous `public/quiz/...` et
référencez-la par un chemin local (`/quiz/mon-image.png`), ou utilisez un format
auto-suffisant (SVG inline, son synthétisé). Voir §4 (Point & Click).

---

## 2. Référence par type

### MCQ — QCM Classique
- **Obligatoire** : `options: string[]` (4 recommandé), `correctAnswer: string`.
- **Validation** : égalité stricte `answer === correctAnswer`. `correctAnswer`
  **doit être identique** (caractère pour caractère) à l'une des `options`.
```ts
{
  id: "mcq-7", type: QuestionType.MCQ,
  theme: QuestionTheme.SCIENCE, difficulty: QuestionDifficulty.MEDIUM,
  text: "Quel gaz les plantes absorbent-elles ?",
  options: ["Oxygène", "Dioxyde de carbone", "Azote", "Hydrogène"],
  correctAnswer: "Dioxyde de carbone",
}
```

### IMAGE_MCQ — QCM Image
- **Obligatoire** : `imageUrl: string` (image affichée au-dessus), `options: string[]`,
  `correctAnswer: string` (= une option).
- **Validation** : égalité stricte. Reste jouable même si l'image ne charge pas,
  mais préférez une image auto-hébergée.
```ts
{
  id: "image-mcq-5", type: QuestionType.IMAGE_MCQ,
  theme: QuestionTheme.GEO, difficulty: QuestionDifficulty.EASY,
  text: "À quel pays appartient ce drapeau ?",
  imageUrl: "https://flagcdn.com/w640/de.png", // ou "/quiz/flags/de.png"
  options: ["Allemagne", "Belgique", "Autriche", "Pays-Bas"],
  correctAnswer: "Allemagne",
}
```

### TRUE_FALSE — Vrai / Faux
- **Obligatoire** : `correctAnswer: boolean` (`true` ou `false`).
- **Validation** : égalité stricte. L'énoncé (`text`) est l'affirmation à juger.
```ts
{
  id: "tf-6", type: QuestionType.TRUE_FALSE,
  theme: QuestionTheme.HISTORY, difficulty: QuestionDifficulty.MEDIUM,
  text: "La Tour Eiffel a été construite pour l'Exposition universelle de 1889.",
  correctAnswer: true,
}
```

### INPUT — Saisie Libre
- **Obligatoire** : `correctAnswer: string`.
- **Validation** : insensible à la casse + espaces rognés (`"  Rome " == "rome"`).
  ⚠️ Les **accents comptent** (`é` ≠ `e`). Choisissez une réponse courte et non
  ambiguë (idéalement un seul mot/nombre).
```ts
{
  id: "input-5", type: QuestionType.INPUT,
  theme: QuestionTheme.CULTURE, difficulty: QuestionDifficulty.MEDIUM,
  text: "Combien de continents y a-t-il sur Terre ?",
  correctAnswer: "7",
}
```

### SLIDER — Curseur
- **Obligatoire** : `min`, `max`, `step` (nombres), `correctAnswer: number`,
  `tolerance: number`. **Optionnel** : `unit: string` (peut être `""`).
- **Validation** : correct si `|valeur - correctAnswer| <= tolerance`
  (`tolerance: 0` = réponse exacte).
```ts
{
  id: "slider-5", type: QuestionType.SLIDER,
  theme: QuestionTheme.GEO, difficulty: QuestionDifficulty.HARD,
  text: "Quelle est l'altitude du Mont Blanc (m) ?",
  min: 4000, max: 5000, step: 10, unit: "m",
  correctAnswer: 4810, tolerance: 50,
}
```

### ORDER — Mise en Ordre
- **Obligatoire** : `items: { id, content }[]`, `correctAnswer: string[]`
  (les `id` dans le **bon ordre**).
- **Validation** : l'ordre soumis doit être exactement `correctAnswer`.
```ts
{
  id: "order-5", type: QuestionType.ORDER,
  theme: QuestionTheme.HISTORY, difficulty: QuestionDifficulty.MEDIUM,
  text: "Classez ces rois de France du plus ancien au plus récent.",
  items: [
    { id: "a", content: "Louis XIV" },
    { id: "b", content: "Charlemagne" },
    { id: "c", content: "Henri IV" },
    { id: "d", content: "Napoléon Ier" },
  ],
  correctAnswer: ["b", "c", "a", "d"],
}
```

### MATCHING — Association
- **Obligatoire** : `pairs: { left, right }[]`. Pas de `correctAnswer` (dérivé).
- `left` peut être un **texte** OU une **URL d'image** (commençant par `http` ou
  `data:image` → rendue en image). `right` est toujours du texte. La colonne de
  droite est mélangée automatiquement. Échec de chargement d'image géré
  (« Image introuvable »), mais auto-hébergez pour fiabilité.
- **Validation** : chaque `left` doit être relié à son `right`, et toutes les
  paires doivent être faites.
```ts
{
  id: "match-5", type: QuestionType.MATCHING,
  theme: QuestionTheme.SCIENCE, difficulty: QuestionDifficulty.MEDIUM,
  text: "Reliez l'élément à son symbole.",
  pairs: [
    { left: "Oxygène", right: "O" },
    { left: "Fer", right: "Fe" },
    { left: "Sodium", right: "Na" },
    { left: "Or", right: "Au" },
  ],
}
```

### SORTING — Tri Rapide
- **Obligatoire** : `groups: { id, label, color? }[]` (2 groupes typiquement),
  `sortingItems: { id, content, correctGroupId, imageUrl? }[]`. Pas de `correctAnswer`.
- **Validation** : chaque item doit être placé dans le groupe dont l'`id` égale son
  `correctGroupId`. Tout `correctGroupId` doit référencer un `groups[].id` existant.
```ts
{
  id: "sort-5", type: QuestionType.SORTING,
  theme: QuestionTheme.GEO, difficulty: QuestionDifficulty.MEDIUM,
  text: "Ville française ou étrangère ?",
  groups: [
    { id: "FR", label: "France" },
    { id: "ET", label: "Étranger" },
  ],
  sortingItems: [
    { id: "1", content: "Lyon", correctGroupId: "FR" },
    { id: "2", content: "Berlin", correctGroupId: "ET" },
    { id: "3", content: "Nantes", correctGroupId: "FR" },
    { id: "4", content: "Madrid", correctGroupId: "ET" },
  ],
}
```

### HOTSPOT — Point & Click
- **Obligatoire** : `imageUrl: string`, `hotspotTarget: { x, y, tolerance }`,
  `correctAnswer: { x, y }` (miroir de la cible — requis par le test d'intégrité).
- `x`, `y` sont en **pourcentage (0–100)** de l'image ; `tolerance` est le rayon
  toléré (en points de %). **Validation** : distance euclidienne en %
  `√((cx−x)² + (cy−y)²) <= tolerance`.
- **Méthode recommandée (auto-suffisante)** : ajoutez une scène SVG dans
  `lib/quiz/hotspots.ts` (`HOTSPOT_SCENES`) puis référencez-la — aucune image
  externe, coordonnées sûres. C'est l'approche utilisée par les 3 hotspots livrés
  (visage → nez, système solaire → Saturne, horloge → 12).
```ts
{
  id: "hotspot-4", type: QuestionType.HOTSPOT,
  theme: QuestionTheme.SCIENCE, difficulty: QuestionDifficulty.MEDIUM,
  text: "Cliquez sur Saturne, la planète aux anneaux.",
  imageUrl: HOTSPOT_SCENES.saturn.image,
  hotspotTarget: HOTSPOT_SCENES.saturn.target,
  correctAnswer: { x: HOTSPOT_SCENES.saturn.target.x, y: HOTSPOT_SCENES.saturn.target.y },
}
```
> Pour une image **photo** plutôt que SVG : auto-hébergez-la sous `public/quiz/...`,
> mesurez la cible en %, et gardez une tolérance généreuse (8–12).

### HOLE_TEXT — Texte à Trous
- **Obligatoire** : `holeText: string`. Les réponses sont entre **accolades**.
  Chaque `{…}` est un trou ; plusieurs trous possibles. Pas de `correctAnswer`.
- **Validation** : insensible à la casse, **sensible à l'ordre** des trous.
```ts
{
  id: "hole-5", type: QuestionType.HOLE_TEXT,
  theme: QuestionTheme.SCIENCE, difficulty: QuestionDifficulty.EASY,
  text: "Complétez la phrase.",
  holeText: "L'eau est composée d'{hydrogène} et d'{oxygène}.",
}
```

### BLIND_TEST — Blind Test
- **Obligatoire** : `soundId`, `options: string[]`, `correctAnswer: string`.
- `soundId` ∈ `alarm` | `siren` | `doorbell` | `phone` | `horn` | `laser`
  (sons **synthétisés**, aucun fichier audio). Pour ajouter un **nouveau son**,
  éditez `lib/audio.ts` (ajoutez un `case` dans `schedule()` + le label).
- **Validation** : égalité stricte.
```ts
{
  id: "blind-5", type: QuestionType.BLIND_TEST,
  theme: QuestionTheme.CULTURE, difficulty: QuestionDifficulty.EASY,
  text: "Quel est ce son ?",
  soundId: "alarm",
  options: ["Réveil", "Sonnette", "Klaxon", "Laser"],
  correctAnswer: "Réveil",
}
```

### CONNECTIONS — Groupes
- **Obligatoire** : `connectionsGroups`: **4 groupes** de `{ id, label, items }`,
  chaque `items` = **4 mots** (16 mots au total). `correctAnswer: "COMPLEX_VALIDATION"`.
- **Auto-validant** : le composant juge lui-même (pas de bouton « Valider »).
  Évitez qu'un mot puisse appartenir à deux groupes, sauf piège volontaire.
```ts
{
  id: "conn-4", type: QuestionType.CONNECTIONS,
  theme: QuestionTheme.NATURE, difficulty: QuestionDifficulty.HARD,
  text: "Créez 4 groupes de 4 mots liés.",
  connectionsGroups: [
    { id: "A", label: "Félins",   items: ["Lion", "Tigre", "Léopard", "Jaguar"] },
    { id: "B", label: "Oiseaux",  items: ["Aigle", "Moineau", "Pigeon", "Corbeau"] },
    { id: "C", label: "Poissons", items: ["Thon", "Saumon", "Truite", "Sardine"] },
    { id: "D", label: "Reptiles", items: ["Serpent", "Lézard", "Tortue", "Crocodile"] },
  ],
  correctAnswer: "COMPLEX_VALIDATION",
}
```

### ANAGRAM — Anagramme
- **Obligatoire** : `anagramWord: string` (mot mélangé par le composant),
  `correctAnswer: string` (= le mot, même valeur).
- **Validation** : insensible à la casse. **Auto-valide** dès que c'est complet.
  Un seul mot, sans espaces.
```ts
{
  id: "ana-5", type: QuestionType.ANAGRAM,
  theme: QuestionTheme.SPORT, difficulty: QuestionDifficulty.MEDIUM,
  text: "Reconstituez ce sport.",
  anagramWord: "NATATION", correctAnswer: "NATATION",
}
```

### PIXEL_REVEAL — Pixel Reveal
- **Obligatoire** : `pixelImage: string` (ou `imageUrl`), `correctAnswer: string`.
- **Validation** : insensible à la casse. Image auto-hébergée recommandée.
```ts
{
  id: "pix-3", type: QuestionType.PIXEL_REVEAL,
  theme: QuestionTheme.NATURE, difficulty: QuestionDifficulty.MEDIUM,
  text: "Devinez l'animal !",
  pixelImage: "/quiz/pixel/tiger.jpg",
  correctAnswer: "TIGRE",
}
```

### MATH_PUZZLE — Math Puzzle
- **Obligatoire** : `equation: string` (ex. `"12 + ? = 15"` ou `"8 x 7 = ?"`),
  `mathGrid: (number|string)[]` (les choix proposés), `correctAnswer: string`.
- **Validation** : insensible à la casse/espaces. `correctAnswer` doit figurer
  dans `mathGrid` (comparé en chaîne, donc `"56"`).
```ts
{
  id: "math-5", type: QuestionType.MATH_PUZZLE,
  theme: QuestionTheme.MATH, difficulty: QuestionDifficulty.EASY,
  text: "Complétez l'équation.",
  equation: "6 x ? = 42",
  mathGrid: [5, 6, 7, 8, 9],
  correctAnswer: "7",
}
```

### REBUS — Rébus
- **Obligatoire** : `rebusEmojis: string`, `correctAnswer: string`.
- **Validation** : insensible à la casse + espaces rognés. ⚠️ Les accents et les
  espaces internes comptent — choisissez une forme canonique simple.
```ts
{
  id: "rebus-3", type: QuestionType.REBUS,
  theme: QuestionTheme.LOGIC, difficulty: QuestionDifficulty.MEDIUM,
  text: "Déchiffrez ce rébus.",
  rebusEmojis: "🌞🌻", correctAnswer: "Tournesol",
}
```

### ODD_ONE_OUT — Intrus
- **Obligatoire** : `oddOneOutItems: { id, content, imageUrl?, isOdd }[]`,
  `correctAnswer: string` = l'`id` de l'item dont `isOdd: true`.
- **Validation** : égalité stricte sur l'`id`. Exactement **un** item `isOdd: true`.
```ts
{
  id: "odd-5", type: QuestionType.ODD_ONE_OUT,
  theme: QuestionTheme.SCIENCE, difficulty: QuestionDifficulty.EASY,
  text: "Lequel n'est pas une planète ?",
  oddOneOutItems: [
    { id: "1", content: "Mars",   isOdd: false },
    { id: "2", content: "Vénus",  isOdd: false },
    { id: "3", content: "Soleil", isOdd: true },
    { id: "4", content: "Saturne",isOdd: false },
  ],
  correctAnswer: "3",
}
```

### WORD_GUESS — Mot Mystère (style Wordle)
- **Obligatoire** : `wordLength: number`, `correctAnswer: string` en **MAJUSCULES**.
  La longueur du mot **doit** égaler `wordLength`.
- **Validation** : insensible à la casse. **Auto-valide** quand résolu/épuisé.
```ts
{
  id: "word-5", type: QuestionType.WORD_GUESS,
  theme: QuestionTheme.NATURE, difficulty: QuestionDifficulty.MEDIUM,
  text: "Arbre très grand (5 lettres).",
  wordLength: 5, correctAnswer: "CHENE",
}
```
> ⚠️ Le clavier Wordle est sans accents : utilisez des mots sans accent
> (`CHENE`, pas `CHÊNE`) pour rester jouable.

### DIFFERENCES — 7 Erreurs
- **Obligatoire** : `diffImageLeft`, `diffImageRight`, `diffTarget: { x, y, tolerance }`,
  `correctAnswer: { x, y }`.
- **Méthode recommandée** : ajoutez une **scène SVG** dans
  `lib/quiz/differences.ts` (`DIFFERENCE_SCENES`) puis référencez-la — c'est
  auto-suffisant (aucune image externe) et les coordonnées sont sûres.
```ts
{
  id: "diff-3", type: QuestionType.DIFFERENCES,
  theme: QuestionTheme.LOGIC, difficulty: QuestionDifficulty.MEDIUM,
  text: "Trouvez la différence. Cliquez dessus à droite.",
  diffImageLeft:  DIFFERENCE_SCENES[2].left,
  diffImageRight: DIFFERENCE_SCENES[2].right,
  diffTarget:     DIFFERENCE_SCENES[2].target,
  correctAnswer:  { x: DIFFERENCE_SCENES[2].target.x, y: DIFFERENCE_SCENES[2].target.y },
}
```

### PATTERN — Suite Logique (QI)
- **Obligatoire** : `patternGridImage`, `patternOptions: { id, imageUrl }[]`,
  `correctAnswer: string` = l'`id` de la bonne option.
- **Méthode recommandée** : ajoutez un puzzle SVG dans `lib/quiz/patterns.ts`
  (`PATTERN_PUZZLES`) — auto-suffisant.
```ts
{
  id: "pat-3", type: QuestionType.PATTERN,
  theme: QuestionTheme.LOGIC, difficulty: QuestionDifficulty.HARD,
  text: "Quelle figure complète la suite ?",
  patternGridImage: PATTERN_PUZZLES[2].grid,
  patternOptions:   PATTERN_PUZZLES[2].options,
  correctAnswer:    PATTERN_PUZZLES[2].correctId,
}
```

### CHESS — Jeu d'échecs
- **Obligatoire** : `fen: string` (position légale, **blancs au trait**),
  `correctAnswer: string` au format `"DE-VERS"` en **MAJUSCULES** (ex. `"D7-D8"`).
- **Validation** (chess.js) : pour un **mat en 1**, *n'importe quel* coup qui
  donne échec et mat est accepté ; pour un puzzle « coup exact » non-mat, le coup
  joué doit égaler `correctAnswer`. Un test d'intégrité vérifie que chaque puzzle
  de mat se résout réellement — testez votre FEN avant de l'ajouter.
```ts
{
  id: "chess-5", type: QuestionType.CHESS,
  theme: QuestionTheme.CHESS_STRATEGY, difficulty: QuestionDifficulty.HARD,
  text: "Mat en 1.",
  fen: "6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
  correctAnswer: "E1-E8",
}
```

> **SIMON** (`QuestionType.SIMON`) est un reliquat v1, non câblé (aucun composant,
> aucune validation). Ne l'utilisez pas.

---

## 3. Récapitulatif : ce dont chaque type a besoin

| Type | Champs spécifiques obligatoires | `correctAnswer` | Asset externe ? |
|------|----------------------------------|-----------------|-----------------|
| MCQ | `options[]` | `string` (= une option) | non |
| IMAGE_MCQ | `imageUrl`, `options[]` | `string` (= une option) | **oui** (image) |
| TRUE_FALSE | — | `boolean` | non |
| INPUT | — | `string` | non |
| SLIDER | `min`,`max`,`step`,`tolerance` | `number` | non |
| ORDER | `items[]` | `string[]` (ids ordonnés) | non |
| MATCHING | `pairs[]` | — (dérivé) | optionnel (image à gauche) |
| SORTING | `groups[]`,`sortingItems[]` | — (dérivé) | optionnel |
| HOTSPOT | `imageUrl`,`hotspotTarget` | `{x,y}` (miroir cible) | non (SVG via `hotspots.ts`) |
| HOLE_TEXT | `holeText` (accolades) | — (dérivé) | non |
| BLIND_TEST | `soundId`,`options[]` | `string` | non (son synthétisé) |
| CONNECTIONS | `connectionsGroups` (4×4) | `"COMPLEX_VALIDATION"` | non |
| ANAGRAM | `anagramWord` | `string` (= le mot) | non |
| PIXEL_REVEAL | `pixelImage` | `string` | **oui** (image) |
| MATH_PUZZLE | `equation`,`mathGrid[]` | `string` (∈ grid) | non |
| REBUS | `rebusEmojis` | `string` | non |
| ODD_ONE_OUT | `oddOneOutItems[]` | `string` (id de l'intrus) | optionnel |
| WORD_GUESS | `wordLength` | `string` MAJ (len = wordLength) | non |
| DIFFERENCES | `diffImageLeft/Right`,`diffTarget` | `{x,y}` | non (SVG) |
| PATTERN | `patternGridImage`,`patternOptions[]` | `string` (id) | non (SVG) |
| CHESS | `fen` | `"DE-VERS"` MAJ | non |

---

## 4. Fiabilité — rendre les types « image » fonctionnels à 100 %

Tous les types sont **mécaniquement** fonctionnels (validation + composants OK,
56 tests verts). Le seul risque de « non-fonctionnel » vient des **assets externes**.
Ordre de fragilité décroissant :

1. **HOTSPOT (Point & Click)** — ✅ **corrigé** : désormais auto-suffisant via
   `lib/quiz/hotspots.ts` (scènes SVG inline + cible connue). Plus aucune
   dépendance réseau. Réutilisez `HOTSPOT_SCENES` ou ajoutez-y vos scènes.
2. **PIXEL_REVEAL**, **IMAGE_MCQ**, **MATCHING** (images), **ODD_ONE_OUT** (images)
   — dépendent d'Unsplash/Wikimedia/flagcdn (peuvent ne pas charger).

**Pour fiabiliser (au choix, par ordre de robustesse) :**
- **A. Auto-suffisant (recommandé)** — comme DIFFERENCES / PATTERN / BLIND_TEST :
  remplacer l'image par un asset interne. Pour HOTSPOT, créer un
  `lib/quiz/hotspots.ts` (sur le modèle de `differences.ts`) avec des scènes SVG
  inline + cible connue.
- **B. Auto-héberger** — déposer les images dans `public/quiz/...` et les
  référencer par chemin local (`/quiz/...`). Elles chargeront toujours.
  Puis **re-mesurer** les coordonnées HOTSPOT sur l'asset réel et **élargir la
  tolérance** (8–12) ; éventuellement afficher un repère visuel de la zone.

---

## 5. Objectifs « à terme » — état de préparation

- **Trier par difficulté / filtrer par thème** : le modèle de données porte déjà
  `difficulty` + `theme` sur *chaque* question, et `pickFilteredQuestionIds()`
  applique déjà ces filtres. Il ne manque que les **contrôles d'interface**
  (chips de thème + sélecteur de difficulté) sur le catalogue `/types` et/ou le
  Daily/Multijoueur. Aucun changement de schéma nécessaire.
- **Thème sur le QCM et les autres types** : déjà supporté partout — `theme` est
  obligatoire sur tous les types et le catalogue affiche déjà « Thème : X ».
