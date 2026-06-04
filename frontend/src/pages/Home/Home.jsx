import React, { useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { UseFetchMovies } from './UseFetchMovies';
import Movie from '../../components/Movie/Movie';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { sortMovies } from '../../utils/sortMovies';
import { extractGenres } from '../../utils/extractGenres';
import {
  filterMoviesByGenres,
  filterMoviesByRating,
  filterMoviesByDuration,
} from '../../utils/filterMovies';

function Home() {
  const [selectedGenres, setSelectedGenres] =
  useState([]);  
  const [sortBy, setSortBy] = useState('rating');
  const [movieName, setMovieName] = useState('');
  const [visibleMovies, setVisibleMovies] = useState(100);
  const [durationFilters, setDurationFilters] = useState({
    short: false,
    medium: false,
    long: false,
  });
  const [minRating, setMinRating] = useState(0);

  const [genreMode, setGenreMode] = useState('OR');

  const movies = UseFetchMovies();
  
  const genres = extractGenres(movies);

  const filtered_movies = movies.filter((movie) => {
    return (movie.name || '')
      .toLowerCase()
      .includes(movieName.toLowerCase());
  });

  const ratingFilteredMovies =
    filterMoviesByRating(
      filtered_movies,
      minRating
    );

  const durationFilteredMovies =
    filterMoviesByDuration(
      ratingFilteredMovies,
      durationFilters
    );

  const genreFilteredMovies =
    filterMoviesByGenres(
      durationFilteredMovies,
      selectedGenres,
      genreMode
    );

  const sortedMovies = sortMovies(
    genreFilteredMovies,
    sortBy
  );

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

        <FilterPanel
          durationFilters={durationFilters}
          setDurationFilters={setDurationFilters}
          minRating={minRating}
          setMinRating={setMinRating}
          genres={genres}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          genreMode={genreMode}
          setGenreMode={setGenreMode}
        />
    </div>

      <p>{movieName}</p>
      <h2>Films </h2>
      <div className="movies-grid">
        {sortedMovies
          .slice(0, visibleMovies)
          .map((singleMovie, index) => (
            <Link 
              to={`/movies/${singleMovie.id}`} 
              key={singleMovie.id} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
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