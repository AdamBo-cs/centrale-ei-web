import React, { useState } from 'react';
import './Home.css';
import { UseFetchMovies } from './UseFetchMovies';
import Movie from '../../components/Movie/Movie';

function Home() {
  const [movieName, setMovieName] = useState('');
  const [visibleMovies, setVisibleMovies] = useState(100);
  const movies = UseFetchMovies();
  const filtered_movies = movies.filter((movie) => {
    return (movie.name || '')
      .toLowerCase()
      .includes(movieName.toLowerCase());
  });

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
      <p>{movieName}</p>
      <h2>Films </h2>
      <div className="movies-grid">
        {filtered_movies
          .slice(0, visibleMovies)
          .map((singleMovie, index) => (
            <Movie
              key={singleMovie.id}
              movie={singleMovie}
              rank={index + 1}
            />
        ))}
      </div>

      {visibleMovies < filtered_movies.length && (
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
