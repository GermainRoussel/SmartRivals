# CHESS — Échecs (mat en 1, Blancs jouent)

Champs : `fen: string`, `correctAnswer: "FROM-TO"` (cases en **MAJUSCULES**, ex. `"A1-A8"`).
Validation = le coup donne **échec et mat** (détecté par chess.js), ou correspond
exactement au coup stocké.

> ✅ **Les 15 FEN ci-dessous ont été vérifiées avec chess.js** (chacune est un vrai
> mat en 1). Toute nouvelle position **doit** passer `npm test` (test d'intégrité
> qui rejoue le coup et vérifie `isCheckmate`). Convention `text` : « Mat en 1 : … ».

| # | Diff | FEN | Coup | Motif |
|---|---|---|---|---|
| 1 | Facile | `6k1/5ppp/8/8/8/8/8/R6K w - - 0 1` | A1-A8 | Mat du couloir (tour) |
| 2 | Facile | `6k1/3R4/6K1/8/8/8/8/8 w - - 0 1` | D7-D8 | Tour sur la 8ᵉ rangée |
| 3 | Moyen | `k7/8/K7/8/8/8/5Q2/8 w - - 0 1` | F2-F8 | Dame, roi noir au coin |
| 4 | Moyen | `7k/8/5K2/8/8/8/8/6Q1 w - - 0 1` | G1-G7 | Dame soutenue par le roi |
| 5 | Moyen | `7k/5Q2/6K1/8/8/8/8/8 w - - 0 1` | F7-G7 | Dame en g7 (depuis f7) |
| 6 | Facile | `6k1/5ppp/8/8/8/8/8/Q6K w - - 0 1` | A1-A8 | Couloir avec la dame |
| 7 | Moyen | `7k/R7/1R6/8/8/8/8/7K w - - 0 1` | B6-B8 | Échelle des deux tours |
| 8 | Difficile | `6rk/6pp/8/6N1/8/8/8/7K w - - 0 1` | G5-F7 | Mat étouffé (cavalier) |
| 9 | Moyen | `k7/8/1K6/8/8/8/8/7R w - - 0 1` | H1-H8 | Tour, roi noir en a8 |
| 10 | Facile | `1k6/ppp5/8/8/8/8/8/1K5R w - - 0 1` | H1-H8 | Couloir, roi noir en b8 |
| 11 | Moyen | `7k/8/6K1/8/8/8/8/5R2 w - - 0 1` | F1-F8 | Tour, roi noir en h8 |
| 12 | Moyen | `6k1/8/5KQ1/8/8/8/8/8 w - - 0 1` | G6-G7 | Dame en g7 (depuis g6) |
| 13 | Moyen | `7k/8/6K1/8/8/8/8/Q7 w - - 0 1` | A1-A8 | Dame sur la 8ᵉ rangée |
| 14 | Moyen | `7k/8/6K1/8/8/8/8/7Q w - - 0 1` | H1-H7 | Dame en h7 soutenue |
| 15 | Moyen | `1k6/8/1K6/8/8/8/8/7R w - - 0 1` | H1-H8 | Tour, roi noir en b8 (coin) |

> ⚠️ Pièges fréquents qui **invalident** une position : le roi blanc bloque la ligne
> de la dame/tour ; un pion barre la colonne ; le roi noir peut **capturer** la pièce
> non défendue. D'où l'obligation de vérifier chaque FEN.
