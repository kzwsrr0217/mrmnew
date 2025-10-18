// mrmnew/frontend/src/components/layout/MainLayout.tsx

import React from 'react'; // TÖRÖLVE: useEffect, useState, useAuth
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './layout.css';
// TÖRÖLVE: import { useAuth } from '../../auth/AuthContext';

// JAVÍTVA: Props-ként fogadja a megjelenítendő oldalt
interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    // TÖRÖLVE: A notifications, showModal state és a teljes useEffect hook.

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

            {/* TÖRÖLVE: A teljes {showModal && ...} JSX blokk. */}
        </div>
    );
}