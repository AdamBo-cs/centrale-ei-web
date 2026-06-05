import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Appelle le script Python en lui passant le mot-clé 'duo' et les deux IDs d'utilisateurs.
 * @param {number|string} user1Id
 * @param {number|string} user2Id
 * @returns {Promise<number[]>} Liste des 5 IDs recommandés pour le duo
 */
export const getDuoPythonRecommendations = (user1Id, user2Id) => {
  return new Promise((resolve, reject) => {
    // On remonte d'un niveau pour cibler recommendation.py à la racine du backend
    const scriptPath = path.join(__dirname, '..', 'recommendation.py');

    exec(
      `python "${scriptPath}" duo ${user1Id} ${user2Id}`,
      (error, stdout) => {
        if (error) {
          console.error(`Erreur d'exécution Python Duo: ${error}`);

          return reject(
            new Error('Erreur lors du calcul des recommandations duo')
          );
        }
        try {
          const ids = JSON.parse(stdout);
          resolve(ids);
        } catch (parseError) {
          console.error(`Erreur de parsing JSON Python Duo: ${parseError}`);
          reject(new Error('Format de données Python duo invalide'));
        }
      }
    );
  });
};
