import { useState, useEffect } from 'react';
import { getPendingRequests, approveRequest, rejectRequest } from '../services/api.service';
// JAVÍTVA: A UserRole importálása a types.ts fájlból
import { AccessRequest, RequestStatus, UserRole } from '../types'; 
import { useAuth } from '../auth/AuthContext';
import { formatDate } from '../utils/date.utils';

export function PendingRequestsPage() {
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const [rejectionReason, setRejectionReason] = useState<string>('');
    const [showRejectionModal, setShowRejectionModal] = useState<number | null>(null);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await getPendingRequests();
            setRequests(res.data);
        } catch (err) {
            setError('Hiba a függőben lévő kérelmek lekérése közben.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        if (!window.confirm('Biztosan jóváhagyja ezt a kérelmet?')) return;
        try {
            await approveRequest(id);
            fetchRequests();
        } catch (err) {
            alert('Hiba a jóváhagyás során.');
        }
    };

    const handleReject = async () => {
        if (!showRejectionModal || !rejectionReason) return;
        try {
            await rejectRequest(showRejectionModal, { reason: rejectionReason }); // DTO-nak megfelelően
            setShowRejectionModal(null);
            setRejectionReason('');
            fetchRequests();
        } catch (err) {
            alert('Hiba az elutasítás során.');
        }
    };

    const canApprove = (): boolean => {
        if (!user || !user.role) {
            return false;
        }
        // Admin, BV és helyettesei hagyhatnak jóvá ebben a nézetben
        const approverRoles = [UserRole.ADMIN, UserRole.BV, UserRole.HBV, UserRole.HHBV];
        return approverRoles.includes(user.role as UserRole);
    };
    
    if (loading) return <p>Betöltés...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <h1>Függőben lévő hozzáférési kérelmek</h1>
            {requests.length === 0 ? (
                <p>Nincsenek függőben lévő kérelmek.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Kérelmezett Személy</th>
                            <th>Rendszer</th>
                            <th>Kérelmező</th>
                            <th>Státusz</th>
                            <th>Létrehozva</th>
                            <th>Műveletek</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td>{req.id}</td>
                                <td>{req.personel ? req.personel.nev : 'Hiányzó személy'}</td>
                                <td>{req.system ? req.system.systemname : 'Hiányzó rendszer'}</td>
                                <td>{req.requester ? req.requester.username : 'Rendszer'}</td>
                                <td>{req.status}</td>
                                <td>{formatDate(req.createdAt)}</td>
                                <td>
                                    {/* A canApprove már nem függ a requesttől, hanem a bejelentkezett felhasználótól */}
                                    {canApprove() && req.status === RequestStatus.BV_JOVAHAGYASRA_VAR && (
                                        <>
                                            <button onClick={() => handleApprove(req.id)} style={{marginRight: '8px'}}>Jóváhagyás</button>
                                            <button onClick={() => setShowRejectionModal(req.id)} style={{backgroundColor: '#dc3545'}}>Elutasítás</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showRejectionModal !== null && (
                <div className="modal-backdrop">
                    <div className="modal-content"> {/* Használjuk a központi modal stílust */}
                        <div className="modal-header">
                          <h2>Kérelem Elutasítása</h2>
                           <button onClick={() => setShowRejectionModal(null)} className="close-button">&times;</button>
                        </div>
                        <div className="modal-body">
                          <p>Kérlek, add meg az elutasítás okát:</p>
                          <textarea 
                              rows={4} 
                              value={rejectionReason} 
                              onChange={(e) => setRejectionReason(e.target.value)} 
                              style={{width: '100%', marginBottom: '1rem'}}
                          />
                          <div className="form-actions">
                            <button type="button" onClick={() => setShowRejectionModal(null)}>Mégse</button>
                            <button onClick={handleReject} style={{backgroundColor: '#dc3545', color: 'white'}}>Elutasítás megerősítése</button>
                          </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}