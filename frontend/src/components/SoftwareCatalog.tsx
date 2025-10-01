// mrmnew/frontend/src/components/SoftwareCatalog.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getSoftwareCatalog, createSoftware, updateSoftware, deleteSoftware } from '../services/api.service';

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
  
  // Átalakítva egyetlen state objektummá
  const [formData, setFormData] = useState({ name: '', version: '' });

  // ÚJ: A szerkesztés alatt álló szoftver ID-jának tárolása
  const [editingId, setEditingId] = useState<number | null>(null);

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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (software: Software) => {
    setEditingId(software.software_id);
    setFormData({ name: software.name, version: software.version || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', version: '' });
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      if (editingId) {
        // Módosítás
        await updateSoftware(editingId, formData);
      } else {
        // Létrehozás
        await createSoftware(formData);
      }
      handleCancelEdit(); // Űrlap ürítése és szerkesztési mód kikapcsolása
      fetchCatalog();
    } catch (err) {
      setError(`A művelet sikertelen: ${err.response?.data?.message || 'Ismeretlen hiba'}`);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törli ezt a szoftvert a katalógusból?')) {
        try {
            await deleteSoftware(id);
            fetchCatalog();
        } catch (err) {
            alert('A törlés sikertelen.');
        }
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Szoftver Katalógus Kezelése</h2>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem' }}>X</button>
        
        <h4>{editingId ? 'Szoftver szerkesztése' : 'Új szoftver felvétele'}</h4>
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Szoftver neve" required />
          <input type="text" name="version" value={formData.version} onChange={handleFormChange} placeholder="Verzió (opcionális)" />
          <button type="submit">{editingId ? 'Mentés' : 'Hozzáadás'}</button>
          {editingId && <button type="button" onClick={handleCancelEdit} style={{marginLeft: '8px'}}>Mégse</button>}
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <hr />
        
        <h4>Katalógus Tartalma</h4>
        <table>
            <thead>
                <tr>
                    <th>Név</th>
                    <th>Verzió</th>
                    <th>Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {catalog.map(sw => (
                    <tr key={sw.software_id}>
                        <td>{sw.name}</td>
                        <td>{sw.version || 'N/A'}</td>
                        <td>
                            <button onClick={() => handleEditClick(sw)} style={{marginRight: '8px'}}>Szerkesztés</button>
                            <button onClick={() => handleDelete(sw.software_id)} style={{backgroundColor: '#dc3545'}}>Törlés</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}