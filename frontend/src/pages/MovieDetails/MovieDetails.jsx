import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './moviedetails.css'; // <-- Importation de votre nouvelle feuille de style
import RecoGrid from '../RecoGrid/RecoGrid'; // <-- AJOUT de l'import
import StarRating from './StarRating'; // Ajuste le chemin si tu l'as mis dans un autre dossier
import { useAuth } from '../../context/AuthContext'; // Vérifie que le chemin est correct selon l'emplacement de ton fichier

const MovieDetails = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Nouveaux états pour la fonctionnalité de notation
  const [userRating, setUserRating] = useState(0); 
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Chargement des détails du film
        const movieUrl = `http://localhost:8000/movies/${id}`;
        const movieResponse = await fetch(movieUrl, {
          signal: abortController.signal,
          headers: { Accept: 'application/json' },
        });

        if (!movieResponse.ok) {
          throw new Error(`Erreur HTTP film : ${movieResponse.status}`);
        }

        const movieData = await movieResponse.json();
        setMovieDetails(movieData);

        // 2. Chargement de la note de l'utilisateur (SEULEMENT s'il est connecté)
        if (currentUser) {
          const ratingUrl = `http://localhost:8000/users/${currentUser.id}/ratings/${id}`;
          const ratingResponse = await fetch(ratingUrl, {
            signal: abortController.signal,
            headers: { Accept: 'application/json' },
          });

          if (ratingResponse.ok) {
            const ratingData = await ratingResponse.json();
            setUserRating(ratingData.score); // On applique la note existante aux étoiles
          }
        } else {
          // Si l'utilisateur change de compte ou se déconnecte, on remet à 0
          setUserRating(0); 
        }

      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Une erreur est survenue :', err.message);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [id, currentUser]); // <--- On ajoute currentUser dans les dépendances !

  if (isLoading) {
    return (
      <div className="movie-details-loading">
        Interrogation de la base de données...
      </div>
    );
  }
  if (error) {
    return <div className="movie-details-error">Erreur : {error}</div>;
  }
  if (!movieDetails) {
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

  const getBannerUrl = (path) => {
    if (!path) {
      return null;
    }

    return path.startsWith('/')
      ? `https://image.tmdb.org/t/p/original${path}`
      : path;
  };

  const handleRatingChange = async (newRating) => {
    // On vérifie currentUser au lieu de user
    if (!currentUser) {
      alert("Vous devez être connecté pour noter un film !");
      return;
    }

    setUserRating(newRating);
    setIsSubmittingRating(true);

    try {
      // On utilise currentUser.id
      const response = await fetch(`http://localhost:8000/users/${currentUser.id}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          movieId: id, 
          score: newRating 
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'enregistrement de la note");
      }

      console.log("Note enregistrée avec succès en base de données !");
    } catch (err) {
      console.error(err.message);
      alert("Impossible de sauvegarder la note.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <main className="movie-details-main">
      {movieDetails.banner && (
        <div className="movie-details-banner">
          <img src={getBannerUrl(movieDetails.banner)} alt="Bannière du film" />
        </div>
      )}

      <header className="movie-details-header">
        <h1 className="movie-details-title">
          {movieDetails.name}{' '}
          <span className="movie-details-date">({movieDetails.date})</span>
        </h1>
        {movieDetails.tagline && (
          <h2 className="movie-details-tagline">"{movieDetails.tagline}"</h2>
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
              <strong>Note :</strong>{' '}
              {movieDetails.rating ? `${movieDetails.rating}/10` : 'N/A'}
            </div>
            <div>
              <strong>Durée :</strong>{' '}
              {movieDetails.duration ? `${movieDetails.duration} min` : 'N/A'}
            </div>
            <div>
              <strong>Langue originale :</strong>{' '}
              {movieDetails.original_language
                ? movieDetails.original_language.toUpperCase()
                : 'N/A'}
            </div>
            <div>
              <strong>Budget :</strong>{' '}
              {movieDetails.budget ? `${movieDetails.budget} $` : 'N/A'}
            </div>
          </div>

          <div className="movie-details-user-rating">
            <h3>Noter ce film :</h3>
            <StarRating 
              value={userRating} 
              onChange={handleRatingChange} 
            />
          </div>

          <h3>Synopsis</h3>
          <p className="movie-details-synopsis">
            {movieDetails.synopsis || 'Aucun synopsis disponible pour ce film.'}
          </p>
        </article>
      </section>
      <RecoGrid currentMovieId={id} />
    </main>
  );
};

export default MovieDetails;
