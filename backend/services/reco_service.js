import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Appelle le script Python pour obtenir les 5 IDs les plus proches.
 * @param {number|string} movieId 
 * @returns {Promise<number[]>} Liste des 5 IDs recommandés
 */
export const getPythonRecommendations = (movieId) => {
  return new Promise((resolve, reject) => {
    // On part de __dirname (backend/services/), on remonte d'un niveau ('..') et on cible le fichier
    const scriptPath = path.join(__dirname, '..', 'recommendation.py');
    exec(`python "${scriptPath}" ${movieId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erreur d'exécution Python: ${error}`);
        return reject(new Error("Erreur lors du calcul des recommandations"));
      }
      try {
        const ids = JSON.parse(stdout);
        resolve(ids);
      } catch (parseError) {
        console.error(`Erreur de parsing JSON Python: ${parseError}`);
        reject(new Error("Format de données Python invalide"));
      }
    });
  });
};