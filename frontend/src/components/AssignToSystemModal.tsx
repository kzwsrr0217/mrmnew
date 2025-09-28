// mrmnew/frontend/src/components/AssignToSystemModal.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getSystems, assignLogisticsItem } from '../services/api.service';
import { HardwareType } from '../types'; // ÚJ IMPORT

interface System {
  systemid: number;
  systemname: string;
}

interface LogisticsItem {
  id: number;
  name: string;
}

interface AssignToSystemModalProps {
  item: LogisticsItem;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignToSystemModal({ item, onClose, onSuccess }: AssignToSystemModalProps) {
  const [systems, setSystems] = useState<System[]>([]);
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

    // --- ÚJ ÁLLAPOTOK ---
  const [hardwareType, setHardwareType] = useState<HardwareType>(HardwareType.EGYEB);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    getSystems()
      .then(res => {
        setSystems(res.data);
        if (res.data.length > 0) {
          setSelectedSystemId(String(res.data[0].systemid));
        }
      })
      .catch(() => setError('A rendszerek betöltése sikertelen.'));
  }, []);

    const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedSystemId) {
      setError('Kérjük, válasszon egy rendszert!');
      return;
    }
    try {
      // JAVÍTVA: Az új DTO-nak megfelelő objektumot küldjük
      await assignLogisticsItem({
        itemId: item.id,
        systemId: Number(selectedSystemId),
        type: hardwareType,
        notes: notes
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'A hozzárendelés sikertelen.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <form onSubmit={handleSubmit}>
          <h3>"{item.name}" hozzárendelése</h3>
          <p>Kérjük, válassza ki a célrendszert és adja meg a hardver adatait.</p>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div>
            <label>Célrendszer:</label>
            <select value={selectedSystemId} onChange={e => setSelectedSystemId(e.target.value)}>
              {systems.map(s => (
                <option key={s.systemid} value={s.systemid}>{s.systemname}</option>
              ))}
            </select>
          </div>

          {/* --- ÚJ MEZŐK --- */}
          <div>
            <label>Hardver Típusa:</label>
            <select value={hardwareType} onChange={e => setHardwareType(e.target.value as HardwareType)}>
              {Object.values(HardwareType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Megjegyzés (opcionális):</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button type="submit">Hozzárendelés</button>
          <button type="button" onClick={onClose}>Mégse</button>
        </form>
      </div>
    </div>
  );
}