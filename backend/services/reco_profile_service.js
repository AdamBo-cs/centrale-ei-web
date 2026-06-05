import { Movie } from '../entities/movie.js';

export const updateUserProfileVector = (userId, appDataSource) => {
  // 1. Récupération des notes de l'utilisateur
  return appDataSource
    .query(`SELECT movieId, score FROM rating WHERE userId = ?`, [userId])
    .then((ratings) => {
      if (!ratings || ratings.length === 0) {
        console.log(
          `Impossible de calculer le vecteur : aucune note trouvée pour l'utilisateur ${userId}.`
        );

        return;
      }

      const movieRepository = appDataSource.getRepository(Movie);

      // 2. Récupération de tous les films
      return movieRepository.find().then((allMovies) => {
        let profileVector = null;

        ratings.forEach((rating) => {
          const targetMovieId = Number(rating.movieId);
          const movie = allMovies.find((m) => Number(m.id) === targetMovieId);

          if (movie) {
            const rawVector =
              movie.vecteur_contenu || movie.vecteurContenu || movie.vecteur;

            if (rawVector) {
              try {
                const movieVector =
                  typeof rawVector === 'string'
                    ? JSON.parse(rawVector)
                    : rawVector;

                if (Array.isArray(movieVector)) {
                  if (!profileVector) {
                    profileVector = new Array(movieVector.length).fill(0);
                  }

                  const weight = Number(rating.score);

                  for (let i = 0; i < movieVector.length; i++) {
                    profileVector[i] += movieVector[i] * weight;
                  }
                }
              } catch (e) {
                // Erreur de parsing ignorée
              }
            }
          }
        });

        // 3. Enregistrement direct du vecteur combiné (brut)
        if (profileVector) {
          const vectorJsonString = JSON.stringify(profileVector);

          return appDataSource
            .query(`UPDATE user SET vecteur_profil = ? WHERE id = ?`, [
              vectorJsonString,
              userId,
            ])
            .then(() => {
              console.log(
                `Vecteur de profil mis à jour avec succès en base de données pour l'utilisateur ${userId}.`
              );
            });
        } else {
          console.log(
            `Impossible de calculer le vecteur : aucun film noté ne possède de données vectorielles.`
          );
        }
      });
    })
    .catch((error) => {
      console.error(
        `Erreur lors de la mise à jour du vecteur : ${error.message}`
      );
    });
};
