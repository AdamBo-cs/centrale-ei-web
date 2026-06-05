import React, { useState } from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import { UseFetchMovies } from './UseFetchMovies';
import Movie from '../../components/Movie/Movie';
import FilterPanel from '../../components/FilterPanel/FilterPanel';
import { sortMovies } from '../../utils/sortMovies';
import { extractGenres } from '../../utils/extractGenres';
import { extractLanguages } from '../../utils/extractLanguages';
import {
  filterMoviesByDuration,
  filterMoviesByGenres,
  filterMoviesByLanguages,
  filterMoviesByRating,
} from '../../utils/filterMovies';
import { countGenres } from '../../utils/countGenres';
import { useAuth } from '../../context/AuthContext';

function Home() {
  const { currentUser } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState([]);
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
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const movies = UseFetchMovies();
  console.log("Films récupérés :", movies);
  const genres = extractGenres(movies);

  const genreCounts = countGenres(movies);

  const languages = extractLanguages(movies);
  console.log('Languages:', languages);

  const filtered_movies = movies.filter((movie) => {
    return (movie.name || '').toLowerCase().includes(movieName.toLowerCase());
  });

  const ratingFilteredMovies = filterMoviesByRating(filtered_movies, minRating);

  const durationFilteredMovies = filterMoviesByDuration(
    ratingFilteredMovies,
    durationFilters
  );

  const genreFilteredMovies = filterMoviesByGenres(
    durationFilteredMovies,
    selectedGenres,
    genreMode
  );

  const languageFilteredMovies = filterMoviesByLanguages(
    genreFilteredMovies,
    selectedLanguages
  );

  const sortedMovies = sortMovies(languageFilteredMovies, sortBy);

  const activeFiltersCount =
    Object.values(durationFilters).filter(Boolean).length +
    (minRating > 0 ? 1 : 0) +
    selectedGenres.length +
    selectedLanguages.length;

  return (
    <div className="home-scrapbook-container">
      {/* Le nouvel en-tête style Scrapbook */}
      <header className="home-header-scrapbook">
        <h1 className="home-title-handwritten">Les films du moment</h1>
      </header>

      {/* Barre de recherche et contrôles (On gardera tes composants de filtres existants) */}
      <div className="controls-container-scrapbook">
        <input
          type="text"
          className="scrapbook-search"
          placeholder="Rechercher un film..."
          value={movieName}
          onChange={(e) => setMovieName(e.target.value)}
        />
        
        <div className="scrapbook-filters">
          <select 
            className="select-style"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Ordre alphabétique</option>
            <option value="date-desc">Date (plus récent)</option>
            <option value="date-asc">Date (plus ancien)</option>
            <option value="rating-desc">Le plus populaire</option>
            <option value="rating-asc">Le moins populaire</option>
          </select>

          {/* Ton composant de filtres complexe reste intact */}
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
            languages={languages}
            selectedLanguages={selectedLanguages}
            setSelectedLanguages={setSelectedLanguages}
            activeFiltersCount={activeFiltersCount}
            genreCounts={genreCounts}
          />
        </div>
      </div>
      
      {/* La nouvelle grille de Polaroïds stylisés */}
      <div className="polaroid-grid">
        {movies.length === 0 ? (
          <p className="profile-loading">Recherche des films dans la base de données...</p>
        ) : (
          sortedMovies.slice(0, visibleMovies).map((singleMovie, index) => {
            // Helper pour TMDB (comme pour le profil)
            const getPosterUrl = (path) => {
              if (!path) return null;
              return path.startsWith('/') ? `https://image.tmdb.org/t/p/w500${path}` : path;
            };

            // Conversion de la note de popularité (0-10) en étoiles (0-5)
            // On convertit pour l'affichage visuel, même si TypeORM a un float
            const starsCount = Math.round((singleMovie.rating || 0) / 2);
            const stars = Array(5).fill('☆').map((s, i) => i < starsCount ? '★' : '☆');

            return (
              <Link to={`/movies/${singleMovie.id}`} key={singleMovie.id} className="polaroid-card">
                
                {/* Numéro de rang style tamponné (optionnel) */}
                <div className="polaroid-rank">#{index + 1}</div>
                
                <div className="polaroid-image-wrapper">
                  {singleMovie.image ? (
                    <img src={getPosterUrl(singleMovie.image)} alt={singleMovie.name} />
                  ) : (
                    <div className="poster-placeholder">🎞️</div>
                  )}
                  
                  {/* ÉTQUETTE UTILISATEUR (comme dans l'image d'inspi) */}
                  <div className="polaroid-user-tag">
                    <div className="user-avatar-mini">
                      {currentUser ? currentUser.firstname[0].toUpperCase() : '?'}
                    </div>
                    <span className="user-name">
                      by {currentUser ? currentUser.firstname : 'Cinéphile'}
                    </span>
                  </div>
                </div>
                
                {/* LÉGENDE DANS LA MARGE DU BAS */}
                <div className="polaroid-caption">
                  {/* Titre manuscrit (Caveat) */}
                  <h3 className="polaroid-title">{singleMovie.name}</h3>
                  
                  {/* Étoiles dorées */}
                  <div className="polaroid-stars">
                    {stars.map((star, i) => (
                      <span key={i} className={star === '★' ? 'star-filled' : 'star-empty'}>
                        {star}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {visibleMovies < sortedMovies.length && (
        <button className="scrapbook-load-more" onClick={() => setVisibleMovies(visibleMovies + 20)}>
          Charger plus
        </button>
      )}
    </div>
  );
}

export default Home;
