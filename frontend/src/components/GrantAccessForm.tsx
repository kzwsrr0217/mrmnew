// mrmnew/frontend/src/components/GrantAccessForm.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getSystems, getPersonel, grantAccess } from '../services/api.service';
import { AccessLevel } from '../types';
import AsyncSelect from 'react-select/async'; // <-- ÚJ IMPORT

interface PersonelOption {
  value: number;
  label: string;
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
  const [systems, setSystems] = useState<System[]>([]);
  const [selectedPersonel, setSelectedPersonel] = useState<PersonelOption | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel>(AccessLevel.USER);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSystems()
      .then(res => setSystems(res.data))
      .catch(() => setError('A rendszerek betöltése sikertelen.'));
  }, []);

  // Ez a függvény tölti be az opciókat a kereshető listába
  const loadPersonelOptions = (inputValue: string, callback: (options: PersonelOption[]) => void) => {
    getPersonel(inputValue).then(res => {
      const options = res.data.map((p: { personel_id: number; nev: string }) => ({
        value: p.personel_id,
        label: p.nev,
      }));
      callback(options);
    });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedPersonel || !selectedSystemId) {
        setError('Kérem válasszon személyt és rendszert!');
        return;
    }
    setError(null);

    try {
      await grantAccess({
        personelId: selectedPersonel.value,
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
            <AsyncSelect
              cacheOptions
              defaultOptions
              loadOptions={loadPersonelOptions}
              value={selectedPersonel}
              onChange={(option) => setSelectedPersonel(option as PersonelOption)}
              placeholder="Kezdje el gépelni a nevet..."
            />
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