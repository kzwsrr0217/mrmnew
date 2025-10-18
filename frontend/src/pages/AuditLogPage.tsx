// mrmnew/frontend/src/pages/AuditLogPage.tsx

import React, { useState, useEffect, Fragment, useCallback } from 'react';
import { getAuditLogs, getAuditFilterOptions } from '../services/api.service';
import { useAuth } from '../auth/AuthContext';
import { UserRole, User } from '../types';
import { formatDateTime } from '../utils/date.utils';

// --- Interfészek (nem változtak) ---
interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: string;
  timestamp: string;
  user: { username: string } | null;
  details: any; // 'any' típust használunk a rugalmasságért
}

interface FilterOptions {
  users: User[];
  actions: string[];
  entities: string[];
}

interface Filters {
  userId: string;
  action: string;
  entity: string;
  dateFrom: string;
  dateTo: string;
}
// ----------------------

// --- ÚJ KOMPONENS: A RÉSZLETEK FORMÁZÁSÁRA ---
const LogDetails: React.FC<{ log: AuditLog }> = ({ log }) => {
  const { action, details } = log;

  // Helper funkció az értékek formázásához (pl. dátumok)
  const formatValue = (value: any): string => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    // Egyszerű dátum detektálás (YYYY-MM-DDTHH:mm:ss.sssZ formátum)
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) {
      return formatDateTime(value);
    }
    if (typeof value === 'object') return JSON.stringify(value); // Objektumokat JSON-ként
    return String(value);
  };

  // Helper a mezőnevek olvashatóbbá tételéhez (opcionális, bővíthető)
  const formatFieldName = (fieldName: string): string => {
      const nameMap: { [key: string]: string } = {
          ticket_id: 'Ticket ID',
          creator: 'Létrehozó',
          assignee: 'Felelős',
          created_at: 'Létrehozva',
          updated_at: 'Módosítva',
          status: 'Státusz',
          priority: 'Prioritás',
          title: 'Cím',
          description: 'Leírás',
          user_id: 'Felhasználó ID',
          username: 'Felhasználónév',
          role: 'Szerepkör',
          // ... további mezőnevek hozzáadása ...
      };
      return nameMap[fieldName] || fieldName; // Ha nincs a térképben, az eredetit adja vissza
  };


  if (!details) {
    return <p>Nincsenek részletek rögzítve.</p>;
  }

  // CREATE művelet
  if (action === 'CREATE' && details.newValues) {
    return (
      <div>
        <strong>Létrehozott adatok:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
          {Object.entries(details.newValues)
           // Kihagyjuk a felesleges/ismétlődő mezőket
           .filter(([key]) => !['created_at', 'updated_at'].includes(key)) 
           .map(([key, value]) => (
            <li key={key}>
              <strong style={{ textTransform: 'capitalize' }}>{formatFieldName(key)}:</strong> {formatValue(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // UPDATE művelet
  if (action === 'UPDATE') {
     const changes = Object.entries(details as { [key: string]: { oldValue: any; newValue: any } });
     if (changes.length === 0) return <p>Nem történt változás.</p>
    return (
      <div>
        <strong>Változások:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
          {changes.map(([key, values]) => (
            <li key={key}>
              <strong style={{ textTransform: 'capitalize' }}>{formatFieldName(key)}:</strong>{' '}
              <span style={{ textDecoration: 'line-through', color: '#dc3545' }}>{formatValue(values.oldValue)}</span>
              {' -> '}
              <span style={{ color: '#28a745', fontWeight: 'bold' }}>{formatValue(values.newValue)}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // DELETE művelet
  if (action === 'DELETE' && details.removedValues) {
    return (
      <div>
        <strong>Törölt adatok:</strong>
        <ul style={{ margin: '0.5rem 0 0 1rem', padding: 0, listStyle: 'none' }}>
          {Object.entries(details.removedValues)
           // Kihagyjuk a felesleges/ismétlődő mezőket
           .filter(([key]) => !['created_at', 'updated_at'].includes(key))
           .map(([key, value]) => (
            <li key={key}>
              <strong style={{ textTransform: 'capitalize' }}>{formatFieldName(key)}:</strong> {formatValue(value)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Ha a formátum ismeretlen, visszaadjuk a nyers JSON-t
  return <pre>{JSON.stringify(details, null, 2)}</pre>;
};
// ----------------------------------------------------


export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ users: [], actions: [], entities: [] });
  const [filters, setFilters] = useState<Filters>({ userId: '', action: '', entity: '', dateFrom: '', dateTo: '' });
  const [submittedFilters, setSubmittedFilters] = useState<Filters>(filters);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      getAuditFilterOptions()
        .then(res => setFilterOptions(res.data))
        .catch(() => setError('Szűrő opciók betöltése sikertelen.'));
    }
  }, [user]);

  const fetchLogs = useCallback(() => {
    if (user?.role !== UserRole.ADMIN) return;
    setLoading(true);
    const params: any = { page: currentPage, limit: itemsPerPage };
    if (submittedFilters.userId) params.userId = submittedFilters.userId;
    if (submittedFilters.action) params.action = submittedFilters.action;
    if (submittedFilters.entity) params.entity = submittedFilters.entity;
    if (submittedFilters.dateFrom) params.dateFrom = submittedFilters.dateFrom;
    if (submittedFilters.dateTo) params.dateTo = submittedFilters.dateTo;

    getAuditLogs(params)
      .then(res => {
        setLogs(res.data.data);
        setTotalPages(Math.ceil(res.data.total / itemsPerPage));
      })
      .catch(() => setError('A naplóbejegyzések betöltése sikertelen.'))
      .finally(() => setLoading(false));
  }, [user, currentPage, itemsPerPage, submittedFilters]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const toggleRow = (id: number) => { setExpandedRowId(currentId => (currentId === id ? null : id)); };
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleFilterSubmit = () => { setCurrentPage(1); setSubmittedFilters(filters); };
  const handleFilterReset = () => {
    const newFilters = { userId: '', action: '', entity: '', dateFrom: '', dateTo: '' };
    setFilters(newFilters);
    if (JSON.stringify(submittedFilters) !== JSON.stringify(newFilters)) { setCurrentPage(1); setSubmittedFilters(newFilters); }
  };
  const handlePageChange = (newPage: number) => { if (newPage > 0 && newPage <= totalPages) { setCurrentPage(newPage); } };
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); };

  if (user?.role !== UserRole.ADMIN) { return <div>Ehhez a funkcióhoz nincs jogosultságod.</div>; }

  return (
    <div>
      <h1>Napló (Audit Log)</h1>
      <p>A rendszerben történt változások keresése és szűrése.</p>
      
      {/* Szűrő Panel (nem változott) */}
      <div className="filter-panel" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', backgroundColor: '#f9f9f9', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <div><label>Felhasználó:</label><select name="userId" value={filters.userId} onChange={handleFilterChange} style={{ width: '100%' }}><option value="">Összes</option>{filterOptions.users.map(u => (<option key={u.id} value={u.id}>{u.username}</option>))}</select></div>
        <div><label>Művelet:</label><select name="action" value={filters.action} onChange={handleFilterChange} style={{ width: '100%' }}><option value="">Összes</option>{filterOptions.actions.map(a => (<option key={a} value={a}>{a}</option>))}</select></div>
        <div><label>Entitás:</label><select name="entity" value={filters.entity} onChange={handleFilterChange} style={{ width: '100%' }}><option value="">Összes</option>{filterOptions.entities.map(e => (<option key={e} value={e}>{e}</option>))}</select></div>
        <div><label>Dátum (tól):</label><input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} style={{ width: '100%' }} /></div>
        <div><label>Dátum (ig):</label><input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} style={{ width: '100%' }} /></div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}><button onClick={handleFilterSubmit} style={{ width: '100%' }}>Szűrés</button><button onClick={handleFilterReset} style={{ width: '100%', backgroundColor: '#6c757d', color: 'white' }}>Törlés</button></div>
      </div>
      
      {/* Lapozó és oldalméret (felül, nem változott) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
        <div><label>Elemek/oldal: </label><select value={itemsPerPage} onChange={handleItemsPerPageChange}><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option></select></div>
        <div style={{ display: 'flex', alignItems: 'center' }}><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Előző</button><span style={{ margin: '0 1rem' }}>Oldal: {currentPage} / {totalPages || 1}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Következő</button></div>
      </div>
      
      {loading && <p>Napló betöltése...</p>}
      {error && !loading && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && logs.length === 0 && (<p>A megadott szűrési feltételekkel nem található naplóbejegyzés.</p>)}
      
      {!loading && !error && logs.length > 0 && (
        <table className="personel-table" style={{marginTop: '1rem'}}>
          <thead>
              <tr><th>Időbélyeg</th><th>Felhasználó</th><th>Művelet</th><th>Entitás</th><th>Részletek</th></tr>
          </thead>
          <tbody>
              {logs.map(log => (
                  <Fragment key={log.id}>
                    <tr>
                        <td>{formatDateTime(log.timestamp)}</td>
                        <td>{log.user?.username || 'Rendszer'}</td>
                        <td>{log.action}</td>
                        <td>{log.entity}</td>
                        <td><button onClick={() => toggleRow(log.id)}>{expandedRowId === log.id ? 'Bezárás' : 'Megtekintés'}</button></td>
                    </tr>
                    {expandedRowId === log.id && (
                        <tr className="details-row">
                            <td colSpan={5}>
                                {/* --- JAVÍTVA: Az új LogDetails komponenst használjuk --- */}
                                <div className="details-content" style={{ display: 'block' /* Egyszerűbb elrendezés a részleteknek */ }}>
                                    <p style={{marginBottom: '0.5rem'}}><strong>Entitás azonosító:</strong> {log.entity_id}</p>
                                    <LogDetails log={log} /> 
                                </div>
                                {/* --------------------------------------------------- */}
                            </td>
                        </tr>
                    )}
                  </Fragment>
              ))}
          </tbody>
        </table>
      )}

      {/* Lapozó (alul, nem változott) */}
      {totalPages > 1 && ( <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}><button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Előző</button><span style={{ margin: '0 1rem' }}>Oldal: {currentPage} / {totalPages || 1}</span><button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Következő</button></div> )}
    </div>
  );
}