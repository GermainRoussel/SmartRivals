# PATTERN — Suite Logique (scène SVG à générer)

⚠️ Type **auto-contenu en SVG** : idées de **règles** à coder dans `lib/quiz/patterns.ts`
(une grille-séquence de 3 cases + un `?`, plus des options dont **une** continue la
règle). Voir `PATTERN_PUZZLES` existant (comptage de points, rotation de flèche) et le
test (`correctId ∈ options`).

| # | Diff | Règle de la suite | Réponse attendue |
|---|---|---|---|
| 1 | Facile | 1 → 2 → 3 points | 4 points *(existant)* |
| 2 | Moyen | Flèche : ↑ → → → ↓ (rotation horaire) | ← |
| 3 | Facile | 5 → 4 → 3 points (décroissant) | 2 points |
| 4 | Facile | 2 → 4 → 6 points (par 2) | 8 points |
| 5 | Moyen | Alternance de couleur : bleu, rouge, bleu | rouge |
| 6 | Moyen | Taille croissante : petit, moyen, grand cercle | très grand cercle |
| 7 | Moyen | Cycle de formes : cercle, carré, triangle | cercle |
| 8 | Difficile | Côtés croissants : triangle(3), carré(4), pentagone(5) | hexagone(6) |
| 9 | Moyen | Point qui avance en diagonale (cases 1→2→3) | case 4 |
| 10 | Difficile | Couleurs arc-en-ciel : rouge, orange, jaune | vert |
| 11 | Moyen | Demi-tour : ↑ → ↓ → ↑ | ↓ |
| 12 | Moyen | Remplissage : ¼, ½, ¾ d'un cercle | cercle plein |
| 13 | Difficile | Symétrie miroir d'une forme alternée | le miroir suivant |
| 14 | Moyen | Dégradé de gris : clair → moyen → foncé | très foncé |
| 15 | Difficile | Branches d'étoile : 3 → 4 → 5 | 6 branches |
| 16 | Difficile | Rotation par 45° : ↑ → ↗ → → | ↘ |
| 17 | Moyen | Cercle qui se vide : plein, ¾, ½ | ¼ |
| 18 | Facile | Nombre de barres : 1 → 2 → 3 traits | 4 traits |
| 19 | Moyen | Alternance plein / vide | vide |
| 20 | Difficile | Damier qui se décale d'une case | décalage suivant |
| 21 | Moyen | Carrés empilés : 1 → 2 → 3 | 4 |
| 22 | Difficile | Horloge : 3 h → 6 h → 9 h | 12 h |
