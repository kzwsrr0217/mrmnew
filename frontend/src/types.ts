// frontend/src/types.ts

export enum HardwareType {
  SZERVER = 'SZERVER',
  MUNKAALLOMAS = 'MUNKAÁLLOMÁS',
  SWITCH = 'SWITCH',
  ROUTER = 'ROUTER',
  ADATTAROLO = 'ADATTÁROLÓ',
  NYOMTATO = 'NYOMTATÓ',
  MONITOR = 'MONITOR',
  BILLENTYUZET = 'BILLENTYŰZET',
  EGER = 'EGÉR',
  RESZEGYSEG = 'RÉSZEGYSEG',
  EGYEB = 'EGYÉB',
}

export enum WorkstationType {
  ASZTALI = 'ASZTALI',
  HORDOZHATO = 'HORDOZHATÓ',
  THIN_CLIENT = 'THIN CLIENT',
  EGYEB = 'EGYÉB',
}

export enum StorageType {
  SSD = 'SSD',
  HDD = 'HDD',
  NVME = 'NVME',
  SZALAG = 'SZALAG',
  EGYEB = 'EGYÉB',
}

export enum TempestLevel {
  A = 'LEVEL A',
  B = 'LEVEL B',
  C = 'LEVEL C',
  D = 'COTS',
}
export enum DocumentType {
  RENDSZERENGEDELY = 'Rendszerengedély',
  UBSZ = 'Üzemeltetés Biztonsági Szabályzat',
  RBK = 'Rendszerbiztonsági Követelmények',
  HOZZAFERESI_KERELEM = 'Hozzáférési Kérelem',
  RENDSZERENGEDELY_KERELEM = 'Rendszerengedély Kérelem',
  EGYEB = 'Egyéb',
}

export enum TicketPriority {
  ALACSONY = 'Alacsony',
  NORMAL = 'Normál',
  MAGAS = 'Magas',
  KRITIKUS = 'Kritikus',
}

export enum TicketStatus {
  UJ = 'Új',
  FOLYAMATBAN = 'Folyamatban',
  LEZART = 'Lezárt',
}
export enum UserRole {
  ADMIN = 'Admin',
  BV = 'Biztonsági vezető',
  HBV = 'Helyettes Biztonsági vezető',
  HHBV = 'Helyi Helyettes Biztonsági vezető',
  RBF = 'Rendszerbiztonsági felügyelő',
  RA = 'Rendszeradminisztrátor',
  SZBF = 'Személyi Biztonsági Felelős',
  USER = 'Felhasználó',
  ALEGYSEGPARANCSNOK = 'Alegységparancsnok',
}

// --- EGYSÉGESÍTETT ENUM ---
export enum RequestStatus {
  BV_JOVAHAGYASRA_VAR = 'BV jóváhagyásra vár',
  ENGEDELYEZVE = 'Engedélyezve (Ticket létrehozva RA számára)',
  VEGREHAJTVA = 'Végrehajtva',
  ELUTASITVA = 'Elutasítva',
}

export interface AccessRequest {
    id: number;
    personel: { nev: string };
    system: { systemname: string };
    requester: { nev: string; username: string } | null; // username hozzáadva
    status: RequestStatus; 
    createdAt: string;
}

export enum AccessLevel {
    USER = 'user',
    ADMIN = 'admin',
    GUEST = 'guest',
}
// --- ÚJ INTERFÉSZ ---
export interface Location {
  id: number;
  zip_code: string;
  city: string;
  address: string;
  building: string;
  room: string;
  full_address: string;
}

export enum SecurityClass {
  FIRST_CLASS = 'Első Osztály',
  SECOND_CLASS = 'Másod Osztály',
}

export interface Classification {
  id: number;
  level_name: string;
  type: 'Nemzeti' | 'NATO' | 'EU';
}

export interface DataHandlingPermit {
  id: number;
  registration_number: string;
  security_class: SecurityClass;
  notes: string | null;
  location: Location; // Kapcsolat a helyszínnel
  classification_levels: Classification[]; // Kapcsolat a minősítésekkel
  original_filename: string | null;
}
export interface Hardware {
  hardware_id: number;
  type: HardwareType;
  model_name: string;
  serial_number: string;
  manufacturer: string;
  notes?: string;
  is_tempest: boolean;
  tempest_level?: TempestLevel;
  tempest_cert_number?: string;
  tempest_number?: string;
  workstation_type?: WorkstationType;
  inventory_number?: string;
  storage_size_gb?: number;
  storage_type?: StorageType;
  parent_hardware_id?: number;
  classification_ids?: number[];
  location: Location | null;
  installed_software: { name: string, version: string }[];
}

export interface System {
  systemid: number;
  systemname: string;
  description: string;
}

export interface Permit {
  permit_id: number;
  engedely_szam: string;
  ervenyesseg_datuma: string;
}

export interface Document {
  document_id: number;
  type: string;
  registration_number: string;
  filepath: string;
}
