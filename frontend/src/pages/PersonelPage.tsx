// mrmnew/frontend/src/pages/PersonelPage.tsx

import { useState, useEffect, Fragment } from 'react';
import { getPersonel, deletePersonel } from '../services/api.service';
import { AddPersonelForm } from '../components/AddPersonelForm';
import { EditPersonelForm } from '../components/EditPersonelForm';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';
import { useTableControls } from '../hooks/useTableControls';
import { formatDate } from '../utils/date.utils';

interface Personel {
  personel_id: number;
  nev: string;
  personal_security_data: {
    beosztas: string | null;
    rendfokozat: string | null;
    titoktartasi_szam: string | null;
    szbt_datum: Date | null;
    szbt_lejarat: Date | null;
    nato_datum: Date | null;
    nato_lejarat: Date | null;
    eu_datum: Date | null;
    eu_lejarat: Date | null;
    nemzeti_szint: { classification_id: number, level_name: string } | null;
    nato_szint: { classification_id: number, level_name: string } | null;
    eu_szint: { classification_id: number, level_name: string } | null;
  };
}

const getPersonelRowStatus = (psd: Personel['personal_security_data']): string => {
    if (!psd) return '';
    const today = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    const expiryDates = [
        psd.szbt_lejarat,
        psd.nato_lejarat,
        psd.eu_lejarat
    ].filter(Boolean).map(d => new Date(d!));

    if (expiryDates.some(d => d < today)) return 'row-danger';
    if (expiryDates.some(d => d < sixMonthsFromNow)) return 'row-warning';
    return '';
};

export function PersonelPage() {
  const { user } = useAuth();
  const [personel, setPersonel] = useState<Personel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPersonel, setEditingPersonel] = useState<Personel | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const canModify = user?.role === UserRole.ADMIN || user?.role === UserRole.SZBF;

  const {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
    requestSort,
    sortConfig,
  } = useTableControls({
    data: personel,
    filterFn: (p, term) => p.nev.toLowerCase().includes(term.toLowerCase()),
  });

  const fetchPersonel = () => {
    setLoading(true);
    getPersonel()
      .then(res => setPersonel(res.data))
      .catch(() => setError('A személyi állomány betöltése sikertelen.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPersonel(); }, []);

  const handlePersonelChange = () => {
    setShowAddForm(false);
    setEditingPersonel(null);
    fetchPersonel();
  };

  const handleDelete = async (personelId: number) => {
    if (window.confirm('Biztosan törli ezt a személyt?')) {
        try {
            await deletePersonel(personelId);
            fetchPersonel();
        } catch (err) {
            alert('A törlés sikertelen.');
        }
    }
  }
  
  const toggleRow = (id: number) => {
    setExpandedRowId(currentId => (currentId === id ? null : id));
  };

  const getSortIcon = (key: keyof Personel) => {
    if (!sortConfig || sortConfig.key !== key) return <span className="sort-icon">↕️</span>;
    return sortConfig.direction === 'ascending' ? <span className="sort-icon">🔼</span> : <span className="sort-icon">🔽</span>;
  };

  if (loading) return <p>Személyi állomány betöltése...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Személyi állomány</h1>
        {canModify && (<button onClick={() => setShowAddForm(true)}>Új személy felvétele</button>)}
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
        <input type="text" placeholder="Keresés név alapján..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} style={{ width: '300px' }} />
        <div>
            <label>Elemek/oldal: </label>
            <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}>
                <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
            </select>
        </div>
      </div>

      <div className="table-container">
        <table className="personel-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => requestSort('nev')}>Név {getSortIcon('nev')}</th>
              <th>Rendfokozat</th>
              <th>Beosztás</th>
              <th style={{width: '250px'}}>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(p => (
              <Fragment key={p.personel_id}>
                <tr className={getPersonelRowStatus(p.personal_security_data)}>
                  <td>{p.nev}</td>
                  <td>{p.personal_security_data?.rendfokozat || 'N/A'}</td>
                  <td>{p.personal_security_data?.beosztas || 'N/A'}</td>
                  <td>
                    <button onClick={() => toggleRow(p.personel_id)}>{expandedRowId === p.personel_id ? 'Bezár' : 'Részletek'}</button>
                    {canModify && <button onClick={() => setEditingPersonel(p)} style={{marginLeft: '0.5rem'}}>Szerkesztés</button>}
                    {canModify && <button onClick={() => handleDelete(p.personel_id)} style={{marginLeft: '0.5rem', color: 'red'}}>Törlés</button>}
                  </td>
                </tr>
                {expandedRowId === p.personel_id && (
                  <tr className="details-row">
                    <td colSpan={4}>
                      <div className="details-content">
                        <div><h4>Alap adatok</h4><p><strong>Titoktartási nyilatkozat:</strong> {p.personal_security_data?.titoktartasi_szam || 'N/A'}</p></div>
                        <div><h4>Nemzeti Tanúsítvány</h4><p><strong>Szint:</strong> {p.personal_security_data?.nemzeti_szint?.level_name || '-'}</p><p><strong>Kelte:</strong> {formatDate(p.personal_security_data.szbt_datum)}</p><p><strong>Lejárata:</strong> {formatDate(p.personal_security_data.szbt_lejarat)}</p></div>
                        <div><h4>NATO Tanúsítvány</h4><p><strong>Szint:</strong> {p.personal_security_data?.nato_szint?.level_name || '-'}</p><p><strong>Kelte:</strong> {formatDate(p.personal_security_data.nato_datum)}</p><p><strong>Lejárata:</strong> {formatDate(p.personal_security_data.nato_lejarat)}</p></div>
                        <div><h4>EU Tanúsítvány</h4><p><strong>Szint:</strong> {p.personal_security_data?.eu_szint?.level_name || '-'}</p><p><strong>Kelte:</strong> {formatDate(p.personal_security_data.eu_datum)}</p><p><strong>Lejárata:</strong> {formatDate(p.personal_security_data.eu_lejarat)}</p></div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>Előző</button>
          <span style={{ margin: '0 1rem' }}>Oldal: {currentPage} / {totalPages || 1}</span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Következő</button>
      </div>

      {showAddForm && (<AddPersonelForm onPersonelAdded={handlePersonelChange} onCancel={() => setShowAddForm(false)} />)}
      {editingPersonel && (<EditPersonelForm personel={editingPersonel} onPersonelUpdated={handlePersonelChange} onCancel={() => setEditingPersonel(null)} />)}
    </div>
  );
}