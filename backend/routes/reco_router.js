// backend/routes/reco_router.js
import express from 'express';
import { In } from 'typeorm';
import { appDataSource } from '../datasource.js';
import { Movie } from '../entities/movie.js';
import { getPythonRecommendations } from '../services/reco_service.js';

const router = express.Router();

router.get('/movies/:id/recommendations', async (req, res) => {
  // 1. FORCE LA CONVERSION DE L'ID EN NOMBRE ENTIER
  const movieId = parseInt(req.params.id, 10);

  try {
    // 2. On appelle Python avec l'ID numérique
    const idsRecommandes = await getPythonRecommendations(movieId);
    
    // ==========================================
    // LOG 1 : EN DESSOUS DE L'APPEL PYTHON
    // ==========================================
    console.log("🐍 IDs reçus depuis Python :", idsRecommandes);
    
    if (!idsRecommandes || idsRecommandes.length === 0) {
      return res.json([]);
    }

    // 3. On récupère les films dans la DB
    const movieRepository = appDataSource.getRepository(Movie);
    const moviesFromDb = await movieRepository.findBy({
      id: In(idsRecommandes)
    });

    // ==========================================
    // LOG 2 : EN DESSOUS DE LA REQUÊTE BASE DE DONNÉES
    // ==========================================
    console.log("🎬 Films trouvés en BDD pour ces IDs :", moviesFromDb.map(m => m.id));

    // 4. CORRECTIONS DES COMPARAISONS EN FORÇANT LE TYPE NUMÉRIQUE (Number)
    const moviesTries = idsRecommandes.map(id => 
      moviesFromDb.find(movie => Number(movie.id) === Number(id))
    ).filter(Boolean);

    // 5. On renvoie le tableau trié et rempli
    return res.json(moviesTries);

  } catch (error) {
    console.error("Erreur sur la route de recommandation :", error.message);
    return res.status(500).json({ error: error.message });
  }
});

export default router;