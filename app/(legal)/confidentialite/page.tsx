import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de Confidentialité — SmartRivals",
};

export default function ConfidentialitePage() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Politique de Confidentialité</h1>
      <p className="text-slate-500 text-sm">Dernière mise à jour : juin 2025</p>

      <h2>1. Responsable du traitement</h2>
      <p>
        SmartRivals est responsable du traitement de vos données personnelles collectées via la
        Plateforme. Pour toute question relative à vos données, contactez-nous à l&apos;adresse
        indiquée dans les CGU.
      </p>

      <h2>2. Données collectées</h2>
      <ul>
        <li>
          <strong>Données d&apos;identification</strong> : adresse e-mail, pseudonyme, photo de
          profil (avatar dicebear ou personnalisé).
        </li>
        <li>
          <strong>Données de jeu</strong> : scores, tentatives quotidiennes, résultats
          multijoueur, niveaux, succès.
        </li>
        <li>
          <strong>Données techniques</strong> : adresse IP, type de navigateur, journaux
          d&apos;accès (à des fins de sécurité et de débogage).
        </li>
      </ul>

      <h2>3. Finalités et base légale</h2>
      <p>Vos données sont utilisées pour :</p>
      <ul>
        <li>gérer votre compte et votre authentification (exécution du contrat) ;</li>
        <li>afficher votre progression et le classement (intérêt légitime) ;</li>
        <li>améliorer la Plateforme (intérêt légitime) ;</li>
        <li>respecter nos obligations légales.</li>
      </ul>

      <h2>4. Conservation</h2>
      <p>
        Vos données sont conservées le temps de l&apos;existence de votre compte. À la
        suppression de votre compte, l&apos;ensemble de vos données personnelles est effacé dans
        un délai de 30 jours, à l&apos;exception des données requises par la loi.
      </p>

      <h2>5. Partage des données</h2>
      <p>
        Vos données ne sont pas vendues à des tiers. Elles peuvent être partagées avec nos
        sous-traitants techniques (hébergement : Supabase / Vercel) dans le strict respect du
        RGPD et sous couvert de garanties contractuelles appropriées.
      </p>

      <h2>6. Vos droits</h2>
      <p>
        Conformément au RGPD, vous disposez des droits d&apos;accès, de rectification,
        d&apos;effacement, d&apos;opposition et de portabilité sur vos données. Vous pouvez
        exercer ces droits directement depuis votre profil (export / suppression de compte)
        ou en nous contactant.
      </p>

      <h2>7. Cookies</h2>
      <p>
        La Plateforme utilise uniquement des cookies techniques strictement nécessaires au
        fonctionnement de l&apos;authentification (session Supabase). Aucun cookie publicitaire
        n&apos;est déposé.
      </p>
    </article>
  );
}
