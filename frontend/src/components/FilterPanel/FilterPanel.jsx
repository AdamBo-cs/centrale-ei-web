import { useState } from 'react';
import './FilterPanel.css';

function FilterPanel({
  durationFilters,
  setDurationFilters,

  minRating,
  setMinRating,

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

          <div className="reset-container">  
            <button
              className="reset-filters-btn"
              onClick={() => {
                setMinRating(0);

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

            <h4>Note minimale</h4>
              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 1}
                  onChange={() => setMinRating(1)}
                />
                ★☆☆☆☆ (1+)
              </label>

              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 2}
                  onChange={() => setMinRating(2)}
                />
                ★★☆☆☆ (2+)
              </label>

              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 3}
                  onChange={() => setMinRating(3)}
                />
                ★★★☆☆ (3+)
              </label>

              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 4}
                  onChange={() => setMinRating(4)}
                />
                ★★★★☆ (4+)
              </label>

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

        </div>
      )}
    </div>
  );
}

export default FilterPanel;