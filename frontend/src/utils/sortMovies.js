export function sortMovies(movies, sortBy) {
  const sortedMovies = [...movies];

  switch (sortBy) {
    case 'name':
      sortedMovies.sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      break;

    case 'date-asc':
      sortedMovies.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        return new Date(a.date) - new Date(b.date);
      });
      break;

    case 'date-desc':
      sortedMovies.sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;

        return new Date(b.date) - new Date(a.date);
      });
      break;

    case 'rating-desc':
      sortedMovies.sort(
        (a, b) => (b.rating || 0) - (a.rating || 0)
      );
      break;

    case 'rating-asc':
      sortedMovies.sort(
        (a, b) => (a.rating || 0) - (b.rating || 0)
      );
      break;

    default:
      break;
  }

  return sortedMovies;
}