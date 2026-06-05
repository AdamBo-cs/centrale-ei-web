import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './profile.css';
import './profile.css';
import ProfileDuoRecommendations from './ProfileDuoReco';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [ratedMovies, setRatedMovies] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]); // État pour stocker les recommandations
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true); // État de chargement des recommandations
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    // 1. Récupération des notes réelles de l'utilisateur
    const fetchRealRatings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8000/users/${currentUser.id}/profile?viewerId=${currentUser.id}`
        );
        if (response.ok) {
          const data = await response.json();
          setRatedMovies(data.ratings);
        }
      } catch (error) {
        console.error('Erreur de chargement du profil', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 2. Récupération des films recommandés (Algorithme Cosinus via Python)
    const fetchRecommendations = async () => {
      setIsLoadingRecs(true);
      try {
        const response = await fetch(
          `http://localhost:8000/users/${currentUser.id}/recommendations`
        );
        if (response.ok) {
          const data = await response.json();
          setRecommendedMovies(data.recommendations || []);
        }
      } catch (error) {
        console.error('Erreur de chargement des recommandations', error);
      } finally {
        setIsLoadingRecs(false);
      }
    };

    if (currentUser) {
      fetchRealRatings();
      fetchRecommendations();
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  const recentMovies = ratedMovies.slice(0, 4);

  const getPosterUrl = (path) => {
    if (!path) {
      return null;
    }

    return path.startsWith('/')
      ? `https://image.tmdb.org/t/p/w500${path}`
      : path;
  };

  return (
    <main className="profile-main">
      {/* En-tête du profil */}
      <header className="profile-header">
        <div className="profile-avatar-placeholder">
          {currentUser.firstname[0].toUpperCase()}
        </div>
        <div className="profile-user-info">
          <h1>
            {currentUser.firstname} {currentUser.lastname}
          </h1>
          <p className="profile-email">{currentUser.email}</p>
        </div>
        <button className="profile-logout-btn" onClick={logout}>
          Se déconnecter
        </button>
      </header>

      {/* SECTION DES RECOMMANDATIONS PERSONNALISÉES (Nouveau) */}
      <section className="profile-recommendations-section">
        <div className="profile-section-title-container">
          <h2>Recommandé pour vous</h2>
          <p className="profile-subtitle">
            Basé sur vos goûts cinématographiques
          </p>
        </div>

        {isLoadingRecs ? (
          <p className="profile-loading">
            Calcul de vos recommandations personnalisées...
          </p>
        ) : recommendedMovies.length === 0 ? (
          <p className="profile-empty-message">
            Notez des films pour que l'intelligence artificielle puisse cerner
            votre profil !
          </p>
        ) : (
          <div className="profile-movies-grid recommendations">
            {recommendedMovies.map((movie) => (
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
      </section>

      <hr className="profile-separator" />

      {/* Contenu des notes de l'utilisateur */}
      <section className="profile-content">
        {isLoading ? (
          <p className="profile-loading">Chargement de vos notes...</p>
        ) : ratedMovies.length === 0 ? (
          <p className="profile-empty-message">
            Vous n'avez pas encore noté de film.
          </p>
        ) : !showAll ? (
          /* VUE 1 : FILMS RÉCENTS (Max 4) */
          <div className="profile-section-wrapper">
            <div className="profile-section-title-container">
              <h2>Films notés récemment</h2>
              <button
                className="profile-toggle-btn"
                onClick={() => setShowAll(true)}
              >
                Voir tout ({ratedMovies.length})
              </button>
            </div>

            <div className="profile-movies-grid">
              {recentMovies.map((movie) => (
                <article
                  key={movie.id}
                  className="profile-movie-card"
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
                    <div className="profile-user-score">★ {movie.score}</div>
                  </div>
                  <div className="profile-movie-details">
                    <h3>{movie.name}</h3>
                    <p>{movie.date}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          /* VUE 2 : TOUS LES FILMS (Vue compacte) */
          <div className="profile-section-wrapper">
            <div className="profile-section-title-container">
                <h2>Films notés récemment</h2>
                 <button className="profile-toggle-btn" onClick={() => setShowAll(true)}>
                 Voir tout ({ratedMovies.length})
                </button>
                </div>

            <div className="profile-movies-grid compact">
              {ratedMovies.map((movie) => (
                <article
                  key={movie.id}
                  className="profile-movie-card compact"
                  onClick={() => navigate(`/movies/${movie.id}`)}
                >
                  <div className="profile-movie-poster-wrapper compact">
                    {movie.image ? (
                      <img src={getPosterUrl(movie.image)} alt={movie.name} />
                    ) : (
                      <div className="profile-poster-placeholder compact">
                        Pas d'image
                      </div>
                    )}
                    <div className="profile-user-score compact">
                      ★ {movie.score}
                    </div>
                  </div>
                  <div className="profile-movie-details compact">
                    <h3>{movie.name}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
      <hr className="profile-separator" />
      <ProfileDuoRecommendations
        currentUserId={currentUser.id}
        getPosterUrl={getPosterUrl}
      />
    </main>
  );
};

export default Profile;
