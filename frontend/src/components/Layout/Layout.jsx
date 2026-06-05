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
          <h2>🎬 Ciné Carnet</h2>
          <p>Le carnet d'un cinéphile</p>
        </div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">🏠 Accueil</Link>
          <Link to="/counter" className="nav-item">🔢 Compteur</Link>
          <Link to="/users" className="nav-item">👥 Utilisateurs</Link>
          <Link to="/about" className="nav-item">ℹ️ À propos</Link>
          {currentUser ? (
            <>
              <Link to="/profile" className="nav-item">👤 Mon profil</Link>
              <button onClick={logout} className="nav-item btn-logout-text">
                🚪 Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-item">🔑 Se connecter</Link>
          )}
        </nav>

        {/* Petit espace "Post-it" en bas à gauche */}
        <div className="sidebar-postit">
          <h4>Aujourd'hui</h4>
          <ul>
            <li>Revoir Inception</li>
            <li>Préparer la soirée ciné</li>
          </ul>
        </div>
      </aside>

      {/* COLONNE CENTRALE : Le contenu de tes pages (Accueil, Profil...) */}
      <main className="scrapbook-main-content">
        {children}
      </main>

      {/* COLONNE DROITE : Widgets, citations, etc. */}
      <aside className="scrapbook-sidebar-right">
        {/* Le Header de droite (Recherche + Profil) de ta maquette pourrait aller en haut ici, ou dans le main */}
        <div className="widget-quote">
          <p>"Le cinéma, c'est l'écriture avec de la lumière."</p>
          <span>- Jean Cocteau</span>
        </div>

        <div className="widget-must-see">
          <h3>⭐ À voir absolument</h3>
          <ul>
            <li>2001, l'Odyssée de l'espace</li>
            <li>Le Parrain</li>
            <li>Forrest Gump</li>
          </ul>
        </div>
      </aside>
    </div>
  );
};

export default Layout;