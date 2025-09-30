// mrmnew/frontend/src/pages/LocationsPage.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../services/api.service';
import { Location } from '../types';

export function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    zip_code: '',
    city: '',
    address: '',
    building: '',
    room: '',
  });

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLocations();
      setLocations(res.data);
    } catch (err) {
      setError('A helyszínek lekérése sikertelen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const openModalForCreate = () => {
    setEditingLocation(null);
    setFormData({ zip_code: '', city: '', address: '', building: '', room: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      zip_code: location.zip_code,
      city: location.city,
      address: location.address,
      building: location.building || '', // Biztosítjuk, hogy ne legyen null
      room: location.room,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // JAVÍTÁS: A 'full_address' generálását kivettük, a backend kezeli.
    const payload = formData;

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, payload);
      } else {
        await createLocation(payload);
      }
      closeModal();
      fetchLocations();
    } catch (err: any) {
      alert(`Hiba történt: ${err.response?.data?.message || 'Ismeretlen hiba'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törli ezt a helyszínt? A hozzá rendelt hardverek helyszín nélkül maradnak.')) {
      try {
        await deleteLocation(id);
        fetchLocations();
      } catch (err) {
        alert('A törlés sikertelen.');
      }
    }
  };

  if (loading) return <p>Betöltés...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Helyszínek Kezelése</h1>
        <button onClick={openModalForCreate}>+ Új helyszín</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Teljes cím</th>
            <th>Irányítószám</th>
            <th>Város</th>
            <th>Épület/Helyiség</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {locations.map(loc => (
            <tr key={loc.id}>
              <td>{loc.full_address}</td>
              <td>{loc.zip_code}</td>
              <td>{loc.city}</td>
              <td>{`${loc.building || ''} ${loc.room}`}</td>
              <td>
                <button onClick={() => openModalForEdit(loc)} style={{ marginRight: '8px' }}>Szerkesztés</button>
                <button onClick={() => handleDelete(loc.id)} style={{ backgroundColor: '#dc3545' }}>Törlés</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{editingLocation ? 'Helyszín szerkesztése' : 'Új helyszín'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Irányítószám *</label><input name="zip_code" value={formData.zip_code} onChange={handleFormChange} required />
                <label>Város *</label><input name="city" value={formData.city} onChange={handleFormChange} required />
                <label>Cím *</label><input name="address" value={formData.address} onChange={handleFormChange} required />
                <label>Épület</label><input name="building" value={formData.building} onChange={handleFormChange} />
                <label>Helyiség *</label><input name="room" value={formData.room} onChange={handleFormChange} required />
              </div>
              <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button type="button" onClick={closeModal} style={{ marginRight: '8px' }}>Mégse</button>
                <button type="submit">Mentés</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}