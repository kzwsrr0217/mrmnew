// mrmnew/frontend/src/components/layout/Header.tsx

import { useAuth } from "../../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { UserRole } from "../../types"; // JAVÍTVA: UserRole import (ha szükséges)

export function Header() {
    const { user, notifications, logout } = useAuth();
    const navigate = useNavigate();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    // JAVÍTVA: Teljeskörű értesítés-számláló
    const getNotificationCount = () => {
        if (!notifications || !user) return 0;

        const tickets = (user.role === UserRole.ADMIN) 
            ? (notifications.allOpenTickets?.length || 0)
            : (notifications.openTickets?.length || 0);

        const approvals = notifications.pendingApprovals?.length || 0;
        const permits = notifications.expiringPermits?.length || 0;
        const certificates = notifications.expiringCertificates?.length || 0;
        
        return tickets + approvals + permits + certificates;
    }
    const notificationCount = getNotificationCount();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setIsPanelOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [panelRef]);


    // JAVÍTVA: Adminnak a "allOpenTickets", másnak "openTickets"
    const ticketsToShow = (user?.role === UserRole.ADMIN)
        ? notifications.allOpenTickets
        : notifications.openTickets;

    return (
        <header className="app-header">
            <h2>Minősített Rendszer Menedzsment</h2>
            {user && (
                <div className="user-info" ref={panelRef}>
                    
                    <div 
                        className="notification-trigger" 
                        onClick={() => setIsPanelOpen(!isPanelOpen)}
                    >
                        <span>Üdv, {user.username}</span>
                        {notificationCount > 0 && (
                            <span className="notification-badge">{notificationCount}</span>
                        )}
                        <span className="notification-icon">🔔</span>
                    </div>
                    
                    <button onClick={handleLogout}>Kijelentkezés</button>

                    {/* JAVÍTVA: A panel dinamikus feltöltése az összes típussal */}
                    {isPanelOpen && notificationCount > 0 && (
                        <div className="notification-panel">
                            <h3>Értesítések</h3>
                            <ul>
                                {/* 1. Ticketek (Adminnak összes, usernek saját) */}
                                {(ticketsToShow?.length || 0) > 0 && (
                                    <li>
                                        <Link to="/tickets" onClick={() => setIsPanelOpen(false)}>
                                            <strong>{ticketsToShow.length} db</strong> 
                                            {user.role === UserRole.ADMIN ? " nyitott feladat (összes)" : " nyitott feladat"}
                                        </Link>
                                    </li>
                                )}
                                {/* 2. Jóváhagyások */}
                                {(notifications.pendingApprovals?.length || 0) > 0 && (
                                    <li>
                                        <Link to="/pending-requests" onClick={() => setIsPanelOpen(false)}>
                                            <strong>{notifications.pendingApprovals.length} db</strong> jóváhagyásra váró kérelem
                                        </Link>
                                    </li>
                                )}
                                {/* 3. Lejáró rendszerengedélyek */}
                                {(notifications.expiringPermits?.length || 0) > 0 && (
                                    <li>
                                        <Link to="/systems" onClick={() => setIsPanelOpen(false)}>
                                            <strong>{notifications.expiringPermits.length} db</strong> 3 hónapon belül lejáró rendszerengedély
                                        </Link>
                                    </li>
                                )}
                                 {/* 4. Lejáró tanúsítványok */}
                                {(notifications.expiringCertificates?.length || 0) > 0 && (
                                    <li>
                                        <Link to="/personel" onClick={() => setIsPanelOpen(false)}>
                                            <strong>{notifications.expiringCertificates.length} db</strong> 6 hónapon belül lejáró bizt. tanúsítvány
                                        </Link>
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </header>
    )
}