import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Register.css'; // <-- Importation de votre nouveau fichier CSS

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [error, setError] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/users/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstname, lastname }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'inscription");
      }

      const newUser = {
        id: data.id,
        email,
        firstname,
        lastname,
        theme: data.theme,
        isPublic: data.isPublic
      };
      
      login(newUser);
      navigate('/'); 
      
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Créer un compte</h2>
      
      {error && <div className="register-error">{error}</div>}
      
      <form onSubmit={handleRegister} className="register-form">
        <div className="register-form-group">
          <label className="register-label">Prénom :</label>
          <input 
            type="text" 
            value={firstname} 
            onChange={(e) => setFirstname(e.target.value)} 
            required 
            className="register-input" 
          />
        </div>
        
        <div className="register-form-group">
          <label className="register-label">Nom :</label>
          <input 
            type="text" 
            value={lastname} 
            onChange={(e) => setLastname(e.target.value)} 
            required 
            className="register-input" 
          />
        </div>
        
        <div className="register-form-group">
          <label className="register-label">Email :</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            className="register-input" 
          />
        </div>
        
        <div className="register-form-group">
          <label className="register-label">Mot de passe :</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            className="register-input" 
          />
        </div>
        
        <button type="submit" className="register-button">
          S'inscrire
        </button>
      </form>
      
      <div className="register-footer">
        Déjà un compte ? <Link to="/login" className="register-link">Se connecter</Link>
      </div>
    </div>
  );
};

export default Register;