import { useState, useEffect } from 'react';
import { getDashboardWidgets } from '../services/api.service';
import { Link } from 'react-router-dom';

// Stílusok a panelekhez
const widgetGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
};
const widgetStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};
const widgetTitleStyle: React.CSSProperties = { marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '0.5rem' };
const statNumberStyle: React.CSSProperties = { fontSize: '2.5rem', fontWeight: 'bold', textAlign: 'center', color: '#1a2a44' };

export function AdminDashboardPage() {
    const [widgetsData, setWidgetsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getDashboardWidgets();
                setWidgetsData(res.data);
            } catch (error) {
                console.error("Hiba a műszerfal adatok betöltése közben:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="page-container"><h1>Műszerfal betöltése...</h1></div>;
    }

    if (!widgetsData) {
        return <div className="page-container"><h1>Hiba a műszerfal adatok betöltése közben.</h1></div>;
    }

    const { actionItems, warnings, activity } = widgetsData;

    return (
        <div className="page-container">
            <h1>Adminisztrációs Műszerfal</h1>
            <div style={widgetGridStyle}>
                
                {/* AKCIÓRA VÁRÓ FELADATOK */}
                <Link to="/port-unlocking-log" style={{textDecoration: 'none', color: 'inherit'}}>
                    <div style={widgetStyle}>
                        <h3 style={widgetTitleStyle}>Jóváhagyásra váró port feloldások</h3>
                        <p style={statNumberStyle}>{actionItems.pendingPortUnlocks}</p>
                    </div>
                </Link>
                <Link to="/pending-requests" style={{textDecoration: 'none', color: 'inherit'}}>
                    <div style={widgetStyle}>
                        <h3 style={widgetTitleStyle}>Függőben lévő hozzáférések</h3>
                        <p style={statNumberStyle}>{actionItems.pendingAccessRequests}</p>
                    </div>
                </Link>

                {/* FIGYELMEZTETÉSEK */}
                 <Link to="/reports" style={{textDecoration: 'none', color: 'inherit'}}>
                    <div style={{...widgetStyle, backgroundColor: '#fffbe6'}}>
                        <h3 style={widgetTitleStyle}>Lejáró tanúsítványok (30 nap)</h3>
                        <p style={statNumberStyle}>{warnings.expiringCertificatesCount}</p>
                    </div>
                </Link>
                 <Link to="/reports" style={{textDecoration: 'none', color: 'inherit'}}>
                    <div style={{...widgetStyle, backgroundColor: '#fffbe6'}}>
                        <h3 style={widgetTitleStyle}>Lejáró engedélyek (60 nap)</h3>
                        <p style={statNumberStyle}>{warnings.expiringPermitsCount}</p>
                    </div>
                </Link>

                {/* MAGAS PRIORITÁSÚ HIBALJGYEK */}
                <div style={widgetStyle}>
                    <h3 style={widgetTitleStyle}>Nyitott, magas prioritású hibajegyek</h3>
                    {actionItems.highPriorityTickets.length > 0 ? (
                        <ul>
                            {actionItems.highPriorityTickets.map((ticket: any) => (
                                <li key={ticket.id}><Link to={`/tickets/${ticket.id}`}>{ticket.title}</Link></li>
                            ))}
                        </ul>
                    ) : <p>Nincsenek ilyen hibajegyek.</p>}
                </div>
                
                {/* RENDSZER STÁTUSZOK */}
                <div style={widgetStyle}>
                     <h3 style={widgetTitleStyle}>Rendszer Státuszok</h3>
                     {warnings.systemStatusDistribution.map((status: any) => (
                         <div key={status.status} style={{display: 'flex', justifyContent: 'space-between'}}>
                             <span>{status.status}:</span>
                             <strong>{status.count} db</strong>
                         </div>
                     ))}
                </div>

                {/* LEGUTÓBBI AKTIVITÁS */}
                 <div style={widgetStyle}>
                    <h3 style={widgetTitleStyle}>Legutóbbi Aktivitás</h3>
                    {activity.recentAuditLogs.map((log: any) => (
                        <p key={log.id} style={{fontSize: '0.9rem', margin: '0.5rem 0'}}>
                            <strong>{new Date(log.timestamp).toLocaleString()}:</strong> {log.message}
                        </p>
                    ))}
                     <Link to="/audit">Teljes napló...</Link>
                </div>
            </div>
        </div>
    );
}