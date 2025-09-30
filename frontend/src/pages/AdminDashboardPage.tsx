// mrmnew/frontend/src/pages/AdminDashboardPage.tsx

import { useState, useEffect } from 'react';
import { getDashboardStats, runSeeder, getTicketsByStatus } from '../services/api.service';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TicketStatus } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Stats {
  userCount: number;
  systemCount: number;
  totalTickets: number;
  openTickets: number;
}

interface TicketStatusData {
    status: TicketStatus;
    count: number;
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [ticketStatusData, setTicketStatusData] = useState<TicketStatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
        getDashboardStats(),
        getTicketsByStatus()
    ])
    .then(([statsRes, ticketsRes]) => {
        setStats(statsRes.data);
        setTicketStatusData(ticketsRes.data);
    })
    .catch(err => console.error("Hiba a műszerfal adatok lekérésekor:", err))
    .finally(() => setLoading(false));
  }, []);

  const handleRunSeeder = async () => {
    if (!window.confirm('Biztosan újra akarja futtatni a tesztadat-feltöltőt?')) return;
    try {
      await runSeeder();
      alert('A tesztadat-feltöltő sikeresen lefutott.');
      window.location.reload();
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
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <StatCard title="Regisztrált felhasználók" value={stats.userCount} />
          <StatCard title="Nyilvántartott rendszerek" value={stats.systemCount} />
          <StatCard title="Összes feladat" value={stats.totalTickets} />
          <StatCard title="Nyitott feladatok" value={stats.openTickets} />
        </div>
      )}

      <h3>Vizuális Jelentések</h3>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* --- JAVÍTOTT GRAFIKON KONTÉNER --- */}
        <div style={{
            width: '400px',
            height: '400px',
            padding: '1rem',
            border: '1px solid #ccc',
            borderRadius: '8px',
            display: 'flex', // Flexbox konténer
            flexDirection: 'column' // Függőleges elrendezés
        }}>
            <h4 style={{ flexShrink: 0 }}>Feladatok állapot szerint</h4> {/* Cím, ami nem zsugorodik */}
            {ticketStatusData.length > 0 ? (
                <TicketsByStatusChart data={ticketStatusData} />
            ) : (
                !loading && <p>Nincs adat a grafikonhoz.</p>
            )}
        </div>
        {/* Ide jöhetnek majd a további grafikonok... */}
      </div>

      <hr style={{ margin: '2rem 0' }}/>

      <h3>Veszélyes Zóna</h3>
      <p>Ezek a műveletek a rendszer működését befolyásolhatják.</p>
      <button onClick={handleRunSeeder} style={{ backgroundColor: '#dc3545', color: 'white' }}>
        Tesztadat-feltöltő Újrafuttatása
      </button>
    </div>
  );
}

// --- VÉGLEGES, JAVÍTOTT GRAFIKON KOMPONENS ---
function TicketsByStatusChart({ data }: { data: TicketStatusData[] }) {
    const chartData = {
        labels: data.map(d => d.status),
        datasets: [{
            label: 'Feladatok száma',
            data: data.map(d => d.count),
            backgroundColor: [
                'rgba(54, 162, 235, 0.7)',
                'rgba(255, 206, 86, 0.7)',
                'rgba(75, 192, 192, 0.7)',
                'rgba(255, 99, 132, 0.7)',
            ],
            borderColor: ['#fff'],
            borderWidth: 2,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    // Ez a div most már a flexbox-on belül a maradék helyet fogja kitölteni
    return (
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
            <Doughnut data={chartData} options={options} />
        </div>
    );
}

// A StatCard segédkomponens változatlan
function StatCard({ title, value }: { title: string, value: number }) {
    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', minWidth: '200px', textAlign: 'center' }}>
            <h4 style={{ margin: 0 }}>{title}</h4>
            <p style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{value}</p>
        </div>
    )
}