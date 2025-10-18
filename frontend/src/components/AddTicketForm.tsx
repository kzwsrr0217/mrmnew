// mrmnew/frontend/src/components/AddTicketForm.tsx

import { useState, useEffect, FormEvent, useMemo } from 'react';
import { createTicket, getUsers } from '../services/api.service';
import { TicketPriority, UserRole } from '../types';
import { useAuth } from '../auth/AuthContext';

interface User {
  id: number;
  username: string;
  role: UserRole;
}

interface AddTicketFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function AddTicketForm({ onSuccess, onCancel }: AddTicketFormProps) {
  const { user: currentUser } = useAuth();
  const isApk = currentUser?.role === UserRole.ALEGYSEGPARANCSNOK;

  const [title, setTitle] = useState(isApk ? 'Új hozzáférés igénylése' : '');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.NORMAL);
  const [assigneeId, setAssigneeId] = useState<string>('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const rbfUserId = useMemo(() => {
    if (!isApk) return '';
    const rbfUser = users.find(u => u.role === UserRole.RBF);
    return rbfUser ? String(rbfUser.id) : '';
  }, [users, isApk]);


  useEffect(() => {
    getUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError('A felhasználók listájának betöltése sikertelen.'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createTicket({
        title,
        description,
        priority,
        assignee_id: isApk ? Number(rbfUserId) : (assigneeId ? Number(assigneeId) : undefined),
      });
      onSuccess(); // A helyes függvény hívása
    } catch (err) {
      setError('Hiba a ticket létrehozása közben.');
      console.error("Hiba a ticket létrehozása során:", err);
    }
  } // <-- NINCS UTÁNA PONTOSVESSZŐ

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Új feladat rögzítése</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="Feladat címe" 
            required 
            disabled={isApk}
          />
          <textarea 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder={isApk ? "Kérjük, ide írja a beosztott nevét, a kért rendszert és a kérés rövid indoklását." : "Leírás (opcionális)"} 
            rows={5}
            required 
          />
          <div>
            <label>Prioritás:</label>
            <select value={priority} onChange={e => setPriority(e.target.value as TicketPriority)}>
              {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          
          {!isApk && (
            <div>
              <label>Hozzárendelés:</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">-- Nincs hozzárendelve --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
          )}

          <button type="submit">Létrehozás</button>
          <button type="button" onClick={onCancel}>Mégse</button>
        </form>
      </div>
    </div>
  );
}