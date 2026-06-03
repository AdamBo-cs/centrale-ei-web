import fetch from 'node-fetch';
import { appDataSource } from './datasource.js';
import { Movie } from './entities/movie.js';

// Token TMDb
const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo';

// Configuration des requêtes API
const requestOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

console.log("Connexion à la base de données...");

appDataSource.initialize()
  .then(function () {

    console.log("Connexion réussie !");
    console.log("Récupération des films depuis TMDb...");

    // Récupération des 10 premières pages des films les mieux notés
    const pageRequests = [];

    for (let page = 1; page <= 10; page++) {
      pageRequests.push(
        fetch(
          `https://api.themoviedb.org/3/movie/top_rated?language=fr-FR&page=${page}`,
          requestOptions
        )
      );
    }

    return Promise.all(pageRequests);
  })

  .then(function (responses) {

    // Conversion des réponses en JSON
    const jsonRequests = responses.map(response => response.json());

    return Promise.all(jsonRequests);
  })

  .then(function (pages) {

    // Regroupement de tous les films dans un seul tableau
    let movies = [];

    pages.forEach(page => {
      movies = movies.concat(page.results);
    });

    console.log(`${movies.length} films trouvés.`);
    console.log("Récupération des informations détaillées...");

    // Requête détaillée pour chaque film
    const detailRequests = movies.map(movie => {

      return fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?language=fr-FR`,
        requestOptions
      ).then(response => response.json());

    });

    return Promise.all(detailRequests);
  })

  .then(function (movieDetails) {

    console.log("Informations récupérées.");
    console.log("Insertion dans la base de données...");

    const movieRepository = appDataSource.getRepository(Movie);

    const insertRequests = [];

    movieDetails.forEach(function (movie) {

      // Création de l'objet correspondant à l'entité Movie
      const newMovie = movieRepository.create({
        name: movie.title,
        date: movie.release_date || "Date inconnue",
        image: movie.poster_path,
        synopsis: movie.overview || "Aucun résumé disponible.",
        rating: movie.vote_average,
        banner: movie.backdrop_path,
        duration: movie.runtime || 0,
        budget: movie.budget || 0,
        tagline: movie.tagline || "",
        original_language: movie.original_language
      });

      insertRequests.push(
        movieRepository.insert(newMovie)
      );
    });

    return Promise.all(insertRequests);
  })

  .then(function () {

    console.log("Base de données remplie avec succès.");

    return appDataSource.destroy();
  })

  .then(function () {

    console.log("Connexion fermée.");
  })

  .catch(function (error) {

    console.error("Erreur lors du remplissage de la base :", error);

    if (appDataSource.isInitialized) {
      appDataSource.destroy();
    }
  });