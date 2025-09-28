// mrmnew/frontend/src/components/layout/MainLayout.tsx

import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './layout.css';
import { useAuth } from '../../auth/AuthContext';

// JAVÍTVA: Props-ként fogadja a megjelenítendő oldalt
interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const { notifications } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        // JAVÍTVA: Biztonságos hozzáférés
        const totalNotifications = (notifications?.openTickets?.length || 0) + (notifications?.pendingApprovals?.length || 0);
        if (totalNotifications > 0) {
            if (!sessionStorage.getItem('notificationModalShown')) {
                setShowModal(true);
                sessionStorage.setItem('notificationModalShown', 'true');
            }
        }
    }, [notifications]);

 return (
 <div className="app-layout">
 <Header />
            {/* JAVÍTVA: A class nevet 'app-body'-ra cseréltük */}
 <div className="app-body">
 <Sidebar />
                {/* JAVÍTVA: A class nevet 'app-content'-re cseréltük */}
<main className="app-content">
{children}
</main>
 </div>

            {showModal && (
                <div className="modal-backdrop">
                    <div className="modal" style={{textAlign: 'center'}}>
                        <h3>Értesítés a teendőkről</h3>
                        <p>Az alábbi nyitott feladatok várnak rád:</p>
                        <ul>
                            {(notifications?.openTickets?.length || 0) > 0 && <li><strong>{notifications.openTickets.length} db</strong> nyitott feladat (ticket)</li>}
                            {(notifications?.pendingApprovals?.length || 0) > 0 && <li><strong>{notifications.pendingApprovals.length} db</strong> jóváhagyásra váró kérelem</li>}
                        </ul>
                        <button onClick={() => setShowModal(false)}>Bezárás</button>
                    </div>
                </div>
            )}
        </div>
    );
}