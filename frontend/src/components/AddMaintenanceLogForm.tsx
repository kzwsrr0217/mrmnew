import { useState, useEffect, FormEvent } from 'react';
import { createMaintenanceLog, getSystems } from '../services/api.service';

interface System {
  systemid: number;
  systemname: string;
}

interface AddMaintenanceLogFormProps {
  onLogAdded: () => void;
  onCancel: () => void;
}

export function AddMaintenanceLogForm({ onLogAdded, onCancel }: AddMaintenanceLogFormProps) {
  const [systemId, setSystemId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [systems, setSystems] = useState<System[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSystems()
      .then(res => setSystems(res.data))
      .catch(() => setError('A rendszerek betöltése sikertelen.'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createMaintenanceLog({
        system_id: Number(systemId),
        description,
      });
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
          <button type="submit">Rögzítés</button>
          <button type="button" onClick={onCancel}>Mégse</button>
        </form>
      </div>
    </div>
  );
}