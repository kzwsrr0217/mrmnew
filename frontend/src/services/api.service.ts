// mrmnew/frontend/src/services/api.service.ts

import axios from 'axios';
import { Location } from '../types';
import { DataHandlingPermit, Classification } from '../types';

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

export const updateTicketStatus = (ticketId: number, status: string) => {
  return apiClient.patch(`/tickets/${ticketId}/status`, { status });
};

// --- Naplózás (Audit) végpontok ---
export const getAuditLogs = () => {
  return apiClient.get('/audit');
};

// --- Karbantartási Napló (Maintenance) végpontok ---
export const getMaintenanceLogs = () => {
  return apiClient.get('/maintenance');
};

export const createMaintenanceLog = (data: { system_id: number; description: string }) => {
  return apiClient.post('/maintenance', data);
};

// --- Rendszerek (Systems) végpontok ---
export const getSystems = () => {
  return apiClient.get('/systems');
};

export const createSystem = (data: { systemname: string, description: string }) => {
  return apiClient.post('/systems', data);
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

// --- Személyi állomány (Personel) végpontok ---
export const getPersonel = () => {
  return apiClient.get('/personel');
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

// --- Logisztika (Logistics) végpontok ---
export const getStockItems = () => {
  return apiClient.get('/logistics/items/stock');
};

export const assignLogisticsItem = (data: { itemId: number; systemId: number; type: string; notes?: string; }) => {
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

export const createLocation = (data: Omit<Location, 'id'>) => {
  return apiClient.post('/locations', data);
};

export const updateLocation = (id: number, data: Partial<Omit<Location, 'id'>>) => {
  return apiClient.patch(`/locations/${id}`, data);
};

export const deleteLocation = (id: number) => {
  return apiClient.delete(`/locations/${id}`);
};

// --- MINŐSÍTÉSEK (CLASSIFICATIONS) API ---
// Erre szükségünk lesz a legördülő menühöz
export const getClassifications = () => {
  return apiClient.get<Classification[]>('/classifications');
};

// --- ADATKEZELÉSI ENGEDÉLYEK (DATA HANDLING PERMITS) API ---
export const getPermits = () => {
  return apiClient.get<DataHandlingPermit[]>('/data-handling-permits');
};

export const createPermit = (data: FormData) => {
  return apiClient.post('/data-handling-permits', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updatePermit = (id: number, data: FormData) => {
  return apiClient.patch(`/data-handling-permits/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deletePermit = (id: number) => {
  return apiClient.delete(`/data-handling-permits/${id}`);
};