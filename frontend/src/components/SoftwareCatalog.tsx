// frontend/src/components/SoftwareCatalog.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getSoftwareCatalog, createSoftware } from '../services/api.service';

interface Software {
  software_id: number;
  name: string;
  version: string;
}

interface SoftwareCatalogProps {
  onClose: () => void;
}

export function SoftwareCatalog({ onClose }: SoftwareCatalogProps) {
  const [catalog, setCatalog] = useState<Software[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');

  const fetchCatalog = async () => {
    try {
      const res = await getSoftwareCatalog();
      setCatalog(res.data);
    } catch (err) {
      setError('A szoftverkatalógus betöltése sikertelen.');
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await createSoftware({ name, version });
      setName('');
      setVersion('');
      fetchCatalog(); // Sikeres létrehozás után frissítjük a listát
    } catch (err) {
      setError('A szoftver létrehozása sikertelen.');
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Szoftver Katalógus Kezelése</h2>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>X</button>
        
        <h4>Új szoftver felvétele</h4>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Szoftver neve"
            required
          />
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="Verzió (opcionális)"
          />
          <button type="submit">Hozzáadás</button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <hr />
        
        <h4>Katalógus Tartalma</h4>
        <ul>
          {catalog.map(sw => (
            <li key={sw.software_id}>
              {sw.name} ({sw.version || 'N/A'})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}