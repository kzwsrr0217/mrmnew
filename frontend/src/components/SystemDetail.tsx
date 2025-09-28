import { useState, useEffect } from 'react';
import { 
  getPermitForSystem, 
  getHardwareForSystem, 
  getDocumentsForSystem, 
  downloadDocument,
  deleteDocument,
  deleteHardware,
  // --- ÚJ IMPORT ---
  getLocations,
  updateSystemStatus

} from '../services/api.service';
// --- TÍPUSOK GLOBÁLIS IMPORTÁLÁSA ---
import { System, Permit, Hardware, Document, Location } from '../types'; 
import { AddHardwareForm } from './AddHardwareForm';
import { AddDocumentForm } from './AddDocumentForm';
import { AddSoftwareModal } from './AddSoftwareModal';
import { AddPermitForm } from './AddPermitForm';
import { AssignFromLogisticsModal } from './AssignFromLogisticsModal';
import { formatDate } from '../utils/date.utils';

// Definiáljuk a státuszokat a frontend oldalon is
const systemStatuses = ['Aktív', 'Fejlesztés alatt', 'Inaktív', 'Archivált'];

interface SystemDetailProps {
  system: System;
  onBack: () => void;
}

export function SystemDetail({ system: initialSystem, onBack }: SystemDetailProps) {
  // A komponens belső állapotaként kezeljük a rendszert, hogy frissíthessük
  const [system, setSystem] = useState<System>(initialSystem);
  const [permit, setPermit] = useState<Permit | null>(null);
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modális ablakok állapotai
  const [showAddHardware, setShowAddHardware] = useState(false);
  const [editingHardware, setEditingHardware] = useState<Hardware | null>(null);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [selectedHardwareId, setSelectedHardwareId] = useState<number | null>(null);
  const [showAddPermit, setShowAddPermit] = useState(false);
  const [showAssignFromLogistics, setShowAssignFromLogistics] = useState(false);

    const fetchData = async () => {
    try {
      const [permitRes, hardwareRes, documentsRes, locationsRes] = await Promise.all([
        getPermitForSystem(system.systemid).catch(() => ({ data: null })),
        getHardwareForSystem(system.systemid),
        getDocumentsForSystem(system.systemid),
        getLocations(),
      ]);
      setPermit(permitRes.data);
      setHardware(hardwareRes.data);
      setDocuments(documentsRes.data);
      setLocations(locationsRes.data);
    } catch (error) {
      console.error("Hiba a részletes adatok lekérésekor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [system.systemid]);

  // --- ÚJ FÜGGVÉNY a státusz változásának kezelésére ---
  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    try {
      const response = await updateSystemStatus(system.systemid, newStatus);
      setSystem(response.data); // Frissítjük a komponens állapotát a backend válaszával
      alert(`A(z) "${system.systemname}" rendszer státusza sikeresen módosítva lett!`);
    } catch (error) {
      alert('A státusz frissítése sikertelen.');
      // Visszaállítjuk a legördülőt a régi értékre hiba esetén
      event.target.value = system.status;
    }
  };

  // Egységes "onSuccess" handler a modális ablakoknak
  const handleModalSuccess = () => {
    setShowAddPermit(false);
    setShowAddHardware(false);
    setEditingHardware(null); 
    setShowAddDocument(false);
    setShowAssignFromLogistics(false);
    setSelectedHardwareId(null);
    fetchData(); // Mindent frissítünk
  };

  const handleModalCancel = () => {
      setShowAddPermit(false);
      setShowAddHardware(false);
      setEditingHardware(null);
      setShowAddDocument(false);
      setShowAssignFromLogistics(false);
      setSelectedHardwareId(null);
  }

  // Új hardver hozzáadásakor null-ra állítjuk a szerkesztendő hardvert
  const handleAddNewHardware = () => {
    setEditingHardware(null);
    setShowAddHardware(true);
  };
  
  // Hardver szerkesztésekor beállítjuk a szerkesztendő hardvert
  const handleEditHardware = (hw: Hardware) => {
    setEditingHardware(hw);
    setShowAddHardware(true);
  };

  const handleDeleteHardware = async (hwId: number) => {
    if (window.confirm('Biztosan törli ezt a hardverelemet?')) {
      try {
        await deleteHardware(hwId);
        fetchData();
      } catch (error) {
        alert('A hardver törlése sikertelen.');
      }
    }
  };
  
  const handleDeleteDocument = async (docId: number) => {
    if (window.confirm('Biztosan törli ezt a dokumentumot?')) {
      try {
        await deleteDocument(docId);
        fetchData();
      } catch (error) {
        alert('A dokumentum törlése sikertelen.');
      }
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const response = await downloadDocument(doc.document_id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename = doc.filepath.split('-').pop() || 'dokumentum.pdf';
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('A fájl letöltése sikertelen.');
    }
  };

  if (loading) return <p>Adatok betöltése...</p>;

  return (
    <div>
      <button onClick={onBack}>&larr; Vissza a listához</button>
      <h2>{system.systemname} Részletes Adatai</h2>
      <p><strong>Leírás:</strong> {system.description}</p>
      
      {/* --- ÚJ LEÖRDÜLŐ LISTA --- */}
      <div style={{ margin: '1rem 0', maxWidth: '300px' }}>
        <label htmlFor="status-select" style={{ display: 'block', marginBottom: '0.5rem' }}>
          <strong>Rendszer státusza</strong>
        </label>
        <select 
          id="status-select"
          value={system.status} 
          onChange={handleStatusChange}
          style={{ width: '100%', padding: '8px' }}
        >
          {systemStatuses.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* --- Rendszerengedély és Dokumentumok Szekciók (változatlan) --- */}
      <hr />
      <h3>Rendszerengedély</h3>
      {permit ? (
        <div>
          <p>Engedély száma: {permit.engedely_szam} (Érvényes: {formatDate(permit.ervenyesseg_datuma)})</p>
          <button onClick={() => setShowAddPermit(true)}>Engedély módosítása</button>
        </div>
      ) : (
        <div>
          <p>Ehhez a rendszerhez nincs rögzítve engedély.</p>
          <button onClick={() => setShowAddPermit(true)}>Engedély hozzáadása</button>
        </div>
      )}

      <hr />
      <h3>Dokumentumok</h3>
      {documents.length > 0 ? (
        <ul>
          {documents.map(doc => (
            <li key={doc.document_id}>
              {doc.type} ({doc.registration_number || 'N/A'})
              <button onClick={() => handleDownload(doc)} style={{marginLeft: '1rem'}}>Letöltés</button>
              <button onClick={() => handleDeleteDocument(doc.document_id)} style={{color: 'red'}}>Törlés</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Ehhez a rendszerhez nincsenek rögzítve dokumentumok.</p>
      )}
      <button onClick={() => setShowAddDocument(true)}>Új dokumentum feltöltése</button>
      
      {/* --- Hardverek Szekció (frissítve) --- */}
      <hr />
      <h3>Hardverek</h3>
      {hardware.length > 0 ? (
        <table>
            <thead>
                <tr>
                    <th>Típus</th>
                    <th>Modell</th>
                    <th>Sorozatszám</th>
                    <th>Telepítési hely</th>
                    <th>Szoftverek</th>
                    <th>Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {hardware.map(hw => (
                    <tr key={hw.hardware_id}>
                        <td>{hw.type}</td>
                        <td>{hw.model_name}</td>
                        <td>{hw.serial_number}</td>
                        <td>{hw.location ? hw.location.full_address : 'N/A'}</td>
                        <td>{hw.installed_software?.length || 0} db</td>
                        <td>
                            <button onClick={() => handleEditHardware(hw)}>Szerkesztés</button>
                            <button onClick={() => setSelectedHardwareId(hw.hardware_id)}>+ Szoftver</button>
                            <button onClick={() => handleDeleteHardware(hw.hardware_id)} style={{color: 'red', marginLeft: '0.5rem'}}>Törlés</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      ) : (<p>Ehhez a rendszerhez nincsenek rögzítve hardverek.</p>)}
      
      <div style={{marginTop: '1rem', display: 'flex', gap: '1rem'}}>
        <button onClick={handleAddNewHardware}>Új hardver manuális felvétele</button>
        <button onClick={() => setShowAssignFromLogistics(true)} style={{backgroundColor: '#0d6efd', color: 'white'}}>
          Hozzárendelés a logisztikáról
        </button>
      </div>
      
      {/* --- Modális Ablakok --- */}
      {showAddPermit && <AddPermitForm systemId={system.systemid} permit={permit} onPermitChange={handleModalSuccess} onCancel={handleModalCancel} />}
      {showAddDocument && <AddDocumentForm systemId={system.systemid} onDocumentAdded={handleModalSuccess} onCancel={handleModalCancel} />}
      
      {showAddHardware && <AddHardwareForm 
        systemId={system.systemid} 
        hardwareToEdit={editingHardware}
        locations={locations}
        onSuccess={handleModalSuccess} 
        onCancel={handleModalCancel}
      />}

      {showAssignFromLogistics && <AssignFromLogisticsModal systemId={system.systemid} onClose={handleModalCancel} onSuccess={handleModalSuccess} />}
      {selectedHardwareId && <AddSoftwareModal hardwareId={selectedHardwareId} onClose={handleModalSuccess} />}
    </div>
  );
}