// mrmnew/frontend/src/pages/DataHandlingPermitsPage.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getPermits, createPermit, updatePermit, deletePermit, getLocations, getClassifications, uploadPermitFile } from '../services/api.service';
import { DataHandlingPermit, Location, Classification, SecurityClass } from '../types';

export function DataHandlingPermitsPage() {
  const [permits, setPermits] = useState<DataHandlingPermit[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [classifications, setClassifications] = useState<Classification[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermit, setEditingPermit] = useState<DataHandlingPermit | null>(null);
  
  const initialFormData = {
    registration_number: '',
    security_class: SecurityClass.SECOND_CLASS,
    locationId: '',
    classification_level_ids: [] as number[],
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormData);
  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [permitsRes, locationsRes, classificationsRes] = await Promise.all([
        getPermits(), getLocations(), getClassifications(),
      ]);
      setPermits(permitsRes.data);
      setLocations(locationsRes.data);
      setClassifications(classificationsRes.data);
    } catch (err) {
      setError('Az adatok lekérése sikertelen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModalForCreate = () => {
    setEditingPermit(null);
    setFormData(initialFormData);
    setFile(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (permit: DataHandlingPermit) => {
    setEditingPermit(permit);
    setFormData({
      registration_number: permit.registration_number,
      security_class: permit.security_class,
      locationId: permit.location.id.toString(),
      classification_level_ids: permit.classification_levels.map(c => c.id),
      notes: permit.notes || '',
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(e.target.selectedOptions, option => Number(option.value));
    setFormData(prev => ({...prev, classification_level_ids: values}));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      locationId: Number(formData.locationId)
    };
    
    try {
      let savedPermit: DataHandlingPermit;
      if (editingPermit) {
        const res = await updatePermit(editingPermit.id, payload);
        savedPermit = res.data;
      } else {
        const res = await createPermit(payload);
        savedPermit = res.data;
      }

      if (file && savedPermit.id) {
        const fileData = new FormData();
        fileData.append('file', file);
        await uploadPermitFile(savedPermit.id, fileData);
      }
      
      closeModal();
      fetchData();
    } catch (err: any) {
      alert(`Hiba történt: ${err.response?.data?.message || 'Ismeretlen hiba'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törli ezt az engedélyt?')) {
      try {
        await deletePermit(id);
        fetchData();
      } catch (err) {
        alert('A törlés sikertelen.');
      }
    }
  };

  const availableLocations = locations.filter(loc => 
      !permits.some(p => p.location.id === loc.id) || 
      (editingPermit && editingPermit.location.id === loc.id)
  );

  if (loading) return <p>Betöltés...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Adatkezelési Engedélyek</h1>
        <button onClick={openModalForCreate}>+ Új engedély</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Nyilv. szám</th>
            <th>Helyszín</th>
            <th>Biztonsági osztály</th>
            <th>Minősítési szintek</th>
            <th>Dokumentum</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {permits.map(permit => (
            <tr key={permit.id}>
              <td>{permit.registration_number}</td>
              <td>{permit.location?.full_address || 'N/A'}</td>
              <td>{permit.security_class}</td>
              <td>{permit.classification_levels.map(c => c.level_name).join(', ')}</td>
              <td>
                {permit.original_filename && (
                  <a href={`http://localhost:3000/data-handling-permits/${permit.id}/download`} target="_blank" rel="noopener noreferrer">
                    Letöltés
                  </a>
                )}
              </td>
              <td>
                <button onClick={() => openModalForEdit(permit)} style={{ marginRight: '8px' }}>Szerkesztés</button>
                <button onClick={() => handleDelete(permit.id)} style={{ backgroundColor: '#dc3545' }}>Törlés</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{maxWidth: '600px'}}>
            <h2>{editingPermit ? 'Engedély szerkesztése' : 'Új engedély'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Nyilv. szám *</label><input name="registration_number" value={formData.registration_number} onChange={handleFormChange} required />
                <label>Biztonsági osztály *</label>
                <select name="security_class" value={formData.security_class} onChange={handleFormChange}>
                  <option value={SecurityClass.FIRST_CLASS}>Első Osztály</option>
                  <option value={SecurityClass.SECOND_CLASS}>Másod Osztály</option>
                </select>
                
                <label>Helyszín *</label>
                <select name="locationId" value={formData.locationId} onChange={handleFormChange} required>
                  <option value="">-- Válasszon egy szabad helyszínt --</option>
                  {availableLocations.map(loc => <option key={loc.id} value={loc.id}>{loc.full_address}</option>)}
                </select>

                <label>Minősítési szintek</label>
                <select name="classification_level_ids" value={formData.classification_level_ids.map(String)} onChange={handleMultiSelectChange} multiple style={{height: '150px'}}>
                  {classifications.map(c => <option key={c.id} value={c.id}>{`${c.type} - ${c.level_name}`}</option>)}
                </select>
                
                <label>Megjegyzés</label><textarea name="notes" value={formData.notes} onChange={handleFormChange} />
                <label>Engedély (PDF)</label><input type="file" name="file" onChange={handleFileChange} accept="application/pdf" />
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