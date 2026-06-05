import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ReviewSection.css';

const ReviewSection = ({ movieId }) => {
  const { currentUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [newReviewContent, setNewReviewContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // NOUVEAU : État pour empêcher le spam de clics
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8000/reviews/movie/${movieId}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des avis:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // On bloque si c'est vide, non connecté, OU si c'est déjà en cours d'envoi !
    if (!newReviewContent.trim() || !currentUser || isSubmitting) return;

    setIsSubmitting(true); // On verrouille le bouton

    try {
      const response = await fetch(`http://localhost:8000/reviews/movie/${movieId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: newReviewContent,
        }),
      });

      if (response.ok) {
        setNewReviewContent('');
        fetchReviews();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'avis:", error);
    } finally {
      setIsSubmitting(false); // On déverrouille le bouton une fois fini
    }
  };

  // NOUVEAU : Fonction pour supprimer
  const handleDelete = async (reviewId) => {
    // Petite sécurité pour éviter les clics accidentels
    if (!window.confirm("Es-tu sûr de vouloir déchirer cette note ?")) return;

    try {
      const response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchReviews(); // On recharge la liste, le commentaire aura disparu
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleReaction = async (reviewId, type) => {
    if (!currentUser) {
      alert("Vous devez être connecté pour réagir !");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/reviews/${reviewId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          type: type,
        }),
      });

      if (response.ok) {
        fetchReviews();
      }
    } catch (error) {
      console.error("Erreur lors de la réaction:", error);
    }
  };

  if (isLoading) return <p className="font-handwritten">Chargement des notes du carnet...</p>;

  return (
    <div className="review-section-container">
      <h3 className="font-handwritten review-title">Notes & Avis des Cinéphiles</h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="review-form">
          <textarea
            className="review-input font-handwritten"
            placeholder="Qu'as-tu pensé de ce film ? Écris ta note ici..."
            value={newReviewContent}
            onChange={(e) => setNewReviewContent(e.target.value)}
            rows="3"
            required
          />
          {/* On grise et désactive le bouton si isSubmitting est vrai */}
          <button 
            type="submit" 
            className="review-submit-btn font-typewriter"
            disabled={isSubmitting}
            style={{ opacity: isSubmitting ? 0.5 : 1, cursor: isSubmitting ? 'wait' : 'pointer' }}
          >
            {isSubmitting ? "Épinglage..." : "Épingler mon avis"}
          </button>
        </form>
      ) : (
        <p className="review-login-prompt font-typewriter">Connecte-toi pour laisser ton avis sur ce film.</p>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="font-handwritten empty-reviews">Aucun avis pour le moment. Sois le premier à écrire !</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="review-author font-typewriter">{review.authorName}</span>
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <p className="review-content font-handwritten">{review.content}</p>
              
              <div className="review-actions-container">
                <div className="review-actions">
                  <button className="reaction-btn" onClick={() => handleReaction(review.id, 'like')} title="J'aime">
                    👍 <span className="reaction-count">{review.likes}</span>
                  </button>
                  <button className="reaction-btn" onClick={() => handleReaction(review.id, 'dislike')} title="Je n'aime pas">
                    👎 <span className="reaction-count">{review.dislikes}</span>
                  </button>
                </div>

                {/* NOUVEAU : Le bouton supprimer, visible QUE si c'est notre propre commentaire */}
                {currentUser && currentUser.id === review.authorId && (
                  <button className="review-delete-btn font-typewriter" onClick={() => handleDelete(review.id)}>
                    🗑️ Supprimer
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;