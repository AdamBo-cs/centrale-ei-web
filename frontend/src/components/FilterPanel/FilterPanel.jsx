import { useState } from 'react';
import './FilterPanel.css';

function FilterPanel({
  durationFilters,
  setDurationFilters,
  genres,
  selectedGenres,
  setSelectedGenres,
  genreMode,
  setGenreMode,
}) {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="filter-container">
      <button
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtrer
      </button>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-section">
            <h4>Durée</h4>
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

          <div className="filter-section">
            <h4>Genres</h4>
            <div className="genre-mode-container">

              <span>OU</span>

              <label className="switch">
                <input
                  type="checkbox"
                  checked={genreMode === 'AND'}
                  onChange={() =>
                    setGenreMode(
                      genreMode === 'AND'
                        ? 'OR'
                        : 'AND'
                    )
                  }
                />

                <span className="slider"></span>
              </label>

              <span>ET</span>

            </div>

            <p>
              Mode :
              {genreMode === 'OR'
                ? ' au moins un genre'
                : ' tous les genres'}
            </p>

            <div className="genres-grid">
              {genres.map((genre) => (
                <label key={genre}>
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre)}
                    onChange={() => {
                      if (selectedGenres.includes(genre)) {
                        setSelectedGenres(
                          selectedGenres.filter(
                            (g) => g !== genre
                          )
                        );
                      } else {
                        setSelectedGenres([
                          ...selectedGenres,
                          genre,
                        ]);
                      }
                    }}
                  />
                  {genre}
                </label>
              ))}
            </div>
          </div>

          <button
            className="reset-filters-btn"
            onClick={() => {
              setDurationFilters({
                short: false,
                medium: false,
                long: false,
              });

              setSelectedGenres([]);
            }}
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;