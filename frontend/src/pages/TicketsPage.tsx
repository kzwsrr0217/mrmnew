import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getTickets, claimTicket } from '../services/api.service';
import { AddTicketForm } from '../components/AddTicketForm';
import { TicketStatus, TicketPriority, UserRole } from '../types';
import { formatDateTime } from '../utils/date.utils';
import { Modal } from '../components/Modal';
import { useAuth } from '../auth/AuthContext';

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
  const { user } = useAuth(); 

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

    const handleClaimTicket = async (e: React.MouseEvent, ticketId: number) => {
        e.preventDefault(); 
        try {
            await claimTicket(ticketId);
            fetchTickets();
        } catch (error) {
            console.error('Hiba a ticket felvétele közben', error);
            alert('A ticketet nem sikerült felvenni. Lehet, hogy már valaki más megelőzött.');
        }
    };

  const filteredTickets = useMemo(() => {
    if (showClosed) {
      return tickets; 
    }
    return tickets.filter(ticket => ticket.status !== TicketStatus.LEZART);
  }, [tickets, showClosed]);
  
  const handleTicketAdded = () => {
      setShowAddForm(false);
      fetchTickets();
  }

  if (loading) return <p>Feladatok betöltése...</p>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Feladatkezelő</h1>
        <button onClick={() => setShowAddForm(true)}>Új feladat</button>
      </div>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ margin: '1rem 0' }}>
        <label>
          <input 
            type="checkbox" 
            checked={showClosed} 
            onChange={() => setShowClosed(!showClosed)} 
          />
          Lezárt feladatok mutatása
        </label>
      </div>

      <div className="card-grid">
        {filteredTickets.map(ticket => (
            <Link to={`/tickets/${ticket.ticket_id}`} key={ticket.ticket_id} className={`card ${getPriorityClass(ticket.priority)}`}>
                <h3>#{ticket.ticket_id} - {ticket.title}</h3>
                <p><strong>Státusz:</strong> {ticket.status}</p>
                <p><strong>Felelős:</strong> 
                  {ticket.assignee ? ticket.assignee.username : 
                      (user?.role === UserRole.RA || user?.role === UserRole.ADMIN ? 
                          <button className="claim-button" onClick={(e) => handleClaimTicket(e, ticket.ticket_id)}>
                              Felveszem
                          </button> 
                          : 'Kiosztatlan')
                  }
                </p>
                <p><strong>Létrehozva:</strong> {formatDateTime(ticket.created_at)}</p>
            </Link>
        ))}
      </div>
      
      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
            <AddTicketForm 
                onSuccess={handleTicketAdded} 
                onCancel={() => setShowAddForm(false)} 
            />
        </Modal>
      )}
    </div>
  );
}

