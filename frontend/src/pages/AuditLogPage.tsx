// mrmnew/frontend/src/pages/AuditLogPage.tsx

import { useState, useEffect, Fragment } from 'react'; // Fragment importálása
import { getAuditLogs } from '../services/api.service';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';
import { useTableControls } from '../hooks/useTableControls'; // A hook importálása
import { formatDateTime } from '../utils/date.utils';

interface AuditLog {
  id: number;
  action: string;
  entity: string;
  entity_id: string;
  timestamp: string;
  user: { username: string } | null;
  details: object;
}

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // --- ÚJ RÉSZ: A KIBONTOTT SOR AZONOSÍTÓJÁNAK TÁROLÁSA ---
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  // --- A useTableControls HOOK HASZNÁLATA ---
  const {
    paginatedData,
    totalPages,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    handleItemsPerPageChange,
    searchTerm,
    handleSearchChange,
  } = useTableControls({
    data: logs,
    // A keresőfüggvény, ami több mezőben is keres
    filterFn: (log, term) => {
        const lowerCaseTerm = term.toLowerCase();
        return (
            log.user?.username.toLowerCase().includes(lowerCaseTerm) ||
            log.action.toLowerCase().includes(lowerCaseTerm) ||
            log.entity.toLowerCase().includes(lowerCaseTerm)
        );
    }
  });

  useEffect(() => {
    if (user?.role === UserRole.ADMIN) {
      setLoading(true);
      getAuditLogs()
        .then(res => setLogs(res.data))
        .catch(() => setError('A naplóbejegyzések betöltése sikertelen.'))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const toggleRow = (id: number) => {
    setExpandedRowId(currentId => (currentId === id ? null : id));
  };

  if (user?.role !== UserRole.ADMIN) {
    return <div>Ehhez a funkcióhoz nincs jogosultságod.</div>;
  }

  if (loading) return <p>Napló betöltése...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h1>Napló (Audit Log)</h1>
      <p>A rendszerben történt legutóbbi változások.</p>
      
      {/* --- VEZÉRLŐELEMEK --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0' }}>
        <input
            type="text"
            placeholder="Keresés (felhasználó, művelet, entitás)..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ width: '300px' }}
        />
        <div>
            <label>Elemek/oldal: </label>
            <select value={itemsPerPage} onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
            </select>
        </div>
      </div>
      
      <table className="personel-table" style={{marginTop: '1rem'}}>
          <thead>
              <tr>
                  <th>Időbélyeg</th>
                  <th>Felhasználó</th>
                  <th>Művelet</th>
                  <th>Entitás</th>
                  <th>Részletek</th>
              </tr>
          </thead>
          <tbody>
              {paginatedData.map(log => (
                  <Fragment key={log.id}>
                    <tr>
                        <td>{formatDateTime(log.timestamp)}</td>
                        <td>{log.user?.username || 'Rendszer'}</td>
                        <td>{log.action}</td>
                        <td>{log.entity}</td>
                        <td>
                            <button onClick={() => toggleRow(log.id)}>
                                {expandedRowId === log.id ? 'Bezárás' : 'Megtekintés'}
                            </button>
                        </td>
                    </tr>
                    {/* A KIBONTHATÓ RÉSZLETEK SOR */}
                    {expandedRowId === log.id && (
                        <tr className="details-row">
                            <td colSpan={5}>
                                <div className="details-content">
                                    <strong>Entitás azonosító:</strong> {log.entity_id}
                                    <pre>{JSON.stringify(log.details, null, 2)}</pre>
                                </div>
                            </td>
                        </tr>
                    )}
                  </Fragment>
              ))}
          </tbody>
      </table>

      {/* --- LAPOZÓ VEZÉRLŐK --- */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '1rem' }}>
          <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
              Előző
          </button>
          <span style={{ margin: '0 1rem' }}>
              Oldal: {currentPage} / {totalPages || 1}
          </span>
          <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
              Következő
          </button>
      </div>
    </div>
  );
}