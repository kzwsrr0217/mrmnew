// mrmnew/frontend/src/App.tsx

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { MainLayout } from './components/layout/MainLayout';
import { UserRole } from './types';
import { LoginPage } from './pages/LoginPage';
import { SystemsPage } from './pages/SystemsPage';
import { AccessPage } from './pages/AccessPage';
import { PersonelPage } from './pages/PersonelPage';
import { ReportsPage } from './pages/ReportsPage';
import { TicketsPage } from './pages/TicketsPage';
import { TicketDetailPage } from './pages/TicketDetailPage';
import { FormGeneratorPage } from './pages/FormGeneratorPage';
import { AdminPage } from './pages/AdminPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { PendingRequestsPage } from './pages/PendingRequestsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { LocationsPage } from './pages/LocationsPage';
import { DataHandlingPermitsPage } from './pages/DataHandlingPermitsPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><MainLayout><SystemsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/systems" element={<ProtectedRoute><MainLayout><SystemsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/access" element={<ProtectedRoute><MainLayout><AccessPage /></MainLayout></ProtectedRoute>} />
        <Route path="/personel" element={<ProtectedRoute><MainLayout><PersonelPage /></MainLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><MainLayout><ReportsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><MainLayout><TicketsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/tickets/:id" element={<ProtectedRoute><MainLayout><TicketDetailPage /></MainLayout></ProtectedRoute>} />
        <Route path="/forms" element={<ProtectedRoute roles={[UserRole.ADMIN, UserRole.RBF]}><MainLayout><FormGeneratorPage /></MainLayout></ProtectedRoute>} />
        <Route path="/pending-requests" element={<ProtectedRoute roles={[UserRole.BV, UserRole.HBV, UserRole.HHBV, UserRole.SZBF]}><MainLayout><PendingRequestsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MainLayout><MaintenancePage /></MainLayout></ProtectedRoute>} />
        <Route path="/logistics" element={<ProtectedRoute><MainLayout><LogisticsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={[UserRole.ADMIN]}><MainLayout><AdminPage /></MainLayout></ProtectedRoute>} />
        <Route path="/audit" element={<ProtectedRoute roles={[UserRole.ADMIN]}><MainLayout><AuditLogPage /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={[UserRole.ADMIN]}><MainLayout><AdminDashboardPage /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/locations" element={<ProtectedRoute roles={[UserRole.ADMIN]}><MainLayout><LocationsPage /></MainLayout></ProtectedRoute>} />
        <Route path="/admin/permits" element={<ProtectedRoute roles={[UserRole.ADMIN]}><MainLayout><DataHandlingPermitsPage /></MainLayout></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;