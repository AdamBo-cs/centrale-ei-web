import express from 'express';
import { In, Like } from 'typeorm';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import Rating from '../entities/rating.js';
import { Movie } from '../entities/movie.js';
import { updateUserProfileVector } from '../services/reco_profile_service.js';
import { getUserPythonRecommendations } from '../services/reco_service.js';

const router = express.Router();

// 1. Récupérer tous les utilisateurs
router.get('/', function (req, res) {
  appDataSource
    .getRepository(User)
    .find({})
    .then(function (users) {
      res.json({ users: users });
    });
});

// 2. Rechercher des utilisateurs (Recherche TOUS les comptes, publics et privés)
router.get('/search', function (req, res) {
  const query = req.query.q || '';
  const userRepository = appDataSource.getRepository(User);

  userRepository
    .find({
      where: [
        { firstname: Like(`%${query}%`) },
        { lastname: Like(`%${query}%`) },
      ],
      select: ['id', 'email', 'firstname', 'lastname', 'isPublic'],
    })
    .then(function (users) {
      res.json({ users });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la recherche' });
    });
});

// 3. Inscription (Création de compte)
router.post('/new', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const newUser = userRepository.create({
    email: req.body.email,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    theme: 'light',
    isPublic: true,
  });

  userRepository
    .save(newUser)
    .then(function (savedUser) {
      res.status(201).json({
        message: 'User successfully created',
        id: savedUser.id,
        theme: savedUser.theme,
        isPublic: savedUser.isPublic,
      });
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505' || error.message.includes('UNIQUE')) {
        res
          .status(400)
          .json({ message: `L'email "${newUser.email}" est déjà utilisé.` });
      } else {
        res
          .status(500)
          .json({ message: 'Erreur lors de la création du compte' });
      }
    });
});

