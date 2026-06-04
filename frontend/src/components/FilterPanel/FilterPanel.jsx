import { useState } from 'react';
import './FilterPanel.css';
import { languageNames } from '../../utils/languageNames';

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
  genreCounts,

  languages,
  selectedLanguages,
  setSelectedLanguages,

  activeFiltersCount,
}) {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <div className="filter-container">
      <button className="btn"
        onClick={() => setShowFilters(!showFilters)}
      >
        Filtrer
        {activeFiltersCount > 0 &&
          ` (${activeFiltersCount})`}
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
                setGenreMode('OR');

                setSelectedLanguages([]);
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
                  onClick={() => setMinRating(minRating === 1 ? 0 : 1)}
                />
                ★☆☆☆☆ (1+)
              </label>

              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 2}
                  onClick={() => setMinRating(minRating === 2 ? 0 : 2)}
                />
                ★★☆☆☆ (2+)
              </label>

              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 3}
                  onClick={() => setMinRating(minRating === 3 ? 0 : 3)}
                />
                ★★★☆☆ (3+)
              </label>

              <label>
                <input
                  type="radio"
                  name="rating"
                  checked={minRating === 4}
                  onClick={() => setMinRating(minRating === 4 ? 0 : 4)}
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

            <div className="genres-grid">
              {genres.map((genre) => (
                <div
                  key={genre}
                  className={`genre-tag ${
                    selectedGenres.includes(genre)
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => {
                    if (selectedGenres.includes(genre)) {
                      setSelectedGenres(
                        selectedGenres.filter((g) => g !== genre)
                      );
                    } else {
                      setSelectedGenres([
                        ...selectedGenres,
                        genre,
                      ]);
                    }
                  }}
                >
                  {genre} ({genreCounts?.[genre] || 0})
                </div>
              ))}
            </div>

          <div className="filter-section">
            <h4>Langue originale</h4>
              <div className="languages-grid">
                {(languages || []).map((language) => (
                  <label key={language}>
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(language)}
                      onChange={() => {
                        if (selectedLanguages.includes(language)) {
                          setSelectedLanguages(
                            selectedLanguages.filter(
                              (l) => l !== language
                            )
                          );
                        } else {
                          setSelectedLanguages([
                            ...selectedLanguages,
                            language,
                          ]);
                        }
                      }}
                    />
                    {languageNames[language] || language}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;