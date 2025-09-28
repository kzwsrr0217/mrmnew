import { useState, useEffect } from 'react';
import { getMaintenanceLogs } from '../services/api.service';
import { AddMaintenanceLogForm } from '../components/AddMaintenanceLogForm';
import { useAuth } from '../auth/AuthContext';
import { UserRole } from '../types';
import { formatDateTime } from '../utils/date.utils';

interface MaintenanceLog {
  log_id: number;
  description: string;
  timestamp: string;
  user: { username: string };
  system: { systemname: string };
}

export function MaintenancePage() {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { user } = useAuth();
  
  const canAdd = user?.role === UserRole.ADMIN || user?.role === UserRole.RA;

  const fetchLogs = () => {
    setLoading(true);
    getMaintenanceLogs()
      .then(res => setLogs(res.data))
      .catch(() => setError('A napló betöltése sikertelen.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleLogAdded = () => {
    setShowAddForm(false);
    fetchLogs();
  };

  if (loading) return <p>Karbantartási napló betöltése...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Karbantartási napló</h1>
        {canAdd && (
          <button onClick={() => setShowAddForm(true)}>Új bejegyzés</button>
        )}
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table className="personel-table" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Időpont</th>
            <th>Rendszer</th>
            <th>Felhasználó</th>
            <th>Leírás</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.log_id}>
              <td>{formatDateTime(log.timestamp)}</td>
              <td>{log.system.systemname}</td>
              <td>{log.user.username}</td>
              <td style={{ whiteSpace: 'pre-wrap' }}>{log.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showAddForm && (
        <AddMaintenanceLogForm onLogAdded={handleLogAdded} onCancel={() => setShowAddForm(false)} />
      )}
    </div>
  );
}