// 4. Connexion (Login)
router.post('/login', function (req, res) {
  const userRepository = appDataSource.getRepository(User);

  userRepository
    .findOneBy({ email: req.body.email, password: req.body.password })
    .then(function (user) {
      if (user) {
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({
          message: 'Connexion réussie',
          user: userWithoutPassword,
        });
      } else {
        res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
    });
});

// 5. Récupérer le profil et les notes d'un utilisateur (Avec gestion privé/public et détails des films)
router.get('/:userId/profile', function (req, res) {
  const userId = parseInt(req.params.userId, 10);
  const viewerId = parseInt(req.query.viewerId, 10);

  const userRepository = appDataSource.getRepository(User);
  const ratingRepository = appDataSource.getRepository(Rating);
  const movieRepository = appDataSource.getRepository(Movie);

  userRepository
    .findOneBy({ id: userId })
    .then(function (user) {
      if (!user) {
        res.status(404).json({ message: 'Utilisateur introuvable' });

        return null; // On coupe la chaîne de Promises ici
      }

      const { password, ...safeUser } = user;

      // Si privé et pas le propriétaire : on bloque les données
      if (!user.isPublic && userId !== viewerId) {
        res.json({ user: safeUser, ratings: [], isPrivateAccess: true });

        return null;
      }

      // Si tout est bon, on passe l'utilisateur au bloc .then() suivant pour chercher les notes
      return safeUser;
    })
    .then(function (safeUser) {
      if (!safeUser) {
        return;
      } // Si on a déjà répondu (404 ou privé), on s'arrête

      return ratingRepository
        .findBy({ userId: userId })
        .then(function (ratings) {
          if (ratings.length === 0) {
            res.json({ user: safeUser, ratings: [], isPrivateAccess: false });

            return null;
          }

          // On transmet les notes et les infos utilisateur à l'étape suivante
          return { safeUser, ratings };
        });
    })
    .then(function (context) {
      if (!context) {
        return;
      } // Arrêt si déjà traité

      const { safeUser, ratings } = context;
      const movieIds = ratings.map((r) => r.movieId);

      return movieRepository
        .find({ where: { id: In(movieIds) } })
        .then(function (movies) {
          const enrichedRatings = ratings.map((rating) => {
            const movieDetails = movies.find((m) => m.id === rating.movieId);

            return {
              id: rating.movieId,
              name: movieDetails?.name,
              image: movieDetails?.image,
              date: movieDetails?.date,
              score: rating.score,
            };
          });

          res.json({
            user: safeUser,
            ratings: enrichedRatings,
            isPrivateAccess: false,
          });
        });
    })
    .catch(function (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Erreur lors de la récupération du profil' });
    });
});

// 6. Mettre à jour les préférences de l'utilisateur (Ex: changer le statut public/privé)
router.put('/:userId/preferences', function (req, res) {
  const userId = parseInt(req.params.userId, 10);
  const userRepository = appDataSource.getRepository(User);

  userRepository
    .findOneBy({ id: userId })
    .then(function (user) {
      if (!user) {
        res.status(404).json({ message: 'Utilisateur introuvable' });

        return null;
      }

      if (req.body.isPublic !== undefined) {
        user.isPublic = req.body.isPublic;
      }

      return userRepository.save(user);
    })
    .then(function (savedUser) {
      if (!savedUser) {
        return;
      }
      const { password, ...safeUser } = savedUser;
      res.json({ message: 'Préférences mises à jour', user: safeUser });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    });
});

// 7. Ajouter ou mettre à jour une note pour un film + Recalcul instantané du vecteur profil
router.post('/:userId/ratings', function (req, res) {
  const ratingRepository = appDataSource.getRepository(Rating);
  const userId = parseInt(req.params.userId, 10);
  const movieId = parseInt(req.body.movieId, 10);
  const score = parseFloat(req.body.score);

  ratingRepository
    .findOneBy({ userId: userId, movieId: movieId })
    .then(function (existingRating) {
      if (existingRating) {
        existingRating.score = score;

        return ratingRepository.save(existingRating);
      } else {
        const newRating = ratingRepository.create({ userId, movieId, score });

        return ratingRepository.save(newRating);
      }
    })
    .then(function (savedRating) {
      // AJOUT MAGIQUE : Lancement instantané du recalcul du vecteur profil (qui renvoie une Promise)
      return updateUserProfileVector(userId, appDataSource).then(function () {
        res.status(200).json({
          message: 'Note enregistrée et profil mis à jour !',
          rating: savedRating,
        });
      });
    })
    .catch(function (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Erreur lors de la sauvegarde de la note' });
    });
});

// 7b. Récupérer la note d'un utilisateur spécifique pour un film spécifique
router.get('/:userId/ratings/:movieId', function (req, res) {
  const userId = parseInt(req.params.userId, 10);
  const movieId = parseInt(req.params.movieId, 10);

  const ratingRepository = appDataSource.getRepository(Rating);

  ratingRepository
    .findOneBy({ userId: userId, movieId: movieId })
    .then(function (rating) {
      if (rating) {
        res.json({ score: rating.score });
      } else {
        res.json({ score: 0 });
      }
    })
    .catch(function (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Erreur lors de la récupération de la note' });
    });
});

// 8. Supprimer un utilisateur
router.delete('/:userId', function (req, res) {
  appDataSource
    .getRepository(User)
    .delete({ id: req.params.userId })
    .then(function () {
      res.status(204).json({ message: 'User successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the user' });
    });
});

// Dans ton fichier de routes Express
router.get('/:userId/recommendations', function (req, res) {
  const userId = parseInt(req.params.userId, 10);
  const movieRepository = appDataSource.getRepository(Movie);

  // 1. Récupération des 5 IDs triés par Python
  getUserPythonRecommendations(userId)
    .then(function (recommendedIds) {
      if (!recommendedIds || recommendedIds.length === 0) {
        res.json({ recommendations: [] });

        return null;
      }

      // 2. Extraction depuis la BDD (attention, SQLite va casser l'ordre ici)
      return movieRepository
        .find({
          where: { id: In(recommendedIds) },
        })
        .then(function (movies) {
          // 3. LA CORRECTION : On force les films à se remettre dans l'ordre exact de la liste recommendedIds
          const orderedMovies = recommendedIds
            .map(function (id) {
              return movies.find(function (movie) {
                return Number(movie.id) === Number(id);
              });
            })
            .filter(Boolean); // Sécurité pour éliminer les éventuels films introuvables

          return orderedMovies;
        });
    })
    .then(function (orderedRecommendations) {
      if (!orderedRecommendations) {
        return;
      }
      // Envoi du tableau correctement ordonné au frontend
      res.json({ recommendations: orderedRecommendations });
    })
    .catch(function (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Erreur lors du calcul des recommandations' });
    });
});
export default router;
