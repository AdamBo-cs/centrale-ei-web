export function extractGenres(movies) {
  return [
    ...new Set(
      movies.flatMap((movie) =>
        (movie.genres || '')
          .split(',')
          .map((genre) => genre.trim())
      )
    ),
  ].sort();
}