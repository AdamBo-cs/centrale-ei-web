import fetch from 'node-fetch';
import { appDataSource } from './datasource.js';
import { Movie } from './entities/movie.js';

const TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIxZjlmNjAwMzY4MzMzODNkNGIwYjNhNzJiODA3MzdjNCIsInN1YiI6IjY0NzA5YmE4YzVhZGE1MDBkZWU2ZTMxMiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Em7Y9fSW94J91rbuKFjDWxmpWaQzTitxRKNdQ5Lh2Eo';

const requestOptions = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

console.log("Connexion à la base de données");

appDataSource.initialize()
  .then(function () {

    console.log("Récupération des films");

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
    console.log("Récupération des infos");

    // Requête détaillée à l'api
    const detailRequests = movies.map(movie => {
      const fetchDetails = fetch(`https://api.themoviedb.org/3/movie/${movie.id}?language=fr-FR`, requestOptions).then(r => r.json());
      const fetchCredits = fetch(`https://api.themoviedb.org/3/movie/${movie.id}/credits?language=fr-FR`, requestOptions).then(r => r.json());
      const fetchKeywords = fetch(`https://api.themoviedb.org/3/movie/${movie.id}/keywords`, requestOptions).then(r => r.json());
      const fetchVideos = fetch(`https://api.themoviedb.org/3/movie/${movie.id}/videos?language=fr-FR`, requestOptions).then(r => r.json());

      // 2. On attend que les 4 réponses arrivent pour ce film précis
      return Promise.all([fetchDetails, fetchCredits, fetchKeywords, fetchVideos])
        .then(([details, credits, keywordsData, videosData]) => {
          // Extraction du réalisateur (Director)
          const directorName = credits.crew?.find(person => person.job === 'Director')?.name || "Inconnu";
          // Extraction des 5 premiers acteurs principaux
          const actorsList = credits.cast?.slice(0, 5).map(actor => actor.name).join(', ') || "Inconnu";
          // Extraction des mots-clés (Keywords) sous forme de texte séparé par des virgules
          const keywordsList = keywordsData.keywords?.map(k => k.name).join(', ') || "";
          // Extraction de la bande-annonce YouTube principale
          const trailer = videosData.results?.find(vid => vid.type === 'Trailer' && vid.site === 'YouTube');
          const trailerKey = trailer ? trailer.key : "";

          return {
            ...details, //copie titre,duree etc séparement
            director: directorName,
            actors: actorsList,
            keywords: keywordsList,
            trailer_key: trailerKey
          };
        })
        .catch(err => {
          console.error(`Erreur sur le film ID ${movie.id}, ignoré.`, err);
          return null; // En cas de bug sur un film, on renvoie null pour ne pas bloquer tout le script
        });
    });

    return Promise.all(detailRequests);

  })

  .then(function (movieDetails) {
    console.log("Insertion dans la base de données");

    const movieRepository = appDataSource.getRepository(Movie);

    const insertRequests = [];

    movieDetails.forEach(function (movie) {

      // Création de l'objet correspondant à l'entité Movie
      const newMovie = movieRepository.create({
        name: movie.title || movie.original_title || "Titre inconnu",
        date: movie.release_date || "Date inconnue",
        image: movie.poster_path,
        synopsis: movie.overview || "Aucun résumé disponible.",
        rating: movie.vote_average,
        banner: movie.backdrop_path,
        duration: movie.runtime || 0,
        budget: movie.budget || 0,
        tagline: movie.tagline || "",
        original_language: movie.original_language,
        director: movie.director,
        actors: movie.actors,
        keywords: movie.keywords,
        trailer_key: movie.trailer_key,
        revenue: movie.revenue || 0,
        status: movie.status || "Inconnu",
        homepage: movie.homepage || "",
        genres: movie.genres ? movie.genres.map(g => g.name).join(', ') : "Inconnu"
      });
      console.log(newMovie.genres);

      insertRequests.push(
        movieRepository.insert(newMovie)
      );
    });

    return Promise.all(insertRequests);
  })

  .then(function () {

    console.log("Base de données remplie");

    return appDataSource.destroy();
  })

  .then(function () {

    console.log("Connexion fermée");
  })

  .catch(function (error) {

    console.error("Erreur lors du remplissage de la base :", error);

    if (appDataSource.isInitialized) {
      appDataSource.destroy();
    }
  });