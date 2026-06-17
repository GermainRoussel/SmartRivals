# DIFFERENCES — 7 Erreurs (scène SVG à générer)

⚠️ Type **auto-contenu en SVG** : ce ne sont pas des données prêtes à coller, mais des
**idées de scènes** à coder dans `lib/quiz/differences.ts` (deux SVG identiques sauf
**une** différence + la cible en %). Voir le modèle `DIFFERENCE_SCENES` existant
(ballons recolorés, étoile disparue) et le test d'intégrité (left ≠ right, cible 0-100).

Chaque idée = une scène simple + l'unique différence (couleur changée ou élément
retiré, le plus lisible). Difficulté ≈ taille/évidence de la différence.

| # | Diff | Scène | La différence |
|---|---|---|---|
| 1 | Facile | 4 ballons colorés | Le 3ᵉ ballon change de couleur *(existant)* |
| 2 | Facile | Ciel étoilé + lune | Une étoile disparaît *(existant)* |
| 3 | Facile | Visage souriant | La bouche devient triste |
| 4 | Facile | Maison avec cheminée | La cheminée disparaît |
| 5 | Moyen | Parterre de fleurs | Une fleur change de couleur |
| 6 | Moyen | Voiture | Une roue change de couleur |
| 7 | Facile | Arbre avec pommes | Une pomme disparaît |
| 8 | Moyen | Feu tricolore | Le feu allumé change (vert → rouge) |
| 9 | Moyen | Poisson + bulles | Une bulle disparaît |
| 10 | Facile | Soleil à rayons | Un rayon en moins |
| 11 | Facile | Bonhomme de neige | Le bouton du milieu disparaît |
| 12 | Moyen | Drapeau à 3 bandes | Une bande change de couleur |
| 13 | Difficile | Pizza garnie | Une olive en moins |
| 14 | Moyen | Horloge | Une aiguille déplacée |
| 15 | Difficile | Coccinelle | Un point en moins |
| 16 | Moyen | Train à wagons | Une fenêtre en moins |
| 17 | Facile | Gâteau d'anniversaire | Une bougie éteinte |
| 18 | Difficile | Arc-en-ciel | Deux bandes inversées |
| 19 | Moyen | Tête de chat | Une moustache en moins |
| 20 | Moyen | Parapluie à pans colorés | Un pan change de couleur |
| 21 | Difficile | Étoile de mer | Un bras change de couleur |
| 22 | Difficile | Ballon de foot | Un pentagone noir devient blanc |
