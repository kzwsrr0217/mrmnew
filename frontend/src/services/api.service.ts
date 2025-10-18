// mrmnew/frontend/src/services/api.service.ts

import axios from 'axios';
import { Location, DataHandlingPermit, Classification } from '../types';


export const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Auth végpontok ---
export const login = (data: { username: string; password: string }) => {
  return apiClient.post('/auth/login', data);
};

// --- Users végpontok ---
export const getUsers = () => {
  return apiClient.get('/users');
};

export const updateUserRole = (userId: number, role: string) => {
  return apiClient.patch(`/users/${userId}/role`, { role });
};

export const resetUserPassword = (userId: number, newPassword: string) => {
  return apiClient.patch(`/users/${userId}/reset-password`, { newPassword });
};

export const createUser = (data: any) => {
  return apiClient.post('/users', data);
};

// --- Ticketing végpontok ---
export const getTickets = () => {
  return apiClient.get('/tickets');
};

export const getTicketDetails = (id: number) => {
  return apiClient.get(`/tickets/${id}`);
};

export const createTicket = (data: { title: string; description?: string; priority?: string; assignee_id?: number }) => {
  return apiClient.post('/tickets', data);
};

export const addComment = (ticketId: number, text: string) => {
  return apiClient.post(`/tickets/${ticketId}/comments`, { text });
};

export const updateTicketStatus = (id: number, status: string) => apiClient.patch(`/tickets/${id}/status`, { status });

export const claimTicket = (id: number) => apiClient.patch(`/tickets/${id}/claim`);



// --- Naplózás (Audit) végpontok ---
export const getAuditLogs = () => {
  return apiClient.get('/audit');
};

// --- Karbantartási Napló (Maintenance) végpontok ---
export const getMaintenanceLogs = () => {
  return apiClient.get('/maintenance');
};

export const createMaintenanceLog = (data: { system_id: number; description: string; createTicket?: boolean; assignee_id?: number }) => {
  return apiClient.post('/maintenance', data);
};

// --- Rendszerek (Systems) végpontok ---
export const getSystems = () => {
  return apiClient.get('/systems');
};

export const createSystem = (data: { systemname: string, description: string }) => {
  return apiClient.post('/systems', data);
};
export const updateSystemStatus = (id: number, status: string) => {
  return apiClient.patch(`/systems/${id}/status`, { status });
};
// --- Rendszerengedély (SystemPermits) végpontok ---
export const getPermitForSystem = (systemId: number) => {
  return apiClient.get(`/system-permits/by-system/${systemId}`);
};

export const createSystemPermit = (data: any) => {
  return apiClient.post('/system-permits', data);
};

export const updateSystemPermit = (permitId: number, data: any) => {
  return apiClient.patch(`/system-permits/${permitId}`, data);
};

// --- Hardver (Hardware) végpontok ---
export const getHardwareForSystem = (systemId: number) => {
  return apiClient.get(`/hardware/for-system/${systemId}`);
};
export const createHardware = (hardwareData: any) => {
  return apiClient.post('/hardware', hardwareData);
};
export const updateHardware = (id: number, data: any) => { // <-- EZ A HIÁNYZÓ FÜGGVÉNY
  return apiClient.patch(`/hardware/${id}`, data);
};
export const deleteHardware = (hardwareId: number) => {
  return apiClient.delete(`/hardware/${hardwareId}`);
};

// --- Dokumentumok (Documents) végpontok ---
export const getDocumentsForSystem = (systemId: number) => {
  return apiClient.get(`/documents/for-system/${systemId}`);
};

export const uploadDocument = (formData: FormData) => {
  return apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const downloadDocument = (documentId: number) => {
  return apiClient.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });
};
export const deleteDocument = (documentId: number) => {
  return apiClient.delete(`/documents/${documentId}`);
};

// --- Szoftver (Software) végpontok ---
export const getSoftwareCatalog = () => {
  return apiClient.get('/software');
};

export const addSoftwareToHardware = (hardwareId: number, softwareId: number) => {
  return apiClient.post(`/hardware/${hardwareId}/add-software/${softwareId}`);
};

export const createSoftware = (data: { name: string, version?: string }) => {
  return apiClient.post('/software', data);
};

// --- ÚJ FÜGGVÉNYEK ---
export const updateSoftware = (id: number, data: { name?: string, version?: string }) => {
    return apiClient.patch(`/software/${id}`, data);
};

export const deleteSoftware = (id: number) => {
    return apiClient.delete(`/software/${id}`);
};

// --- Személyi állomány (Personel) végpontok ---
export const getPersonel = (search?: string) => {
  const params = search ? { search } : {};
  return apiClient.get('/personel', { params });
};

export const createPersonel = (data: any) => {
  return apiClient.post('/personel', data);
};

export const updatePersonel = (personelId: number, data: any) => {
  return apiClient.patch(`/personel/${personelId}`, data);
};

export const deletePersonel = (personelId: number) => {
  return apiClient.delete(`/personel/${personelId}`);
};

export const importPersonel = (personelData: any[]) => {
  return apiClient.post('/personel/import', { personelData });
};

// --- Logisztika (Logistics) végpontok ---
export const getStockItems = () => {
  return apiClient.get('/logistics/items/stock');
};

export const assignLogisticsItem = (data: any) => { // 'any' a rugalmasságért, de lehetne egy specifikus interface is
  return apiClient.post('/logistics/assign', data);
};

export const getLogisticsItems = () => {
  return apiClient.get('/logistics/items');
};

export const createLogisticsItem = (data: any) => {
    return apiClient.post('/logistics/items', data);
}

