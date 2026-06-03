import React, { useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { UseFetchMovies } from './UseFetchMovies';
import Movie from '../../components/Movie/Movie'; // Ajuste le chemin si nécessaire

function Home() {
  const [movieName, setMovieName] = useState('');
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
        {filtered_movies.map((singleMovie) => (
          <Link
            to={`/movies/${singleMovie.id}`}
            key={singleMovie.id}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Movie movie={singleMovie} />
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
