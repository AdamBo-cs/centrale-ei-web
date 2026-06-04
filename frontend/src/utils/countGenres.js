export function countGenres(movies) {
  const counts = {};

  movies.forEach((movie) => {
    const genres = (movie.genres || '')
      .split(',')
      .map((genre) => genre.trim());

    genres.forEach((genre) => {
      counts[genre] = (counts[genre] || 0) + 1;
    });
  });

  return counts;
}