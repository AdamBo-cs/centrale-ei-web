import express from 'express';
import { appDataSource } from '../datasource.js';
import { In } from 'typeorm';
import { Review } from '../entities/review.js';
import { ReviewReaction } from '../entities/reviewReaction.js';
import User from '../entities/user.js';

const router = express.Router();

// 1. Récupérer tous les commentaires d'un film (avec le nom de l'auteur et les likes)
router.get('/movie/:movieId', async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    const reviewRepo = appDataSource.getRepository(Review);
    const reactionRepo = appDataSource.getRepository(ReviewReaction);
    const userRepo = appDataSource.getRepository(User);

    // Récupérer les commentaires du film
    const reviews = await reviewRepo.find({ where: { movieId: movieId } });

    if (reviews.length === 0) {
      return res.json([]); // Aucun commentaire, on renvoie un tableau vide
    }

    // Récupérer les auteurs et les réactions en vrac pour optimiser
    const userIds = reviews.map(r => r.userId);
    const reviewIds = reviews.map(r => r.id);

    const users = await userRepo.find({ where: { id: In(userIds) } });
    const reactions = await reactionRepo.find({ where: { reviewId: In(reviewIds) } });

    // Fusionner les données pour le Frontend
    const enrichedReviews = reviews.map(review => {
      const author = users.find(u => u.id === review.userId);
      const reviewReactions = reactions.filter(r => r.reviewId === review.id);
      
      const likes = reviewReactions.filter(r => r.type === 'like').length;
      const dislikes = reviewReactions.filter(r => r.type === 'dislike').length;

      return {
        id: review.id,
        content: review.content,
        createdAt: review.createdAt,
        authorName: author ? author.firstname : 'Anonyme',
        authorId: review.userId,
        likes: likes,
        dislikes: dislikes,
        // On renvoie aussi toutes les réactions pour savoir si l'utilisateur actuel a déjà cliqué
        reactions: reviewReactions 
      };
    });

    res.json(enrichedReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des commentaires' });
  }
});

// 2. Ajouter un nouveau commentaire
router.post('/movie/:movieId', async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    const { userId, content } = req.body;

    const reviewRepo = appDataSource.getRepository(Review);
    const newReview = reviewRepo.create({ movieId, userId, content });
    await reviewRepo.save(newReview);

    res.status(201).json({ message: 'Commentaire ajouté avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'ajout du commentaire' });
  }
});

// 3. Liker ou Disliker un commentaire
router.post('/:reviewId/react', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId, 10);
    const { userId, type } = req.body; // type sera 'like' ou 'dislike'

    const reactionRepo = appDataSource.getRepository(ReviewReaction);
    
    // On cherche si l'utilisateur a déjà réagi à CE commentaire
    let existingReaction = await reactionRepo.findOne({ where: { reviewId, userId } });

    if (existingReaction) {
      if (existingReaction.type === type) {
        // S'il reclique sur le même bouton, on annule (on supprime la réaction)
        await reactionRepo.remove(existingReaction);
        return res.json({ message: 'Réaction annulée' });
      } else {
        // S'il change d'avis (ex: passe de dislike à like), on met à jour
        existingReaction.type = type;
        await reactionRepo.save(existingReaction);
        return res.json({ message: 'Réaction mise à jour' });
      }
    } else {
      // Nouvelle réaction
      const newReaction = reactionRepo.create({ reviewId, userId, type });
      await reactionRepo.save(newReaction);
      return res.json({ message: 'Réaction ajoutée' });
    }
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la réaction' });
  }
    }); // <-- LA CORRECTION EST ICI : on ferme proprement la route 3 !

// 4. Supprimer un commentaire (et ses réactions associées)
router.delete('/:reviewId', async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId, 10);
    const reviewRepo = appDataSource.getRepository(Review);
    const reactionRepo = appDataSource.getRepository(ReviewReaction);

    const review = await reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ message: 'Commentaire introuvable' });
    }

    // On supprime d'abord toutes les réactions (likes/dislikes) liées à ce commentaire
    await reactionRepo.delete({ reviewId: reviewId });
    
    // Puis on supprime le commentaire
    await reviewRepo.remove(review);

    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression du commentaire' });
  }
});

export default router;