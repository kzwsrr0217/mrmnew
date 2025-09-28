// mrmnew/frontend/src/pages/TicketDetailPage.tsx

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTicketDetails, addComment, updateTicketStatus } from '../services/api.service';
import { TicketStatus } from '../types';
import { formatDateTime } from '../utils/date.utils';

// Típusdefiníciók a részletes nézethez
interface Comment {
  comment_id: number;
  text: string;
  created_at: string;
  author: { username: string };
}

interface TicketDetails {
  ticket_id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  created_at: string;
  creator: { username: string } | null; // <-- JAVÍTVA: A creator lehet null
  assignee: { username: string } | null;
  comments: Comment[];
}

export function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTicket = () => {
    if (!id) return;
    setLoading(true);
    getTicketDetails(Number(id))
      .then(res => setTicket(res.data))
      .catch(() => setError('A feladat betöltése sikertelen.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleAddComment = async () => {
    if (!id || !newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment(Number(id), newComment);
      setNewComment('');
      fetchTicket(); // Frissítjük a ticketet, hogy a komment megjelenjen
    } catch (err) {
      alert('Hiba a komment küldése közben.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleStatusChange = async (newStatus: TicketStatus) => {
      if (!id) return;
      try {
          await updateTicketStatus(Number(id), newStatus);
          fetchTicket(); // Státuszváltás után frissítünk
      } catch (err) {
          alert('Hiba a státusz frissítése közben.');
      }
  }

  if (loading) return <p>Betöltés...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!ticket) return <p>A feladat nem található.</p>;

  return (
    <div>
      <Link to="/tickets">&larr; Vissza a feladatokhoz</Link>
      <h1>{ticket.title} <small>(#{ticket.ticket_id})</small></h1>

      <div style={{ display: 'flex', gap: '2rem' }}>
        <div style={{ flex: 2 }}>
          <h4>Leírás</h4>
          <p>{ticket.description || 'Nincs leírás.'}</p>
          <hr/>
          <h4>Kommentek</h4>
          {ticket.comments.map(comment => (
            <div key={comment.comment_id} style={{border: '1px solid #eee', padding: '1rem', marginBottom: '1rem'}}>
              <p><strong>{comment.author.username}</strong> - {formatDateTime(comment.created_at)}</p>
              <p>{comment.text}</p>
            </div>
          ))}
          <div>
            <textarea 
              rows={4} 
              style={{width: '100%'}} 
              value={newComment} 
              onChange={e => setNewComment(e.target.value)}
              placeholder="Új komment írása..."
            />
            <button onClick={handleAddComment} disabled={isSubmitting}>Komment küldése</button>
          </div>
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #ccc', paddingLeft: '2rem' }}>
            <h4>Adatok</h4>
            <p><strong>Státusz:</strong> {ticket.status}</p>
            <p><strong>Prioritás:</strong> {ticket.priority}</p>
            {/* JAVÍTVA: Opcionális láncolást (?.) használunk és alapértelmezett értéket adunk */}
            <p><strong>Létrehozta:</strong> {ticket.creator?.username || '🤖 Rendszer'}</p>
            <p><strong>Hozzárendelve:</strong> {ticket.assignee?.username || '-'}</p>
            <p><strong>Létrehozva:</strong> {formatDateTime(ticket.created_at)}</p>
            <hr/>
            <h4>Műveletek</h4>
            <select value={ticket.status} onChange={e => handleStatusChange(e.target.value as TicketStatus)}>
                {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        </div>
      </div>
    </div>
  );
}