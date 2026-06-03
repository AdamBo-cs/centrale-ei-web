import { useEffect, useState } from 'react';
import { getMovies } from '../../movieService';

export function UseFetchMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    getMovies()
      .then((moviesData) => {
        console.log("Films reçus :", moviesData);
        setMovies(moviesData);
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des films :', error);
      });
  }, []);

  return movies;
}