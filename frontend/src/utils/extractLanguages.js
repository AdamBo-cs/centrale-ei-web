export function extractLanguages(movies) {
  return [
    ...new Set(
      movies.flatMap((movie) =>
        (movie.original_language || '')
          .split(',')
          .map((original_language) => original_language.trim())
      )
    ),
  ].sort();
}