import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './profile.css';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [ratedMovies, setRatedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false); // État pour basculer la vue

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchRealRatings = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/users/${currentUser.id}/profile?viewerId=${currentUser.id}`);
        if (response.ok) {
          const data = await response.json();
          setRatedMovies(data.ratings);
        }
      } catch (error) {
        console.error("Erreur de chargement du profil", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      fetchRealRatings();
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // On récupère les 4 derniers films notés (en supposant que les plus récents sont au début ou à la fin, 
  // ici on prend les 4 premiers renvoyés par l'API)
  const recentMovies = ratedMovies.slice(0, 4);

  const getPosterUrl = (path) => {
    if (!path) return null;
    return path.startsWith('/') ? `https://image.tmdb.org/t/p/w500${path}` : path;
  };

  return (
    <main className="profile-main">
      {/* En-tête du profil */}
      <header className="profile-header">
        <div className="profile-avatar-placeholder">
          {currentUser.firstname[0].toUpperCase()}
        </div>
        <div className="profile-user-info">
          <h1>{currentUser.firstname} {currentUser.lastname}</h1>
          <p className="profile-email">{currentUser.email}</p>
        </div>
        <button className="profile-logout-btn" onClick={logout}>
          Se déconnecter
        </button>
      </header>

      {/* Contenu des notes */}
      <section className="profile-content">
        {isLoading ? (
          <p className="profile-loading">Chargement de vos notes...</p>
        ) : ratedMovies.length === 0 ? (
          <p className="profile-empty-message">Vous n'avez pas encore noté de film.</p>
        ) : !showAll ? (
          /* VUE 1 : FILMS RÉCENTS (Max 4) */
          <div className="profile-section-wrapper">
            <div className="profile-section-title-container">
              <h2>Films notés récemment</h2>
                <button className="profile-toggle-btn" onClick={() => setShowAll(true)}>
                Voir tout ({ratedMovies.length})
                </button>
              )}
            </div>
            
            <div className="profile-movies-grid">
              {recentMovies.map((movie) => (
                <article key={movie.id} className="profile-movie-card" onClick={() => navigate(`/movies/${movie.id}`)}>
                  <div className="profile-movie-poster-wrapper">
                    {movie.image ? (
                      <img src={getPosterUrl(movie.image)} alt={movie.name} />
                    ) : (
                      <div className="profile-poster-placeholder">Pas d'image</div>
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
          /* VUE 2 : TOUS LES FILMS (Vue compacte : Poster, titre, note uniquement) */
          <div className="profile-section-wrapper">
            <div className="profile-section-title-container">
                <h2>Films notés récemment</h2>
                 <button className="profile-toggle-btn" onClick={() => setShowAll(true)}>
                 Voir tout ({ratedMovies.length})
                </button>
                </div>

            <div className="profile-movies-grid compact">
              {ratedMovies.map((movie) => (
                <article key={movie.id} className="profile-movie-card compact" onClick={() => navigate(`/movies/${movie.id}`)}>
                  <div className="profile-movie-poster-wrapper compact">
                    {movie.image ? (
                      <img src={getPosterUrl(movie.image)} alt={movie.name} />
                    ) : (
                      <div className="profile-poster-placeholder compact">Pas d'image</div>
                    )}
                    <div className="profile-user-score compact">★ {movie.score}</div>
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
    </main>
  );
};

export default Profile;