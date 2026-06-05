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
  }, [currentMovieId]);

  if (loading) {
    return (
      <div className="reco-loading font-handwritten">
        Recherche de films similaires dans les archives...
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
      <h3 className="reco-title font-handwritten">Ces films pourraient aussi te plaire...</h3>
      
      <div className="reco-grid">
        {recommendations.map((movie) => (
          <Link to={`/movies/${movie.id}`} key={movie.id} className="reco-card">
            {/* La photo type Polaroïd */}
            <div className="reco-photo-frame">
              {movie.image ? (
                <img
                  src={getPosterUrl(movie.image)}
                  alt={movie.name}
                  className="reco-thumb"
                />
              ) : (
                <div className="reco-thumb-placeholder font-typewriter">Pas d'image</div>
              )}
            </div>
            
            {/* Les textes en dessous */}
            <h4 className="reco-name font-typewriter">{movie.name}</h4>
            <span className="reco-genre-badge font-handwritten">
              {movie.genres?.split(',')[0]}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecommendationGrid;