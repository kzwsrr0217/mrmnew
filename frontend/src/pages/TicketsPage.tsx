// mrmnew/frontend/src/pages/TicketsPage.tsx

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTickets } from '../services/api.service';
import { AddTicketForm } from '../components/AddTicketForm';
import { TicketStatus, TicketPriority } from '../types';
import { formatDateTime } from '../utils/date.utils';

interface Ticket {
  ticket_id: number;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  creator: { username: string } | null;
  assignee: { username: string } | null;
  created_at: string;
}

// Segédfüggvény a prioritás alapján adott CSS osztályhoz
const getPriorityClass = (priority: TicketPriority) => {
    switch(priority) {
        case TicketPriority.KRITIKUS: return 'priority-kritikus';
        case TicketPriority.MAGAS: return 'priority-magas';
        case TicketPriority.NORMAL: return 'priority-normal';
        case TicketPriority.ALACSONY: return 'priority-alacsony';
        default: return '';
    }
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // --- ÚJ ÁLLAPOT A SZŰRÉSHEZ ---
  const [showClosed, setShowClosed] = useState(false);


  const fetchTickets = () => {
    setLoading(true);
    getTickets()
      .then(res => setTickets(res.data))
      .catch(() => setError('A feladatok betöltése sikertelen.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Szűrt ticketek listája a useMemo segítségével
  const filteredTickets = useMemo(() => {
    if (showClosed) {
      return tickets; // Ha mutatjuk a lezártakat, az összeset visszaadjuk
    }
    return tickets.filter(ticket => ticket.status !== TicketStatus.LEZART);
  }, [tickets, showClosed]);
  
  const handleTicketAdded = () => {
      setShowAddForm(false);
      fetchTickets();
  }

  if (loading) return <p>Feladatok betöltése...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Feladatkezelő</h1>
        <button onClick={() => setShowAddForm(true)}>Új feladat</button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ margin: '1rem 0' }}>
        <button onClick={() => setShowClosed(!showClosed)}>
          {showClosed ? 'Lezárt feladatok elrejtése' : 'Lezárt feladatok mutatása'}
        </button>
      </div>

      <div className="card-grid">
        {filteredTickets.map(ticket => (
            <Link to={`/tickets/${ticket.ticket_id}`} key={ticket.ticket_id} style={{textDecoration: 'none', color: 'inherit'}}>
                <div className={`card ${getPriorityClass(ticket.priority)}`}>
                    <h3>#{ticket.ticket_id} - {ticket.title}</h3>
                    <p><strong>Státusz:</strong> {ticket.status}</p>
                    <p><strong>Felelős:</strong> {ticket.assignee?.username || 'N/A'}</p>
                    <p><strong>Létrehozva:</strong> {formatDateTime(ticket.created_at)}</p>
                </div>
            </Link>
        ))}
      </div>

      {showAddForm && <AddTicketForm onTicketAdded={handleTicketAdded} onCancel={() => setShowAddForm(false)} />}
    </div>
  );
}