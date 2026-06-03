import React from 'react';
import './Movie.css';
import { Rating } from '@smastrom/react-rating';
import '@smastrom/react-rating/style.css';

function Movie({ movie }) {
  const baseImageUrl = 'https://image.tmdb.org/t/p/w500';
  const stars = Math.round((movie.rating || 0) / 2);

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
        
        <Rating
          style={{ maxWidth: 120 }}
          value={(movie.rating || 0) / 2}
          readOnly
        />

        <p>
          {movie.rating != null
            ? (movie.rating / 2).toFixed(2)
            : 'N/A'}
        </p>
        
        <p className="movie-date">
          <p className="movie-date">
            Sortie : {movie.date || 'Inconnue'}
          </p>
        </p>

        <p className="movie-duration">
          <p className="movie-duration">
            {movie.duration || 'Inconnue'} min
          </p>
        </p>

      </div>
    </div>
  );
}

export default Movie;
