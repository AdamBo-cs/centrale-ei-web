import React from 'react';
import './Movie.css';

function Movie({ movie }) {
  const baseImageUrl = 'https://image.tmdb.org/t/p/w500';

  return (
    <div className="movie-card">
      {movie.image ? (
        <img
          src={`${baseImageUrl}${movie.image}`}
          alt={`Affiche du film ${movie.name}`}
          className="movie-poster"
        />
      ) : (
        <div className="no-image">Pas d'image disponible</div>
      )}

      <div className="movie-infos">
        <h3 className="movie-title">{movie.name}</h3>
        <p className="movie-date">
          Sortie : {movie.release_date ? movie.release_date : 'Inconnue'}
        </p>
      </div>
    </div>
  );
}

export default Movie;
