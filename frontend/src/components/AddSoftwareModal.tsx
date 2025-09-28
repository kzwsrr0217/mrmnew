// frontend/src/components/AddSoftwareModal.tsx

import { useState, useEffect } from 'react';
import { getSoftwareCatalog, addSoftwareToHardware } from '../services/api.service';

interface Software {
  software_id: number;
  name: string;
  version: string;
}

interface AddSoftwareModalProps {
  hardwareId: number;
  onClose: () => void; // Függvény a modális bezárásához
}

export function AddSoftwareModal({ hardwareId, onClose }: AddSoftwareModalProps) {
  const [softwareCatalog, setSoftwareCatalog] = useState<Software[]>([]);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Töltsük be a választható szoftverek listáját
    getSoftwareCatalog()
      .then(res => {
        setSoftwareCatalog(res.data);
        if (res.data.length > 0) {
          setSelectedSoftwareId(String(res.data[0].software_id));
        }
      })
      .catch(() => setError('A szoftverkatalógus betöltése sikertelen.'));
  }, []);

  const handleSubmit = async () => {
    if (!selectedSoftwareId) {
      setError('Válasszon egy szoftvert!');
      return;
    }
    try {
      await addSoftwareToHardware(hardwareId, Number(selectedSoftwareId));
      onClose(); // Sikeres hozzáadás után bezárjuk az ablakot
    } catch (err) {
      setError('Hiba a szoftver hozzárendelése közben.');
      console.error(err);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Szoftver hozzárendelése</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <select value={selectedSoftwareId} onChange={(e) => setSelectedSoftwareId(e.target.value)}>
          {softwareCatalog.map(sw => (
            <option key={sw.software_id} value={sw.software_id}>
              {sw.name} ({sw.version || 'N/A'})
            </option>
          ))}
        </select>
        <div>
          <button onClick={handleSubmit}>Hozzárendelés</button>
          <button onClick={onClose}>Mégse</button>
        </div>
      </div>
    </div>
  );
}