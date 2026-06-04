export function filterMoviesByRating(
  movies,
  minRating
) {
  if (minRating === 0) {
    return movies;
  }

  return movies.filter(
    (movie) =>
      (movie.rating || 0) / 2 >= minRating
  );
}

export function filterMoviesByDuration(
  movies,
  durationFilters
) {
  return movies.filter((movie) => {
    const duration = movie.duration;

    const noFilterSelected =
      !durationFilters.short &&
      !durationFilters.medium &&
      !durationFilters.long;
    
    if (noFilterSelected) {
      return true;
    }

    return(
      (durationFilters.short && duration < 60) ||
        (durationFilters.medium &&
          duration >= 60 &&
          duration <= 120) ||
        (durationFilters.long && duration > 120)
    );
  });
}

export function filterMoviesByGenres(
  movies,
  selectedGenres,
  genreMode
) {
  return movies.filter((movie) => {
    if (selectedGenres.length === 0) {
      return true;
    }

    const movieGenres = (movie.genres || '')
      .split(',')
      .map((genre) => genre.trim());

    if (genreMode === 'OR') {
      return movieGenres.some((genre) =>
        selectedGenres.includes(genre)
      );
    }

    return selectedGenres.every((genre) =>
      movieGenres.includes(genre)
    );
  });
}

export function filterMoviesByLanguages(
  movies,
  selectedLanguages
) {
  if (selectedLanguages.length === 0) {
    return movies;
  }

  return movies.filter((movie) =>
    selectedLanguages.includes(
      movie.original_language
    )
  );
}