// --- Hozzáférések (SystemAccess) végpontok ---
export const getAccessList = () => {
  return apiClient.get('/system-access');
};

export const grantAccess = (data: { personelId: number; systemId: number; accessLevel: string; }) => {
  return apiClient.post('/system-access/grant', data);
};

export const revokeAccess = (accessId: number) => {
  return apiClient.delete(`/system-access/${accessId}`);
};

// --- Hozzáférési Kérelmek (Access Requests) végpontok ---
export const createAccessRequest = (data: { personelId: number; systemId: number; accessLevel: string; }) => {
  return apiClient.post('/access-requests', data);
};

export const getPendingRequests = () => {
  return apiClient.get('/access-requests/pending');
};

export const approveRequest = (requestId: number) => {
  return apiClient.patch(`/access-requests/${requestId}/approve`);
};

export const rejectRequest = (requestId: number, reason: string) => {
  return apiClient.patch(`/access-requests/${requestId}/reject`, { reason });
};

export const completeRequest = (requestId: number) => {
  return apiClient.patch(`/access-requests/${requestId}/complete`);
};

// --- Jelentések (Reports) végpontok ---
export const getExpiringCertificates = (months: number) => {
  return apiClient.get(`/reports/expiring-certificates?months=${months}`);
};

export const getExpiringPermits = (months: number) => {
  return apiClient.get(`/reports/expiring-permits?months=${months}`);
};

export const getAccessReport = (params: { personelId?: number; systemId?: number }) => {
  return apiClient.get('/reports/access', { params });
};

// --- Űrlapgenerálás (Forms) végpontok ---
export const generateAccessRequestPdfAndTicket = (data: any) => {
  return apiClient.post('/forms/generate/access-request-with-ticket', data, {
    responseType: 'blob',
  });
};

// --- Műszerfal (Dashboard) végpontok ---
export const getDashboardStats = () => {
  return apiClient.get('/dashboard/stats');
};

// --- ÚJ FÜGGVÉNY ---
export const getTicketsByStatus = () => {
    return apiClient.get('/dashboard/tickets-by-status');
}

export const runSeeder = () => {
  return apiClient.post('/seeder/run');
};

// --- Értesítések (Notifications) végpontok ---
export const getNotifications = () => {
  return apiClient.get('/notifications');
};

// --- HELYSZÍNEK (LOCATIONS) API ---
export const getLocations = () => {
  return apiClient.get<Location[]>('/locations');
};

export const createLocation = (data: Omit<Location, 'id' | 'full_address'>) => {
  return apiClient.post('/locations', data);
};

export const updateLocation = (id: number, data: Partial<Omit<Location, 'id' | 'full_address'>>) => {
  return apiClient.patch(`/locations/${id}`, data);
};

export const deleteLocation = (id: number) => {
  return apiClient.delete(`/locations/${id}`);
};

// --- MINŐSÍTÉSEK (CLASSIFICATIONS) API ---
export const getClassifications = () => {
  return apiClient.get<Classification[]>('/classifications');
};

export const createClassification = (data: Omit<Classification, 'id'>) => {
    return apiClient.post('/classifications', data);
};

export const updateClassification = (id: number, data: Partial<Omit<Classification, 'id'>>) => {
    return apiClient.patch(`/classifications/${id}`, data);
};

export const deleteClassification = (id: number) => {
    return apiClient.delete(`/classifications/${id}`);
};

// --- ADATKEZELÉSI ENGEDÉLYEK (DATA HANDLING PERMITS) API ---
export const getPermits = () => {
  return apiClient.get<DataHandlingPermit[]>('/data-handling-permits');
};

// JAVÍTVA: JSON payload-ot küldünk, nem FormData-t
export const createPermit = (data: any) => {
  return apiClient.post<DataHandlingPermit>('/data-handling-permits', data);
};

// JAVÍTVA: JSON payload-ot küldünk, nem FormData-t
export const updatePermit = (id: number, data: any) => {
  return apiClient.patch<DataHandlingPermit>(`/data-handling-permits/${id}`, data);
};

export const deletePermit = (id: number) => {
  return apiClient.delete(`/data-handling-permits/${id}`);
};

// ÚJ: Külön függvény a fájlfeltöltéshez
export const uploadPermitFile = (id: number, data: FormData) => {
  return apiClient.post(`/data-handling-permits/${id}/upload`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

// --- Port Feloldási Napló (Port Unlocking Log) API ---
export const getPortUnlockLogs = () => {
  return apiClient.get('/port-unlocking-log');
};

export const createPortUnlockLog = (data: any) => {
  return apiClient.post('/port-unlocking-log', data);
};

export const approvePortUnlockLog = (id: string) => {
  return apiClient.patch(`/port-unlocking-log/${id}/approve`);
};

export const closePortUnlockLog = (id: string) => {
  return apiClient.patch(`/port-unlocking-log/${id}/close`);
};
export const getSystemElementsReport = (systemId: number) => {
  return apiClient.get(`/reports/system-elements/${systemId}`);
};

// --- Backup (Mentés) Végpontok ---
export const getBackups = () => {
  return apiClient.get('/backups');
};

export const triggerBackupNow = () => {
  return apiClient.post('/backups/now');
};

export const downloadBackup = (type: string, filename: string) => {
    return apiClient.get(`/backups/download/${type}/${filename}`, {
        responseType: 'blob', // Fontos a fájl letöltéséhez
    });
};
export const getDashboardWidgets = () => {
  return apiClient.get('/dashboard/widgets');
};