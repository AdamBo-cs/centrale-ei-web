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