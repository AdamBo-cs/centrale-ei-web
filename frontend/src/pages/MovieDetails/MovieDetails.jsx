import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './moviedetails.css'; // <-- Importation de votre nouvelle feuille de style

const MovieDetails = () => {
  const { id } = useParams();
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchMovieFromLocalAPI = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const urlBackEnd = `http://localhost:8000/movies/${id}`;
        console.log("📡 Envoi de la requête vers :", urlBackEnd);

        const response = await fetch(urlBackEnd, {
          signal: abortController.signal,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
           throw new Error(`Erreur HTTP : ${response.status}`);
        }

        const data = await response.json();
        setMovieDetails(data);
        
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("❌ Une erreur est survenue :", err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieFromLocalAPI();

    return () => abortController.abort();
  }, [id]);

  if (isLoading) return <div className="movie-details-loading">Interrogation de la base de données...</div>;
  if (error) return <div className="movie-details-error">Erreur : {error}</div>;
  if (!movieDetails) return null;

  const getPosterUrl = (path) => {
    if (!path) return null;
    return path.startsWith('/') ? `https://image.tmdb.org/t/p/w500${path}` : path;
  };

  const getBannerUrl = (path) => {
    if (!path) return null;
    return path.startsWith('/') ? `https://image.tmdb.org/t/p/original${path}` : path;
  };

  return (
    <main className="movie-details-main">
      
      {movieDetails.banner && (
        <div className="movie-details-banner">
          <img 
            src={getBannerUrl(movieDetails.banner)} 
            alt="Bannière du film" 
          />
        </div>
      )}

      <header className="movie-details-header">
        <h1 className="movie-details-title">
          {movieDetails.name} <span className="movie-details-date">({movieDetails.date})</span>
        </h1>
        {movieDetails.tagline && (
          <h2 className="movie-details-tagline">
            "{movieDetails.tagline}"
          </h2>
        )}
      </header>
      
      <section className="movie-details-content">
        <aside className="movie-details-aside">
          {movieDetails.image ? (
            <img 
              src={getPosterUrl(movieDetails.image)} 
              alt={`Affiche de ${movieDetails.name}`} 
              className="movie-details-poster"
            />
          ) : (
            <div className="movie-details-poster-placeholder">
              Aucune affiche disponible
            </div>
          )}
        </aside>
        
        <article className="movie-details-article">
          <div className="movie-details-stats-grid">
            <div>
              <strong>Note :</strong> {movieDetails.rating ? `${movieDetails.rating}/10` : 'N/A'}
            </div>
            <div>
              <strong>Durée :</strong> {movieDetails.duration ? `${movieDetails.duration} min` : 'N/A'}
            </div>
            <div>
              <strong>Langue originale :</strong> {movieDetails.original_language ? movieDetails.original_language.toUpperCase() : 'N/A'}
            </div>
            <div>
              <strong>Budget :</strong> {movieDetails.budget ? `${movieDetails.budget} $` : 'N/A'}
            </div>
          </div>

          <h3>Synopsis</h3>
          <p className="movie-details-synopsis">
            {movieDetails.synopsis || "Aucun synopsis disponible pour ce film."}
          </p>
        </article>
      </section>
    </main>
  );
};

export default MovieDetails;