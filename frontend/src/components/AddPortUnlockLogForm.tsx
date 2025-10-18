// mrmnew/frontend/src/components/AddPortUnlockLogForm.tsx

import { useState, useEffect } from 'react';
import { createPortUnlockLog, getSystems, getUsers } from '../services/api.service';
import { UserRole } from '../types';

export function AddPortUnlockLogForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    systemId: '',
    workstation: '',
    pendriveId: '',
    filesToCopy: '',
    unlockTime: new Date().toISOString().slice(0, 16),
    performedById: '',
  });
  const [systems, setSystems] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const systemsRes = await getSystems();
        setSystems(systemsRes.data);

        const usersRes = await getUsers();
        const filteredUsers = usersRes.data.filter(u => u.role === UserRole.RA || u.role === UserRole.ADMIN);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Hiba a legördülő menük adatainak betöltésekor", err);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.systemId || !formData.performedById) {
      setError('Kérjük, válasszon rendszert és végrehajtót!');
      return;
    }

    try {
      // Fontos: Az adatokat számmá alakítjuk küldés előtt, ahogy a backend elvárja
      const payload = {
        ...formData,
        systemId: parseInt(formData.systemId, 10),
        performedById: parseInt(formData.performedById, 10),
      };
      await createPortUnlockLog(payload);
      onSuccess();
    } catch (err) {
      setError('Hiba a bejegyzés mentésekor. Ellenőrizze a konzolt a részletekért.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Új Port Feloldás Rögzítése</h2>
      {error && <p className="error">{error}</p>}

      <label>Rendszer:</label>
      <select name="systemId" value={formData.systemId} onChange={handleChange} required>
        <option value="">Válasszon rendszert</option>
        {/* JAVÍTÁS: A 'key' a helyes 'systemid'-t használja */}
        {systems.map((sys: any) => (
          <option key={sys.systemid} value={sys.systemid}>{sys.systemname}</option>
        ))}
      </select>

      <label>Munkaállomás:</label>
      <input type="text" name="workstation" value={formData.workstation} onChange={handleChange} required />

      <label>Pendrive nyilvántartási száma:</label>
      <input type="text" name="pendriveId" value={formData.pendriveId} onChange={handleChange} required />

      <label>Másolandó fájlok és célmappa:</label>
      <textarea name="filesToCopy" value={formData.filesToCopy} onChange={handleChange} required />

      <label>Feloldás időpontja:</label>
      <input type="datetime-local" name="unlockTime" value={formData.unlockTime} onChange={handleChange} required />

      <label>Végrehajtó (RA):</label>
      <select name="performedById" value={formData.performedById} onChange={handleChange} required>
        <option value="">Válasszon felhasználót</option>
        {/* JAVÍTÁS: A 'key' a helyes 'id'-t használja */}
        {users.map((user: any) => (
          <option key={user.id} value={user.id}>{user.username}</option>
        ))}
      </select>
      
      <button type="submit">Mentés</button>
    </form>
  );
}