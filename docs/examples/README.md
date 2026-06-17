# Bibliothèque d'exemples de questions

Un fichier par type : une liste structurée d'exemples **prêts à piocher** pour
enrichir `lib/quiz/bank.ts` (tableau `EXTRA_SAMPLES[<TYPE>]`).

- Schéma exact de chaque type + modèle copier-coller : [`../quiz-content-guide.md`](../quiz-content-guide.md).
- Après ajout dans la banque : `npm test` (intégrité) puis `npm run build`.
- Thèmes : `Histoire · Mathématiques · Géographie · Science · Culture G · Jeux Vidéo ·
  Logique · Stratégie Échecs · Sport · Art & Littérature · Cinéma · Nature · Nutrition ·
  Musique · Automobile`. Difficultés : `Facile · Moyen · Difficile · Expert`.

| Fichier | Type | Particularité |
|---|---|---|
| [mcq.md](mcq.md) | QCM Classique | texte pur ✅ |
| [image-mcq.md](image-mcq.md) | QCM Image | besoin d'une image |
| [input.md](input.md) | Saisie Libre | réponse exacte courte ✅ |
| [true-false.md](true-false.md) | Vrai / Faux | texte pur ✅ |
| [slider.md](slider.md) | Curseur | valeur numérique ✅ |
| [order.md](order.md) | Mise en Ordre | texte pur ✅ |
| [matching.md](matching.md) | Association | texte pur ✅ |
| [sorting.md](sorting.md) | Tri Rapide | 2 groupes ✅ |
| [hole-text.md](hole-text.md) | Texte à Trous | texte pur ✅ |
| [blind-test.md](blind-test.md) | Blind Test | sons synthétisés (6 dispo) |
| [connections.md](connections.md) | Groupes | 4×4 ✅ |
| [anagram.md](anagram.md) | Anagramme | texte pur ✅ |
| [pixel-reveal.md](pixel-reveal.md) | Pixel Reveal | besoin d'une image |
| [math-puzzle.md](math-puzzle.md) | Math Puzzle | texte pur ✅ |
| [rebus.md](rebus.md) | Rébus | émojis ✅ |
| [odd-one-out.md](odd-one-out.md) | Intrus | texte pur ✅ |
| [word-guess.md](word-guess.md) | Mot Mystère | texte pur ✅ |
| [differences.md](differences.md) | 7 Erreurs | scène SVG à générer |
| [pattern.md](pattern.md) | Suite Logique | scène SVG à générer |
| [hotspot.md](hotspot.md) | Point & Click | scène SVG à générer |
| [chess.md](chess.md) | Échecs | FEN — **vérifier le mat** |

> « texte pur ✅ » = directement convertible en entrée de banque. Les types
> « image / SVG / son » demandent un asset (voir la note en tête de chaque fichier).
