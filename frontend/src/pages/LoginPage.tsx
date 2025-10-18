// mrmnew/frontend/src/pages/LoginPage.tsx

import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { login as loginApi } from '../services/api.service';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await loginApi({ username, password });
      auth.login(response.data.access_token, response.data.user);
      
      // --- ITT A JAVÍTÁS ---
      // A gyökér ('/') helyett a '/systems' oldalra irányítunk át.
      navigate('/systems');

    } catch (err) {
      setError('Hibás felhasználónév vagy jelszó!');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '10rem auto', textAlign: 'center' }}>
      <h1>MRM Bejelentkezés</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Felhasználónév"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Jelszó"
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Bejelentkezés</button>
      </form>
    </div>
  );
}