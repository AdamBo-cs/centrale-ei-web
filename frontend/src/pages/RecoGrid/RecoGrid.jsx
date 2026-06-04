import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './recogrid.css';

const RecommendationGrid = ({ currentMovieId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const url = `http://localhost:8000/movies/${currentMovieId}/recommendations`;
        const response = await fetch(url, { signal: abortController.signal });

        if (response.ok) {
          const data = await response.json();
          setRecommendations(data);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Impossible de charger les recommandations :', err);
        }
      } finally {
        setLoading(false);
      }
    };

    if (currentMovieId) {
      fetchRecommendations();
    }

    return () => abortController.abort();
  }, [currentMovieId]); // Si l'id du film change, on recalcule

  if (loading) {
    return (
      <div className="reco-loading">
        Calcul des affinités cinématographiques...
      </div>
    );
  }
  if (recommendations.length === 0) {
    return null;
  }

  const getPosterUrl = (path) => {
    if (!path) {
      return null;
    }

    return path.startsWith('/')
      ? `https://image.tmdb.org/t/p/w500${path}`
      : path;
  };

  return (
    <section className="reco-section">
      <h3 className="reco-title">Films similaires recommandés</h3>
      <div className="reco-grid">
        {recommendations.map((movie) => (
          // Link force React Router à changer d'ID et rafraîchir la page du film choisi !
          <Link to={`/movies/${movie.id}`} key={movie.id} className="reco-card">
            {movie.image ? (
              <img
                src={getPosterUrl(movie.image)}
                alt={movie.name}
                className="reco-thumb"
              />
            ) : (
              <div className="reco-thumb-placeholder">Pas d'image</div>
            )}
            <h4 className="reco-name">{movie.name}</h4>
            <span className="reco-genre-badge">
              {movie.genres?.split(',')[0]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendationGrid;
