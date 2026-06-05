import "./About.css";

export default function About() {
  return (
    <>
    <div className="App">
      <header className="App-header">
        <h1>A propos du Cinéphile</h1>
      </header>
    </div>

    <div className="about-page">
      <div className="postit yellow">
        <h2>🎬 Un carnet pour les amoureux du cinéma</h2>
        <p>
          Le Cinéphile est né d'une idée simple : regarder un film ne se résume
          pas à lui attribuer une note.
        </p>

        <p>
          Quand un film nous marque, nous avons envie de le recommander,
          d'en parler, d'en garder une trace.
        </p>

        <p>
          Le Cinéphile transforme cette expérience en un carnet numérique personnel.
        </p>
      </div>

      <div className="postit blue">
        <h2>⭐ Noter, commenter, se souvenir</h2>

        <p>
          Chaque film peut être évalué et accompagné d'une critique personnelle.
        </p>

        <p>
          Votre profil devient peu à peu un véritable journal cinématographique.
        </p>

        <ul>
          <li>Vos films préférés</li>
          <li>Vos critiques</li>
          <li>Votre liste à regarder</li>
          <li>Votre parcours de spectateur</li>
        </ul>
      </div>

      <div className="postit pink">
        <h2>🤖 Des recommandations adaptées à vos goûts</h2>

        <p>
          À partir de vos évaluations et de vos critiques, notre moteur de
          recommandation analyse vos préférences.
        </p>

        <p>
          L'objectif n'est pas simplement de proposer les films les plus
          populaires, mais ceux qui correspondent réellement à votre sensibilité.
        </p>
      </div>

      <div className="postit green">
        <h2>👥 Trouver un film à regarder entre amis</h2>

        <p>
          Choisir un film à plusieurs est souvent plus difficile que choisir
          un film seul.
        </p>

        <p>
          Le Cinéphile compare les goûts de deux utilisateurs afin d'identifier
          les films ayant le plus fort potentiel de satisfaction commune.
        </p>
      </div>
      
    </div>
    </>
  );
}