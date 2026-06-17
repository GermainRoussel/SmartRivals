# BLIND_TEST — Blind Test (son synthétisé)

Champs : `soundId` (un des **6 sons** générés par `lib/audio.ts`), `options: string[]`,
`correctAnswer` (= une option, = le libellé du son). **Sons disponibles** :
`alarm` (Réveil) · `siren` (Sirène) · `doorbell` (Sonnette) · `phone` (Téléphone) ·
`horn` (Klaxon) · `laser` (Laser).

> Les **distracteurs** (mauvaises options) peuvent être n'importe quel texte.
> Pour **plus de variété**, ajoutez de nouveaux sons dans `schedule()` de `lib/audio.ts`
> (puis un libellé dans `SOUND_LABELS`).

| # | Diff | soundId | Question | Options | Réponse |
|---|---|---|---|---|---|
| 1 | Facile | doorbell | Quel est ce son ? | Réveil · Sonnette · Klaxon · Sirène | Sonnette |
| 2 | Facile | siren | Quel son d'urgence entends-tu ? | Sirène · Téléphone · Laser · Klaxon | Sirène |
| 3 | Facile | alarm | Qu'est-ce qui sonne le matin ? | Réveil · Sonnette · Téléphone · Minuteur | Réveil |
| 4 | Facile | phone | Quel appareil sonne ? | Téléphone · Réveil · Sonnette · Sirène | Téléphone |
| 5 | Moyen | horn | Quel son entend-on sur la route ? | Klaxon · Moteur · Frein · Sirène | Klaxon |
| 6 | Moyen | laser | Quel son de jeu vidéo entends-tu ? | Laser · Explosion · Saut · Pièce | Laser |
| 7 | Moyen | doorbell | On sonne à la porte. C'est… | Sonnette · Alarme · Cloche · Réveil | Sonnette |
| 8 | Facile | siren | Police, pompiers, ambulance : c'est une… | Sirène · Klaxon · Alarme · Corne | Sirène |
| 9 | Moyen | phone | Driiing ! Qui appelle ? | Téléphone · Fax · Interphone · Réveil | Téléphone |
| 10 | Moyen | alarm | Bip bip bip ! C'est un… | Réveil · Micro-ondes · Détecteur · Téléphone | Réveil |
| 11 | Difficile | horn | Tut tut ! Le conducteur a klaxonné. Quel son ? | Klaxon · Sirène · Sonnette · Cloche | Klaxon |
| 12 | Difficile | laser | Pew pew ! Un tir de… | Laser · Fusil · Canon · Feu d'artifice | Laser |
| 13 | Facile | doorbell | Ding-dong ! C'est… | Sonnette · Horloge · Carillon · Téléphone | Sonnette |
| 14 | Moyen | siren | Quel véhicule fait ce bruit ? | Sirène · Klaxon · Moteur · Frein | Sirène |
| 15 | Moyen | alarm | Réglé pour 7 h, il sonne. C'est le… | Réveil · Minuteur · Chrono · Téléphone | Réveil |
| 16 | Facile | phone | Quel objet de poche sonne ? | Téléphone · Montre · Réveil · Radio | Téléphone |
| 17 | Difficile | horn | Embouteillage : on entend des… | Klaxon · Sirène · Moteur · Cri | Klaxon |
| 18 | Moyen | laser | Bzzz-iou ! Effet sonore typique d'un… | Laser · Robot · Vaisseau · Téléphone | Laser |
| 19 | Moyen | doorbell | Un visiteur appuie sur le bouton. Quel son ? | Sonnette · Alarme · Klaxon · Réveil | Sonnette |
| 20 | Difficile | siren | Ce son monte et descend en boucle : | Sirène · Klaxon · Alarme · Laser | Sirène |
