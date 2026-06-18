import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — SmartRivals",
};

export default function CguPage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Conditions Générales d&apos;Utilisation</h1>
      <p className="text-slate-500 text-sm">Dernière mise à jour : juin 2025</p>

      <h2>1. Objet</h2>
      <p>
        SmartRivals est une plateforme de quiz compétitif (ci-après « la Plateforme ») éditée et
        exploitée par ses créateurs. Les présentes Conditions Générales d&apos;Utilisation (CGU)
        régissent l&apos;accès et l&apos;utilisation de la Plateforme par tout utilisateur
        (ci-après « l&apos;Utilisateur »).
      </p>

      <h2>2. Accès et compte</h2>
      <p>
        L&apos;accès à certaines fonctionnalités (classement, multijoueur, progression) nécessite
        la création d&apos;un compte via une adresse e-mail ou un compte Google. L&apos;Utilisateur
        s&apos;engage à fournir des informations exactes et à ne pas usurper l&apos;identité
        d&apos;un tiers.
      </p>

      <h2>3. Règles de conduite</h2>
      <p>Il est interdit :</p>
      <ul>
        <li>d&apos;utiliser tout moyen automatisé pour tricher ou fausser les classements ;</li>
        <li>de choisir un pseudonyme offensant, discriminatoire ou portant atteinte aux droits de tiers ;</li>
        <li>de perturber le bon fonctionnement de la Plateforme ou des autres joueurs.</li>
      </ul>
      <p>
        Tout manquement peut entraîner la suspension ou la suppression du compte sans préavis.
      </p>

      <h2>4. Propriété intellectuelle</h2>
      <p>
        L&apos;ensemble des contenus (logo, interface, questions, code source) est la propriété
        exclusive de SmartRivals et protégé par le droit de la propriété intellectuelle.
        Toute reproduction ou exploitation non autorisée est interdite.
      </p>

      <h2>5. Limitation de responsabilité</h2>
      <p>
        La Plateforme est fournie « en l&apos;état ». SmartRivals ne garantit pas une
        disponibilité ininterrompue et ne saurait être tenu responsable des dommages indirects
        liés à l&apos;utilisation du service.
      </p>

      <h2>6. Modification des CGU</h2>
      <p>
        Les présentes CGU peuvent être modifiées à tout moment. Les Utilisateurs en seront
        informés par e-mail ou notification dans l&apos;application. L&apos;utilisation continue
        de la Plateforme après modification vaut acceptation des nouvelles CGU.
      </p>

      <h2>7. Droit applicable</h2>
      <p>
        Les présentes CGU sont soumises au droit français. En cas de litige, les parties
        s&apos;efforceront de trouver une solution amiable avant tout recours judiciaire.
      </p>
    </article>
  );
}
