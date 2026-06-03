import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const MovieDetails = () => {
  // 1. Extraction du paramètre dynamique de l'URI
  const { id } = useParams();

  // 2. Définition des états locaux gérant le cycle de vie réseau
  const [movieDetails, setMovieDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Instanciation de l'AbortController pour la prévention des fuites de mémoire (Memory Leaks)
    const abortController = new AbortController();

    const fetchMovieData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ATTENTION : Si singleMovie.id dans Home.jsx correspond à l'ID de l'API IMDB (ex: tt0111161),
        // utilisez l'API OMDB. Si c'est l'ID de votre base SQLite (ex: 1, 2), 
        // vous devrez pointer vers votre propre backend (ex: http://localhost:8000/movies/${id}).
        
        // Exemple d'implémentation pointant vers l'interface publique d'IMDB (OMDB) :
        const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=VOTRE_CLE_API_ICI`, {
          signal: abortController.signal
        });

        if (!response.ok) {
          throw new Error(`Erreur HTTP lors de la requête : ${response.status}`);
        }

        const data = await response.json();

        // Validation du payload de retour selon les spécifications de l'API cible
        if (data.Response === "False") {
          throw new Error(data.Error || "Ressource introuvable.");
        }

        setMovieDetails(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieData();

    // Fonction de nettoyage (Cleanup function)
    return () => abortController.abort();
    
  }, [id]); // La dépendance à 'id' garantit le rechargement si l'URL est modifiée.

  // 3. Arbre de décision de rendu (Rendu conditionnel)
  if (isLoading) return <div>Initialisation de la requête réseau...</div>;
  if (error) return <div style={{ color: 'red' }}>Exception critique : {error}</div>;
  if (!movieDetails) return null;

  // 4. Rendu de la ressource (à adapter selon les clés exactes du JSON renvoyé par votre API)
  return (
    <main style={{ padding: '2rem' }}>
      <h1>{movieDetails.Title} ({movieDetails.Year})</h1>
      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <img 
          src={movieDetails.Poster} 
          alt={`Affiche du film ${movieDetails.Title}`} 
          style={{ maxWidth: '300px', borderRadius: '8px' }}
        />
        <article>
          <h3>Synopsis</h3>
          <p>{movieDetails.Plot}</p>
          
          <h3>Métadonnées</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            <li><strong>Réalisateur(s) :</strong> {movieDetails.Director}</li>
            <li><strong>Genre :</strong> {movieDetails.Genre}</li>
            <li><strong>Acteurs :</strong> {movieDetails.Actors}</li>
            <li><strong>Évaluation :</strong> {movieDetails.imdbRating} / 10</li>
          </ul>
        </article>
      </div>
    </main>
  );
};

export default MovieDetails;