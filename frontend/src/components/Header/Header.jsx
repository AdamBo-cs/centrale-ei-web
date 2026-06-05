import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';
import { useState, useEffect } from 'react';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const handleScroll = () => {

      if (window.scrollY < 50) {
        setVisible(true);
        return;
      }

      if (window.scrollY > 150) {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <div
          className="header-trigger"
          onMouseEnter={() => setVisible(true)}
      />
      <nav
        className={`header-container ${visible ? 'visible' : ''}`}
        onMouseLeave={() => {
          if (window.scrollY > 150) {
            setVisible(false);}
        }}
      >
      <div className="header-logo">
        <Link className="link logo-text" to="/">CinéReco</Link>
      </div>

      {/* Navigation principale */}
      <div className="header-nav-links">
        <Link className="link" to="/">Accueil</Link>
        <Link className="link" to="/counter">Compteur</Link>
        <Link className="link" to="/users">Utilisateurs</Link>
        <Link className="link" to="/about">À propos</Link>
        {currentUser && <Link className="link" to="/profile">Mon Profil</Link>}
      </div>

      {/* Zone utilisateur tout à droite */}
      <div className="header-auth-zone">
        {currentUser ? (
          <div className="user-logged-wrapper">
            <span className="user-welcome">Bonjour, {currentUser.firstname}</span>
            <button onClick={handleLogout} className="btn-logout">
              Se déconnecter
            </button>
          </div>
        ) : (
          <div className="auth-links-wrapper">
            <Link className="link auth-link-login" to="/login">Se connecter</Link>
            <Link className="link btn-register" to="/register">S'inscrire</Link>
          </div>
        )}
      </div>
    </nav>
    </>
  );
};

export default Header;