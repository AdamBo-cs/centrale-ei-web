import React, { useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { UseFetchMovies } from './UseFetchMovies';
import Movie from '../../components/Movie/Movie';

function Home() {
  const [sortBy, setSortBy] = useState('rating');
  const [movieName, setMovieName] = useState('');
  const [visibleMovies, setVisibleMovies] = useState(100);
  const movies = UseFetchMovies();

  const filtered_movies = movies.filter((movie) => {
    return (movie.name || '')
      .toLowerCase()
      .includes(movieName.toLowerCase());
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [durationFilters, setDurationFilters] = useState({
    short: false,
    medium: false,
    long: false,
  });
  const durationFilteredMovies = filtered_movies.filter(
    (movie) => {
      const duration = movie.duration;

      const noFilterSelected =
        !durationFilters.short &&
        !durationFilters.medium &&
        !durationFilters.long;

      if (noFilterSelected) {
        return true;
      }

      return (
        (durationFilters.short && duration < 60) ||
        (durationFilters.medium &&
          duration >= 60 &&
          duration <= 120) ||
        (durationFilters.long && duration > 120)
      );
    }
  );

  const sortedMovies = [...durationFilteredMovies];

  if (sortBy === 'name') {
        sortedMovies.sort(
          (a, b) =>
            (a.name || '').localeCompare(b.name || '')
        );
      }

      if (sortBy === 'date-asc') {
        sortedMovies.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;

          return new Date(a.date) - new Date(b.date);
        });
      }

      if (sortBy === 'date-desc') {
        sortedMovies.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;

          return new Date(b.date) - new Date(a.date);
        });
      }

      if (sortBy === 'rating-desc') {
        sortedMovies.sort(
          (a, b) =>
            (b.rating || 0) - (a.rating || 0)
        );
      }

      if (sortBy === 'rating-asc') {
        sortedMovies.sort(
          (a, b) =>
            (a.rating || 0) - (b.rating || 0)
        );
      }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Top 100 films</h1>
      </header>

      <div className="input-container">
        <input
          type="text"
          placeholder="Entrez le nom d'un film..."
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
        />
      </div>

      <div className="controls-container">

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >          
          <option value="name">Ordre alphabétique</option>

          <option value="date-desc">
            Date (plus récent)
          </option>

          <option value="date-asc">
            Date (plus ancien)
          </option>

          <option value="rating-desc">
            Le plus populaire
          </option>

          <option value="rating-asc">
            Le moins populaire
          </option>
        </select>

        <div className="filter-container">

          <button
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtrer
          </button>
      
        {showFilters && (
          <div className="filter-panel">
            <label>
              <input
                type="checkbox"
                checked={durationFilters.short}
                onChange={() =>
                  setDurationFilters({
                    ...durationFilters,
                    short: !durationFilters.short,
                  })
                }
              />
              &lt; 1h
            </label>

            <label>
              <input
                type="checkbox"
                checked={durationFilters.medium}
                onChange={() =>
                  setDurationFilters({
                    ...durationFilters,
                    medium: !durationFilters.medium,
                  })
                }
              />
              1h - 2h
            </label>

            <label>
              <input
                type="checkbox"
                checked={durationFilters.long}
                onChange={() =>
                  setDurationFilters({
                    ...durationFilters,
                    long: !durationFilters.long,
                  })
                }
              />
              &gt; 2h
            </label>
          </div>
        )}
      </div>
    </div>

      <p>{movieName}</p>
      <h2>Films </h2>
      <div className="movies-grid">
        {sortedMovies
          .slice(0, visibleMovies)
          .map((singleMovie, index) => (
            // 1. Le Link de VOTRE code englobe le tout. 
            // 2. La 'key' reste obligatoirement sur le parent le plus haut (le Link).
            <Link 
              to={`/movies/${singleMovie.id}`} 
              key={singleMovie.id} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              {/* 3. Le composant Movie de votre COLLÈGUE reçoit bien sa nouvelle prop 'rank' */}
              <Movie
                movie={singleMovie}
                rank={index + 1}
              />
            </Link>
        ))}
      </div>

      {visibleMovies < sortedMovies.length && (
        <button
          onClick={() => setVisibleMovies(visibleMovies + 20)}
        >
          Charger plus
        </button>
      )}
    </div>
  );
}

export default Home;