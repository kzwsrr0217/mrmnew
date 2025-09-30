// mrmnew/frontend/src/pages/ClassificationsPage.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getClassifications, createClassification, updateClassification, deleteClassification } from '../services/api.service';
import { Classification } from '../types';

export function ClassificationsPage() {
  const [classifications, setClassifications] = useState<Classification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Classification | null>(null);
  const [formData, setFormData] = useState({
    type: 'NEMZETI' as 'NEMZETI' | 'NATO' | 'EU',
    level_name: '',
    rank: 10,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClassifications();
      setClassifications(res.data);
    } catch (err) {
      setError('A minősítési szintek lekérése sikertelen.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModalForCreate = () => {
    setEditing(null);
    setFormData({ type: 'NEMZETI', level_name: '', rank: 10 });
    setIsModalOpen(true);
  };

  const openModalForEdit = (item: Classification) => {
    setEditing(item);
    setFormData({
      type: item.type,
      level_name: item.level_name,
      rank: item.rank,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const val = name === 'rank' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateClassification(editing.id, formData);
      } else {
        await createClassification(formData);
      }
      closeModal();
      fetchData();
    } catch (err: any) {
      alert(`Hiba történt: ${err.response?.data?.message || 'Ismeretlen hiba'}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Biztosan törli ezt a minősítési szintet?')) {
      try {
        await deleteClassification(id);
        fetchData();
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
        <h1>Minősítési Szintek Kezelése</h1>
        <button onClick={openModalForCreate}>+ Új szint</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Típus</th>
            <th>Megnevezés</th>
            <th>Erősség (Rank)</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {classifications.map(c => (
            <tr key={c.id}>
              <td>{c.type}</td>
              <td>{c.level_name}</td>
              <td>{c.rank}</td>
              <td>
                <button onClick={() => openModalForEdit(c)} style={{ marginRight: '8px' }}>Szerkesztés</button>
                <button onClick={() => handleDelete(c.id)} style={{ backgroundColor: '#dc3545' }}>Törlés</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{editing ? 'Szint szerkesztése' : 'Új szint'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>Típus *</label>
                <select name="type" value={formData.type} onChange={handleFormChange}>
                  <option value="NEMZETI">NEMZETI</option>
                  <option value="NATO">NATO</option>
                  <option value="EU">EU</option>
                </select>
                <label>Megnevezés *</label>
                <input name="level_name" value={formData.level_name} onChange={handleFormChange} required />
                <label>Erősség (Rank) *</label>
                <input type="number" name="rank" value={formData.rank} onChange={handleFormChange} required />
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