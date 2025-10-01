import { useState, useEffect, useMemo } from 'react';
import { 
  getPermitForSystem, 
  getHardwareForSystem, 
  getDocumentsForSystem, 
  downloadDocument,
  deleteDocument,
  deleteHardware,
  getLocations,
  updateSystemStatus
} from '../services/api.service';
import { System, Permit, Hardware, Document, Location, Software, HardwareType } from '../types'; 
import { AddHardwareForm } from './AddHardwareForm';
import { AddDocumentForm } from './AddDocumentForm';
import { AddSoftwareModal } from './AddSoftwareModal';
import { AddPermitForm } from './AddPermitForm';
import { AssignFromLogisticsModal } from './AssignFromLogisticsModal';
import { formatDate } from '../utils/date.utils';
import { Modal } from './Modal'; // Győződj meg róla, hogy ez importálva van

// Státuszok definíciója
const systemStatuses = ['Aktív', 'Fejlesztés alatt', 'Inaktív', 'Archivált'];

interface SystemDetailProps {
  system: System;
  onBack: () => void;
}

// Új komponens a részletek kibontásához
const ExpandableRow = ({ title, children }: { title: string, children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} style={{ all: 'unset', cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}>
        {isOpen ? 'becsuk' : title}
      </button>
      {isOpen && <div style={{ padding: '10px', border: '1px solid #ccc', marginTop: '5px', backgroundColor: '#f9f9f9' }}>{children}</div>}
    </div>
  );
};

// Táblázat stílusok
const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
};

const thTdStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    padding: '8px',
    textAlign: 'left',
};


