import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { currentUser, logout } = useAuth();

  return (
    <div className="scrapbook-layout">
      {/* COLONNE GAUCHE : Navigation */}
      <aside className="scrapbook-sidebar-left">
        <div className="sidebar-logo">
          <h2>🎬 Le cinéphile</h2>
          <p>Passionnés de cinéma</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">🏠 Accueil</Link>
          <Link to="/about" className="nav-item">ℹ️ À propos</Link>
          
          {currentUser ? (
            <>
              <Link to="/profile" className="nav-item">👤 Mon profil</Link>
              <button onClick={logout} className="nav-item btn-logout-text">
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">🔑 Se connecter</Link>
              {/* Le bouton d'inscription s'affiche ici uniquement si déconnecté */}
              <Link to="/register" className="nav-item">📝 S'inscrire</Link>
            </>
          )}
        </nav>
      </aside>

      {/* COLONNE CENTRALE : Le contenu de tes pages (Accueil, Profil...) */}
      <main className="scrapbook-main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;