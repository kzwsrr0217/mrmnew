// mrmnew/frontend/src/pages/AdminDashboardPage.tsx

import { useState, useEffect } from 'react';
import { getDashboardStats, runSeeder } from '../services/api.service';

interface Stats {
  userCount: number;
  systemCount: number;
  totalTickets: number;
  openTickets: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleRunSeeder = async () => {
    if (!window.confirm('Biztosan újra akarja futtatni a tesztadat-feltöltőt? Ez duplikálhatja az adatokat, ha az adatbázis nem üres.')) return;
    try {
        await runSeeder();
        alert('A tesztadat-feltöltő sikeresen lefutott.');
        window.location.reload(); // Oldal újratöltése az új adatokért
    } catch(err) {
        alert('A feltöltő futtatása sikertelen.');
    }
  }

  return (
    <div>
      <h1>Adminisztrátori Műszerfal</h1>

      <h3>Rendszerstatisztikák</h3>
      {loading && <p>Statisztikák betöltése...</p>}
      {stats && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <StatCard title="Regisztrált felhasználók" value={stats.userCount} />
            <StatCard title="Nyilvántartott rendszerek" value={stats.systemCount} />
            <StatCard title="Összes feladat" value={stats.totalTickets} />
            <StatCard title="Nyitott feladatok" value={stats.openTickets} />
        </div>
      )}

      <hr style={{ margin: '2rem 0' }}/>

      <h3>Veszélyes Zóna</h3>
      <p>Ezek a műveletek a rendszer működését befolyásolhatják.</p>
      <button onClick={handleRunSeeder} style={{ backgroundColor: '#dc3545', color: 'white' }}>
        Tesztadat-feltöltő Újrafuttatása
      </button>
    </div>
  );
}

// Egy egyszerű segédkomponens a statisztikák megjelenítéséhez
function StatCard({ title, value }: { title: string, value: number }) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', minWidth: '200px', textAlign: 'center' }}>
            <h4 style={{ margin: 0 }}>{title}</h4>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{value}</p>
        </div>
    )
}