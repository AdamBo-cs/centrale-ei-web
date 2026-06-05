import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pour les films similaires
export const getPythonRecommendations = (movieId) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'recommendation.py');
    exec(`python "${scriptPath}" movie ${movieId}`, (error, stdout) => {
      if (error) {
        return reject(new Error('Erreur recommandation film'));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
};

// Pour le profil utilisateur (Top 5 films proches)
export const getUserPythonRecommendations = (userId) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'recommendation.py');
    exec(`python "${scriptPath}" user ${userId}`, (error, stdout) => {
      if (error) {
        return reject(new Error('Erreur recommandation utilisateur'));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (e) {
        reject(e);
      }
    });
  });
};
