// mrmnew/frontend/src/pages/SystemsPage.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getSystems, createSystem } from '../services/api.service';
import { SystemDetail } from '../components/SystemDetail';
import { SoftwareCatalog } from '../components/SoftwareCatalog';
import { formatDate } from '../utils/date.utils'; // <-- ÚJ IMPORT

interface System {
  systemid: number;
  systemname: string;
  description: string;
  status: string;
  permit: {
    engedely_szam: string;
    ervenyesseg_datuma: string;
  } | null;
}

// Segédfüggvény a kártya színének meghatározásához
const getSystemCardClass = (permit: System['permit']): string => {
  if (!permit) return 'status-danger';
  const expiryDate = new Date(permit.ervenyesseg_datuma);
  const today = new Date();
  const threeMonthsFromNow = new Date();
  threeMonthsFromNow.setMonth(today.getMonth() + 3);

  if (expiryDate < today) return 'status-danger';
  if (expiryDate < threeMonthsFromNow) return 'status-warning';
  return 'status-ok';
};

export function SystemsPage() {
  const [systems, setSystems] = useState<System[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [newSystemName, setNewSystemName] = useState('');
  const [newSystemDesc, setNewSystemDesc] = useState('');
  const [showSoftwareCatalog, setShowSoftwareCatalog] = useState(false);

  useEffect(() => {
    const fetchSystems = async () => {
      try {
        const response = await getSystems();
        setSystems(response.data);
      } catch (err) {
        setError('A rendszerek listájának betöltése sikertelen.');
      }
    };
    fetchSystems();
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await createSystem({
        systemname: newSystemName,
        description: newSystemDesc,
      });
      setSystems([...systems, { ...response.data, permit: null }]);
      setNewSystemName('');
      setNewSystemDesc('');
    } catch (err) {
      setError('A rendszer létrehozása sikertelen.');
    }
  };

  if (selectedSystem) {
    return (
      <SystemDetail 
        system={selectedSystem} 
        onBack={() => {
            setSelectedSystem(null);
            getSystems().then(res => setSystems(res.data));
        }}
      />
    );
  }

  return (
    <>
      <h1>Rendszerek Nyilvántartása</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={() => setShowSoftwareCatalog(true)}>Szoftver Katalógus Kezelése</button>

      <div className="form-container" style={{marginTop: '1rem'}}>
        <h2>Új rendszer felvétele</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newSystemName}
            onChange={(e) => setNewSystemName(e.target.value)}
            placeholder="Rendszer neve"
            required
          />
          <input
            type="text"
            value={newSystemDesc}
            onChange={(e) => setNewSystemDesc(e.target.value)}
            placeholder="Rövid leírás"
          />
          <button type="submit">Létrehozás</button>
        </form>
      </div>
      
      <hr />

      <h2>Rendszerek listája</h2>
      <div className="card-grid">
        {systems.map((system) => (
          <div key={system.systemid} className={`card ${getSystemCardClass(system.permit)}`} onClick={() => setSelectedSystem(system)}>
            <h3>{system.systemname}</h3>
            <p><strong>Státusz:</strong> <span className="status-badge">{system.status}</span></p>
            <p><strong>Engedély:</strong> {system.permit?.engedely_szam || 'N/A'}</p>
            {/* JAVÍTVA: A központi formatDate függvényt használjuk */}
            <p><strong>Lejárat:</strong> {formatDate(system.permit?.ervenyesseg_datuma)}</p>
          </div>
        ))}
      </div>

      {showSoftwareCatalog && (
        <SoftwareCatalog onClose={() => setShowSoftwareCatalog(false)} />
      )}
    </>
  );
}

export default SystemsPage;