// frontend/src/components/GrantAccessForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getSystems, getPersonel, grantAccess } from '../services/api.service';
import { AccessLevel } from '../types';

interface Personel {
  personel_id: number;
  nev: string;
}

interface System {
  systemid: number;
  systemname: string;
}

interface GrantAccessFormProps {
  onAccessGranted: () => void;
  onCancel: () => void;
}

export function GrantAccessForm({ onAccessGranted, onCancel }: GrantAccessFormProps) {
  const [personel, setPersonel] = useState<Personel[]>([]);
  const [systems, setSystems] = useState<System[]>([]);
  
  const [selectedPersonelId, setSelectedPersonelId] = useState<string>('');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel>(AccessLevel.USER);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getPersonel(), getSystems()])
      .then(([personelRes, systemsRes]) => {
        setPersonel(personelRes.data);
        setSystems(systemsRes.data);
      })
      .catch(() => setError('A személyek vagy rendszerek betöltése sikertelen.'));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPersonelId || !selectedSystemId) {
        setError('Kérem válasszon személyt és rendszert!');
        return;
    }
    setError(null);

    try {
      await grantAccess({
        personelId: Number(selectedPersonelId),
        systemId: Number(selectedSystemId),
        accessLevel: selectedAccessLevel,
      });
      onAccessGranted();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Hiba történt a hozzáférés megadása közben.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>Új hozzáférés megadása</h3>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          
          <div>
            <label>Személy:</label>
            <select value={selectedPersonelId} onChange={e => setSelectedPersonelId(e.target.value)} required>
              <option value="">Válasszon...</option>
              {personel.map(p => <option key={p.personel_id} value={p.personel_id}>{p.nev}</option>)}
            </select>
          </div>
          
          <div>
            <label>Rendszer:</label>
            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)} required>
                <option value="">Válasszon...</option>
              {systems.map(s => <option key={s.systemid} value={s.systemid}>{s.systemname}</option>)}
            </select>
          </div>

          <div>
            <label>Jogosultsági szint:</label>
            <select value={selectedAccessLevel} onChange={e => setSelectedAccessLevel(e.target.value as AccessLevel)}>
              {Object.values(AccessLevel).map(level => 
                <option key={level} value={level}>{level.toUpperCase()}</option>
              )}
            </select>
          </div>
          
          <button type="submit">Hozzárendelés</button>
          <button type="button" onClick={onCancel}>Mégse</button>
        </form>
      </div>
    </div>
  );
}