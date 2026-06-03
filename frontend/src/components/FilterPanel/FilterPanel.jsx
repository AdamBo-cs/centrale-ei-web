import { useState } from 'react';
import './FilterPanel.css';

function FilterPanel({
  durationFilters,
  setDurationFilters,
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
  );
}

export default FilterPanel;