export function SystemDetail({ system: initialSystem, onBack }: SystemDetailProps) {
  const [system, setSystem] = useState<System>(initialSystem);
  const [permit, setPermit] = useState<Permit | null>(null);
  const [hardware, setHardware] = useState<Hardware[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modális ablakok és lenyíló nézetek állapotai
  const [showAddHardware, setShowAddHardware] = useState(false);
  const [editingHardware, setEditingHardware] = useState<Hardware | null>(null);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [selectedHardwareId, setSelectedHardwareId] = useState<number | null>(null);
  const [showAddPermit, setShowAddPermit] = useState(false);
  const [showAssignFromLogistics, setShowAssignFromLogistics] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);

  // Hardverek szétválasztása fő komponensekre és adattárolókra
  const { mainHardware, storageHardware } = useMemo(() => {
    const storages = hardware.filter(hw => hw.type === HardwareType.ADATTAROLO);
    // Azok a hardverek, amik nem adattárolók VAGY adattárolók de nincs szülőjük (önálló eszközök)
    const mains = hardware.filter(hw => hw.type !== HardwareType.ADATTAROLO || !hw.parent_hardware);
    return { mainHardware: mains, storageHardware: storages };
  }, [hardware]);


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

  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value;
    try {
      const response = await updateSystemStatus(system.systemid, newStatus);
      setSystem(response.data);
      alert(`A(z) "${system.systemname}" rendszer státusza sikeresen módosítva lett!`);
    } catch (error) {
      alert('A státusz frissítése sikertelen.');
      event.target.value = system.status;
    }
  };

    // ... (többi handler függvény változatlan: handleModalSuccess, handleModalCancel, etc.)
    const handleModalSuccess = () => {
        setShowAddPermit(false);
        setShowAddHardware(false);
        setEditingHardware(null); 
        setShowAddDocument(false);
        setShowAssignFromLogistics(false);
        setSelectedHardwareId(null);
        fetchData();
    };

    const handleModalCancel = () => {
        setShowAddPermit(false);
        setShowAddHardware(false);
        setEditingHardware(null);
        setShowAddDocument(false);
        setShowAssignFromLogistics(false);
        setSelectedHardwareId(null);
    }
    
    const handleAddNewHardware = () => {
        setEditingHardware(null);
        setShowAddHardware(true);
    };
    
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

      <hr />
      <h3>Rendszerengedély</h3>
        {permit ? (
            <div>
            <p><strong>Engedély száma:</strong> {permit.engedely_szam}</p>
            <p><strong>Érvényesség:</strong> {formatDate(permit.ervenyesseg_datuma)}</p>
            <p>
                <strong>Minősítési szint: </strong>
                {
                [
                    permit.nemzeti_classification && `Nemzeti "${permit.nemzeti_classification.level_name}"`,
                    permit.nato_classification && ` "${permit.nato_classification.level_name}"`,
                    permit.eu_classification && `EU "${permit.eu_classification.level_name}"`
                ]
                .filter(Boolean) 
                .join(', ')
                || 'Nincs megadva'
                }
            </p>
            <button onClick={() => setShowAddPermit(true)}>Engedély módosítása</button>
            </div>
        ) : (
            <div>
            <p>Ehhez a rendszerhez nincs rögzítve engedély.</p>
            <button onClick={() => setShowAddPermit(true)}>Engedély hozzáadása</button>
            </div>
        )}

      <hr />
      <h3>Dokumentumok ({documents.length} db)</h3>
      {documents.length > 0 && (
          <button onClick={() => setShowDocuments(!showDocuments)}>
              {showDocuments ? 'Dokumentumok elrejtése' : 'Dokumentumok megjelenítése'}
          </button>
      )}
      {showDocuments && (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Típus</th>
              <th style={thTdStyle}>Nyilvántartási szám</th>
              <th style={thTdStyle}>Feltöltő</th>
              <th style={thTdStyle}>Dátum</th>
              <th style={thTdStyle}>Műveletek</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.document_id}>
                <td style={thTdStyle}>{doc.type}</td>
                <td style={thTdStyle}>{doc.registration_number || 'N/A'}</td>
                
                {/* --- ITT A JAVÍTÁS --- */}
                <td style={thTdStyle}>{doc.uploader?.username || 'N/A'}</td>
                
                <td style={thTdStyle}>{formatDate(doc.uploaded_at)}</td>
                <td style={thTdStyle}>
                  <button onClick={() => handleDownload(doc)} style={{marginLeft: '1rem'}}>Letöltés</button>
                  <button onClick={() => handleDeleteDocument(doc.document_id)} style={{color: 'red'}}>Törlés</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={() => setShowAddDocument(true)} style={{marginTop: '1rem'}}>Új dokumentum feltöltése</button>
      
      <hr />
      <h3>Hardverek</h3>
      {mainHardware.length > 0 ? (
        <table style={tableStyle}>
            <thead>
                <tr>
                    <th style={thTdStyle}>Típus</th>
                    <th style={thTdStyle}>Gyártó</th>
                    <th style={thTdStyle}>Modell</th>
                    <th style={thTdStyle}>Sorozatszám</th>
                    <th style={thTdStyle}>Telepítési hely</th>
                    <th style={thTdStyle}>TEMPEST Szint</th>
                    <th style={thTdStyle}>Részletek</th>
                    <th style={thTdStyle}>Műveletek</th>
                </tr>
            </thead>
            <tbody>
                {mainHardware.map(hw => (
                    <tr key={hw.hardware_id}>
                        <td style={thTdStyle}>{hw.type}</td>
                        <td style={thTdStyle}>{hw.manufacturer || 'N/A'}</td>
                        <td style={thTdStyle}>{hw.model_name}</td>
                        <td style={thTdStyle}>{hw.serial_number}</td>
                        <td style={thTdStyle}>{hw.location ? hw.location.full_address : 'N/A'}</td>
                        <td style={thTdStyle}>{hw.is_tempest ? hw.tempest_level : 'N/A'}</td>
                        <td style={thTdStyle}>
                            {(hw.is_tempest || (hw.installed_software && hw.installed_software.length > 0)) &&
                                <ExpandableRow title="Részletek">
                                    {hw.is_tempest && (
                                        <div style={{marginBottom: '1rem'}}>
                                            <strong>TEMPEST adatok:</strong>
                                            <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                                                <li>Szám: {hw.tempest_number || 'N/A'}</li>
                                                <li>Tanúsítvány szám: {hw.tempest_cert_number || 'N/A'}</li>
                                            </ul>
                                        </div>
                                    )}
                                    {hw.installed_software && hw.installed_software.length > 0 && (
                                        <div>
                                            <strong>Telepített szoftverek:</strong>
                                            <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                                                {hw.installed_software.map((sw: Software) => (
                                                    <li key={sw.software_id}>{sw.name} ({sw.version || 'N/A'})</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </ExpandableRow>
                            }
                        </td>
                        <td style={thTdStyle}>
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

      <hr />
      <h3>Adattárolók</h3>
        {storageHardware.length > 0 ? (
            <table style={tableStyle}>
                <thead>
                    <tr>
                        <th style={thTdStyle}>Szülő eszköz</th>
                        <th style={thTdStyle}>Nyilvántartási szám</th>
                        <th style={thTdStyle}>Sorozatszám</th>
                        <th style={thTdStyle}>Részletek</th>
                        <th style={thTdStyle}>Műveletek</th>
                    </tr>
                </thead>
                <tbody>
                    {storageHardware.map(hw => (
                        <tr key={hw.hardware_id}>
                            <td style={thTdStyle}>{hw.parent_hardware ? `${hw.parent_hardware.model_name} (${hw.parent_hardware.serial_number})` : 'Önálló eszköz'}</td>
                            <td style={thTdStyle}>{hw.inventory_number || 'N/A'}</td>
                            <td style={thTdStyle}>{hw.serial_number}</td>
                            <td style={thTdStyle}>
                                <ExpandableRow title="További adatok">
                                    <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
                                        <li>Típus: {hw.storage_type || 'N/A'}</li>
                                        <li>Méret: {hw.storage_size_gb ? `${hw.storage_size_gb} GB` : 'N/A'}</li>
                                        <li>Gyártó: {hw.manufacturer || 'N/A'}</li>
                                        <li>Modell: {hw.model_name}</li>
                                        <li>Telepítési hely: {hw.location ? hw.location.full_address : 'N/A'}</li>
                                    </ul>
                                </ExpandableRow>
                            </td>
                            <td style={thTdStyle}>
                                <button onClick={() => handleEditHardware(hw)}>Szerkesztés</button>
                                <button onClick={() => handleDeleteHardware(hw.hardware_id)} style={{color: 'red', marginLeft: '0.5rem'}}>Törlés</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (<p>Ehhez a rendszerhez nincsenek rögzítve dedikált adattárolók.</p>)}

      
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