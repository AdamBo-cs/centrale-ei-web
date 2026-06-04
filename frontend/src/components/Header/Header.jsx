import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Vérifie que le chemin correspond bien à ton dossier
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Petite fonction pour se déconnecter puis revenir à l'accueil
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="Header-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <Link className="Link" to="/">Home</Link>
      <div>|</div>
      <Link className="Link" to="/counter">Counter</Link>
      <div>|</div>
      <Link className="Link" to="/users">Users</Link>
      <div>|</div>
      <Link className="Link" to="/about">About</Link>

      {/* Cet espace flexible pousse le bloc de connexion tout à droite de la barre */}
      <div style={{ flexGrow: 1 }}></div>

      {/* --- AFFICHAGE CONDITIONNEL SELON L'ÉTAT DE CONNEXION --- */}
      {currentUser ? (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold' }}>Bonjour, {currentUser.firstname}</span>
          <button 
            onClick={handleLogout} 
            style={{ padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            Se déconnecter
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link className="Link" to="/login">Se connecter</Link>
          <Link className="Link" to="/register">S'inscrire</Link>
        </div>
      )}
    </div>
  );
};

export default Header;