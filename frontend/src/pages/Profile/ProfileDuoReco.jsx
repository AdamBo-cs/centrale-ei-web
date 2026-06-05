import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileDuoRecommendations = ({ currentUserId, getPosterUrl }) => {
  const navigate = useNavigate();

  const [usersList, setUsersList] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [duoMovies, setDuoMovies] = useState([]);
  const [isLoadingDuo, setIsLoadingDuo] = useState(false);

  // Récupération de la liste des autres utilisateurs
  // Récupération de la liste des autres utilisateurs
  useEffect(() => {
    if (currentUserId) {
      fetch(`http://localhost:8000/users/${currentUserId}/list`)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }

          return Promise.reject('Erreur utilisateurs');
        })
        .then((data) => {
          // Si data est directement un tableau, on le prend.
          // Si c'est un objet qui contient une clé .users, on prend la clé.
          if (Array.isArray(data)) {
            setUsersList(data);
          } else if (data && Array.isArray(data.users)) {
            setUsersList(data.users);
          } else {
            setUsersList([]);
          }
        })
        .catch((err) => console.error(err));
    }
  }, [currentUserId]);

  // Récupération des films recommandés pour le duo
  useEffect(() => {
    if (!selectedUserId || !currentUserId) {
      setDuoMovies([]);

      return;
    }

    setIsLoadingDuo(true);

    fetch(
      `http://localhost:8000/users/recommendations/duo?user1=${currentUserId}&user2=${selectedUserId}&_=${Date.now()}`
    )
      .then((res) => {
        if (res.ok) {
          return res.json();
        }

        return Promise.reject('Erreur films duo');
      })
      .then((data) => {
        setDuoMovies(data.recommendations || []);
        setIsLoadingDuo(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoadingDuo(false);
      });
  }, [selectedUserId, currentUserId]);

  return (
    <section className="profile-duo-section">
      <div className="profile-section-title-container duo-header-block">
        <div>
          <h2>Duo</h2>
          <p className="profile-subtitle">
            Trouvez le film parfait combinant vos deux profils
          </p>
        </div>

        {/* Menu déroulant des partenaires */}
        <div className="profile-duo-selector">
          <select
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            className="profile-match-dropdown"
          >
            <option value="">-- Choisir un partenaire --</option>
            {usersList.map((user) => (
              <option key={user.id} value={user.id}>
                {user.firstname} {user.lastname}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rendu des résultats selon l'état du calcul */}
      <div className="profile-duo-results">
        {isLoadingDuo ? (
          <p className="profile-loading-center">
            Fusion des profils et calcul des distances cosinus en cours...
          </p>
        ) : !selectedUserId ? (
          <p className="profile-hint-center">
            Sélectionnez un autre membre dans la liste pour afficher vos films
            communs.
          </p>
        ) : duoMovies.length === 0 ? (
          <p className="profile-empty-message-center">Aucun film trouvé</p>
        ) : (
          <div className="profile-movies-grid recommendations">
            {duoMovies.map((movie) => (
              <article
                key={movie.id}
                className="profile-movie-card recommendation-item"
                onClick={() => navigate(`/movies/${movie.id}`)}
              >
                <div className="profile-movie-poster-wrapper">
                  {movie.image ? (
                    <img src={getPosterUrl(movie.image)} alt={movie.name} />
                  ) : (
                    <div className="profile-poster-placeholder">
                      Pas d'image
                    </div>
                  )}
                </div>

                <div className="profile-movie-details">
                  <h3>{movie.name}</h3>
                  <p>{movie.date}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProfileDuoRecommendations;
