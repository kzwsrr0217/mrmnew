// mrmnew/frontend/src/components/AddUserForm.tsx

import { useState, FormEvent } from 'react';
import { createUser } from '../services/api.service';
import { UserRole } from '../types';

interface AddUserFormProps {
  onUserAdded: () => void;
  onCancel: () => void;
}

export function AddUserForm({ onUserAdded, onCancel }: AddUserFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
        setError('A jelszónak legalább 6 karakter hosszúnak kell lennie.');
        return;
    }
    setError(null);

    try {
      await createUser({ username, password, role });
      alert(`A(z) "${username}" felhasználó sikeresen létrejött!`);
      onUserAdded();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hiba történt a felhasználó létrehozása közben.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Új felhasználó létrehozása</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              placeholder="Jelszó (min. 6 karakter)"
              required
            />
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
              {Object.values(UserRole).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onCancel}>Mégse</button>
            <button type="submit">Létrehozás</button>
          </div>
        </form>
      </div>
    </div>
  );
}