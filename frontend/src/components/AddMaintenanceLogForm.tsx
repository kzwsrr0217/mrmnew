import { useState, useEffect, FormEvent } from 'react';
// getUsers importálása
import { createMaintenanceLog, getSystems, getUsers } from '../services/api.service';

interface System {
  systemid: number;
  systemname: string;
}

// Új interface a felhasználókhoz
interface User {
  id: number;
  username: string;
}

interface AddMaintenanceLogFormProps {
  onLogAdded: () => void;
  onCancel: () => void;
}

export function AddMaintenanceLogForm({ onLogAdded, onCancel }: AddMaintenanceLogFormProps) {
  const [systemId, setSystemId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [createTicket, setCreateTicket] = useState(false);
  const [assigneeId, setAssigneeId] = useState<string>(''); // <-- ÚJ: Felelős ID-ja
  const [systems, setSystems] = useState<System[]>([]);
  const [users, setUsers] = useState<User[]>([]); // <-- ÚJ: Felhasználók listája
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Rendszerek lekérdezése
    getSystems()
      .then(res => setSystems(res.data))
      .catch(() => setError('A rendszerek betöltése sikertelen.'));

    // Felhasználók lekérdezése
    getUsers()
      .then(res => setUsers(res.data))
      .catch(() => setError('A felhasználók betöltése sikertelen.'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    // Összegyűjtjük a küldendő adatokat
    const logData: any = {
      system_id: Number(systemId),
      description,
      createTicket,
    };

    // Csak akkor adjuk hozzá a felelőst, ha a ticket generálás be van kapcsolva
    if (createTicket && assigneeId) {
      logData.assignee_id = Number(assigneeId);
    }

    try {
      await createMaintenanceLog(logData);
      onLogAdded();
    } catch (err) {
      setError('Hiba a naplóbejegyzés létrehozása közben.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Új karbantartási bejegyzés</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div>
            <label>Rendszer:</label>
            <select value={systemId} onChange={e => setSystemId(e.target.value)} required>
              <option value="">-- Válasszon rendszert --</option>
              {systems.map(s => <option key={s.systemid} value={s.systemid}>{s.systemname}</option>)}
            </select>
          </div>
          <textarea
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="A karbantartás leírása..."
            required
          />
          <div style={{ margin: '1rem 0' }}>
            <label>
              <input
                type="checkbox"
                checked={createTicket}
                onChange={e => setCreateTicket(e.target.checked)}
              />
              Ticket generálása ebből a bejegyzésből
            </label>
          </div>

          {/* FELTÉTELES RENDERELÉS: Csak akkor jelenik meg, ha a checkbox be van pipálva */}
          {createTicket && (
            <div>
              <label>Ticket felelőse:</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}>
                <option value="">-- Nincs hozzárendelve --</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginTop: '1rem' }}>
            <button type="submit">Rögzítés</button>
            <button type="button" onClick={onCancel}>Mégse</button>
          </div>
        </form>
      </div>
    </div>
  );
}