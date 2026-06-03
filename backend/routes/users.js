import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import Rating from '../entities/rating.js'; // N'oubliez pas cet import !

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

// 2. Inscription (Création de compte)
router.post('/new', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const newUser = userRepository.create({
    email: req.body.email,
    password: req.body.password, // Prise en compte du mot de passe
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    theme: 'light', // Thème par défaut à la création
  });

  userRepository
    .save(newUser)
    .then(function (savedUser) {
      res.status(201).json({
        message: 'User successfully created',
        id: savedUser.id,
        theme: savedUser.theme
      });
    })
    .catch(function (error) {
      console.error(error);
      if (error.code === '23505' || error.message.includes('UNIQUE')) {
        res.status(400).json({ message: `L'email "${newUser.email}" est déjà utilisé.` });
      } else {
        res.status(500).json({ message: 'Erreur lors de la création du compte' });
      }
    });
});

// 3. Connexion (Login)
router.post('/login', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  
  userRepository
    .findOneBy({ email: req.body.email, password: req.body.password })
    .then(function (user) {
      if (user) {
        // On ne renvoie pas le mot de passe au frontend par sécurité, même dans ce MVP
        const { password, ...userWithoutPassword } = user;
        res.status(200).json({ 
          message: 'Connexion réussie', 
          user: userWithoutPassword 
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

// 4. Ajouter ou mettre à jour une note pour un film
router.post('/:userId/ratings', function (req, res) {
  const ratingRepository = appDataSource.getRepository(Rating);
  const userId = parseInt(req.params.userId, 10);
  const movieId = parseInt(req.body.movieId, 10);
  const score = parseInt(req.body.score, 10);

  // On cherche d'abord si l'utilisateur a déjà noté ce film
  ratingRepository.findOneBy({ userId: userId, movieId: movieId })
    .then(function (existingRating) {
      if (existingRating) {
        // S'il existe, on met à jour la note
        existingRating.score = score;
        return ratingRepository.save(existingRating);
      } else {
        // Sinon, on crée une nouvelle note
        const newRating = ratingRepository.create({ userId, movieId, score });
        return ratingRepository.save(newRating);
      }
    })
    .then(function (savedRating) {
      res.status(200).json({ message: 'Note enregistrée', rating: savedRating });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la sauvegarde de la note' });
    });
});

// 5. Supprimer un utilisateur
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

export default router;