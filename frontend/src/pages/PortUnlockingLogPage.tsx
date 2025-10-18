// mrmnew/frontend/src/pages/PortUnlockingLogPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { getPortUnlockLogs, approvePortUnlockLog, closePortUnlockLog, getSystems } from '../services/api.service';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';
import { AddPortUnlockLogForm } from '../components/AddPortUnlockLogForm';
import { Modal } from '../components/Modal';

export function PortUnlockingLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [systems, setSystems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Új állapotok a szűréshez és rendezéshez
  const [systemFilter, setSystemFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const { user } = useAuth();

  const canApprove = user && [UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV].includes(user.role as UserRole);
  const canClose = user && [UserRole.ADMIN, UserRole.RA].includes(user.role as UserRole);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [logsResponse, systemsResponse] = await Promise.all([
        getPortUnlockLogs(),
        getSystems(),
      ]);
      setLogs(logsResponse.data);
      setSystems(systemsResponse.data);
    } catch (err) {
      setError('Hiba az adatok betöltése közben.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Szűrt és rendezett logok kiszámítása a 'useMemo' segítségével a jobb teljesítményért
  const displayedLogs = useMemo(() => {
    let filtered = [...logs];

    // 1. Szűrés rendszer alapján
    if (systemFilter) {
      filtered = filtered.filter(log => log.system?.systemid === parseInt(systemFilter, 10));
    }

    // 2. Rendezés időpont alapján
    filtered.sort((a, b) => {
      const dateA = new Date(a.unlockTime).getTime();
      const dateB = new Date(b.unlockTime).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [logs, systemFilter, sortOrder]);

  const handleApprove = async (id) => {
    if (!window.confirm('Biztosan engedélyezi ezt a bejegyzést?')) return;
    try {
      await approvePortUnlockLog(id);
      // Újratöltjük csak a logokat, a rendszereket nem kell
      const logsResponse = await getPortUnlockLogs();
      setLogs(logsResponse.data);
    } catch (err) {
      alert('Hiba az engedélyezés során.');
    }
  };

  const handleClose = async (id) => {
    if (!window.confirm('Biztosan lezárja ezt a port feloldást?')) return;
    try {
      await closePortUnlockLog(id);
      const logsResponse = await getPortUnlockLogs();
      setLogs(logsResponse.data);
    } catch (err) {
      alert('Hiba a lezárás során.');
    }
  };

  return (
    <div className="page-container">
      <h1>Port Feloldási Napló</h1>
      <button onClick={() => setIsModalOpen(true)}>Új bejegyzés</button>

      {isModalOpen && (
        <Modal onClose={() => setIsModalOpen(false)}>
          <AddPortUnlockLogForm 
            onSuccess={() => {
              setIsModalOpen(false);
              fetchInitialData(); // Újratöltünk mindent, ha új bejegyzés jött létre
            }}
          />
        </Modal>
      )}

      {/* Szűrő és rendező vezérlők */}
      <div className="table-controls" style={{ margin: '1rem 0', display: 'flex', gap: '1rem' }}>
        <select value={systemFilter} onChange={(e) => setSystemFilter(e.target.value)}>
          <option value="">Minden rendszer</option>
          {systems.map((sys) => (
            <option key={sys.systemid} value={sys.systemid}>{sys.systemname}</option>
          ))}
        </select>
        <button onClick={() => setSortOrder(order => order === 'desc' ? 'asc' : 'desc')}>
          Rendezés: {sortOrder === 'desc' ? 'Legújabb elöl' : 'Legrégebbi elöl'}
        </button>
      </div>

      {loading && <p>Töltés...</p>}
      {error && <p className="error">{error}</p>}
      
      {/* A 'bordered-table' class hozzáadva a stílusozáshoz */}
      <table className="bordered-table">
        <thead>
          <tr>
            <th>Státusz</th>
            <th>Rendszer</th>
            <th>Munkaállomás</th>
            <th>Kérte (RBF)</th>
            <th>Végrehajtotta (RA)</th>
            <th>Feloldás ideje</th>
            <th>Lezárás ideje</th>
            <th>Engedélyezte</th>
            <th>Műveletek</th>
          </tr>
        </thead>
        <tbody>
          {displayedLogs.map((log: any) => (
            <tr key={log.id}>
              <td>{log.status}</td>
              <td>{log.system?.systemname || 'N/A'}</td>
              <td>{log.workstation}</td>
              <td>{log.requestedBy?.username}</td>
              <td>{log.performedBy?.username}</td>
              <td>{new Date(log.unlockTime).toLocaleString()}</td>
              <td>{log.lockTime ? new Date(log.lockTime).toLocaleString() : 'Nyitva'}</td>
              <td>{log.approvedBy?.username || '-'}</td>
              <td>
                {log.status === 'Függőben' && canApprove && (
                  <button onClick={() => handleApprove(log.id)}>Engedélyez</button>
                )}
                {log.status !== 'Lezárva' && canClose && (
                  <button onClick={() => handleClose(log.id)}>Lezárás</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}