import { useEffect, useState } from 'react';
import axios from 'axios';

export function UseFetchMovies() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    console.log('test');
    axios
      .get('https://api.themoviedb.org/3/movie/popular?language=fr-FR&page=1', {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo`,
        },
      })
      .then((response) => {
        console.log(response.data.results);
        setMovies(response.data.results);
      })
      .catch((error) => {
        console.log('Erreur :', error);
      });
  }, []);

  return movies;
}
