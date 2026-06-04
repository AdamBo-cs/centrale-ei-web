import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';
import Rating from '../entities/rating.js';
import { Like } from 'typeorm'; // Import indispensable pour la recherche partielle

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

// 5. Récupérer le profil et les notes d'un utilisateur (Avec gestion privé/public)
router.get('/:userId/profile', async function (req, res) {
  try {
    const userId = parseInt(req.params.userId, 10);
    // On extrait l'ID de la personne qui navigue (le viewer) passé en paramètre de requête
    const viewerId = parseInt(req.query.viewerId, 10);
    
    const userRepository = appDataSource.getRepository(User);
    const ratingRepository = appDataSource.getRepository(Rating);

    const user = await userRepository.findOneBy({ id: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const { password, ...safeUser } = user;

    // --- LOGIQUE DE CONFIDENTIALITÉ ---
    // Si le compte ciblé est privé ET que la personne qui regarde n'est pas le propriétaire du compte
    if (!user.isPublic && userId !== viewerId) {
      return res.json({ 
        user: safeUser, 
        ratings: [], // On n'envoie aucune note
        isPrivateAccess: true // Flag pour indiquer au frontend d'afficher un message de verrouillage
      });
    }

    // Sinon (le compte est public OU l'utilisateur regarde son propre profil), on va chercher ses notes
    const ratings = await ratingRepository.findBy({ userId: userId });
    res.json({ 
      user: safeUser, 
      ratings: ratings, 
      isPrivateAccess: false 
    });
    
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
  const score = parseInt(req.body.score, 10);

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