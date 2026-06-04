import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import Rating from '../entities/rating.js';
import { Like, In } from 'typeorm'; // Ajoute 'In' à côté de 'Like'
import { Movie } from '../entities/movie.js'; // Ajoute l'import du film (attention aux accolades, c'est un export nommé !)

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
router.get('/search', async function (req, res) {
  try {
    const query = req.query.q || '';
    const userRepository = appDataSource.getRepository(User);

    const users = await userRepository.find({
      where: [
        { firstname: Like(`%${query}%`) },
        { lastname: Like(`%${query}%`) }
      ],
      // On sélectionne uniquement les colonnes non sensibles à renvoyer au frontend
      select: ['id', 'email', 'firstname', 'lastname', 'isPublic'] 
    });

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
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
    isPublic: true // Public par défaut à la création selon vos préférences
  });

  userRepository
    .save(newUser)
    .then(function (savedUser) {
      res.status(201).json({
        message: 'User successfully created',
        id: savedUser.id,
        theme: savedUser.theme,
        isPublic: savedUser.isPublic
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

// 4. Connexion (Login)
router.post('/login', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  
  userRepository
    .findOneBy({ email: req.body.email, password: req.body.password })
    .then(function (user) {
      if (user) {
        // Sécurité : on retire le mot de passe de l'objet avant de l'envoyer au frontend
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

// 5. Récupérer le profil et les notes d'un utilisateur (Avec gestion privé/public et détails des films)
router.get('/:userId/profile', async function (req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const viewerId = parseInt(req.query.viewerId, 10);
    
    const userRepository = appDataSource.getRepository(User);
    const ratingRepository = appDataSource.getRepository(Rating);
    const movieRepository = appDataSource.getRepository(Movie);

    const user = await userRepository.findOneBy({ id: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const { password, ...safeUser } = user;

    // Si privé et pas le propriétaire : on bloque les données
    if (!user.isPublic && userId !== viewerId) {
      return res.json({ user: safeUser, ratings: [], isPrivateAccess: true });
    }

    // 1. On récupère les notes de l'utilisateur
    const ratings = await ratingRepository.findBy({ userId: userId });
    
    // Si aucune note, on renvoie tout de suite un tableau vide
    if (ratings.length === 0) {
      return res.json({ user: safeUser, ratings: [], isPrivateAccess: false });
    }

    // 2. On récupère les détails des films correspondants aux notes
    const movieIds = ratings.map(r => r.movieId);
    const movies = await movieRepository.find({
      where: { id: In(movieIds) } // On cherche tous les films dont l'ID est dans notre liste
    });

    // 3. On fusionne la note et les détails du film pour le frontend
    const enrichedRatings = ratings.map(rating => {
      const movieDetails = movies.find(m => m.id === rating.movieId);
      return {
        id: rating.movieId,          // Pour la navigation vers la page du film
        name: movieDetails?.name,    // Le titre
        image: movieDetails?.image,  // L'affiche
        date: movieDetails?.date,    // L'année
        score: rating.score          // La note (le plus important !)
      };
    });

    // On renvoie notre tableau enrichi !
    res.json({ user: safeUser, ratings: enrichedRatings, isPrivateAccess: false });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération du profil' });
  }
});

// 6. Mettre à jour les préférences de l'utilisateur (Ex: changer le statut public/privé)
router.put('/:userId/preferences', async function (req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const userRepository = appDataSource.getRepository(User);
    
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    // On vérifie si la propriété est présente dans le corps de la requête avant de modifier
    if (req.body.isPublic !== undefined) {
      user.isPublic = req.body.isPublic;
    }
    
    await userRepository.save(user);
    
    const { password, ...safeUser } = user;
    res.json({ message: 'Préférences mises à jour', user: safeUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour' });
  }
});

// 7. Ajouter ou mettre à jour une note pour un film
router.post('/:userId/ratings', function (req, res) {
  const ratingRepository = appDataSource.getRepository(Rating);
  const userId = parseInt(req.params.userId, 10);
  const movieId = parseInt(req.body.movieId, 10);
  const score = parseFloat(req.body.score);

  ratingRepository.findOneBy({ userId: userId, movieId: movieId })
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
      res.status(200).json({ message: 'Note enregistrée', rating: savedRating });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la sauvegarde de la note' });
    });
});

// 7b. Récupérer la note d'un utilisateur spécifique pour un film spécifique
router.get('/:userId/ratings/:movieId', async function (req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    const movieId = parseInt(req.params.movieId, 10);
    
    const ratingRepository = appDataSource.getRepository(Rating);
    const rating = await ratingRepository.findOneBy({ userId: userId, movieId: movieId });

    if (rating) {
      res.json({ score: rating.score });
    } else {
      res.json({ score: 0 }); // Pas encore de note
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de la note' });
  }
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

export default router;