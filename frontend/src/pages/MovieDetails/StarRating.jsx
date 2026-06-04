import React, { useState } from 'react';

const StarRating = ({ value, onChange }) => {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div style={{ display: 'inline-flex', gap: '4px' }}>
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        const displayValue = hoverValue || value;

        // Calcul du remplissage (0, 0.5 pour la moitié, 1 pour plein)
        let fill = 0;
        if (displayValue >= starValue) fill = 1;
        else if (displayValue >= starValue - 0.5) fill = 0.5;

        return (
          <div
            key={starValue}
            style={{ 
              position: 'relative', 
              cursor: 'pointer', 
              fontSize: '30px', 
              color: '#e5e7eb', // Couleur de l'étoile vide (gris clair)
              lineHeight: 1 
            }}
            onMouseMove={(e) => {
              // Détecte si la souris est sur la moitié gauche ou droite de l'étoile
              const { left, width } = e.currentTarget.getBoundingClientRect();
              const isHalf = (e.clientX - left) < width / 2;
              setHoverValue(isHalf ? starValue - 0.5 : starValue);
            }}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(hoverValue || starValue)}
          >
            {/* Étoile de fond */}
            <span>★</span>

            {/* Étoile dorée superposée (coupée à 50% ou 100% selon le survol) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${fill * 100}%`,
              overflow: 'hidden',
              color: '#ffd700' // Couleur de l'étoile remplie (doré)
            }}>
              ★
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;