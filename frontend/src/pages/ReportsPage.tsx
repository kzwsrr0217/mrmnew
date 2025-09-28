// mrmnew/frontend/src/pages/ReportsPage.tsx

import { useState, useEffect } from 'react';
import { getExpiringCertificates, getExpiringPermits, getAccessReport, getPersonel, getSystems } from '../services/api.service';
import { formatDate } from '../utils/date.utils';

// Tanúsítvány riport sorának típusa
interface ExpiringCertificateReportRow {
  nev: string;
  rendfokozat: string;
  beosztas: string;
  szbt_lejarat: string;
  nato_lejarat: string;
  eu_lejarat: string;
}

// ÚJ: Rendszerengedély riport sorának típusa
interface ExpiringPermitReportRow {
    systemname: string;
    status: string;
    engedely_szam: string;
    ervenyesseg_datuma: string;
}
interface Personel { personel_id: number; nev: string; }
interface System { systemid: number; systemname: string; }
interface AccessReportRow {
    personel_nev: string;
    system_name: string;
    access_level: string;
}

export function ReportsPage() {
  // Lejáró tanúsítványok állapota (változatlan)
  const [certMonths, setCertMonths] = useState<number>(6);
  const [certResults, setCertResults] = useState<ExpiringCertificateReportRow[]>([]);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  // Lejáró engedélyek állapota (változatlan)
  const [permitMonths, setPermitMonths] = useState<number>(3);
  const [permitResults, setPermitResults] = useState<ExpiringPermitReportRow[]>([]);
  const [permitLoading, setPermitLoading] = useState(false);
  const [permitError, setPermitError] = useState<string | null>(null);

  // --- ÚJ ÁLLAPOTOK A HOZZÁFÉRÉSI JELENTÉSHEZ ---
  const [personelList, setPersonelList] = useState<Personel[]>([]);
  const [systemList, setSystemList] = useState<System[]>([]);
  const [selectedPersonelId, setSelectedPersonelId] = useState<string>('');
  const [selectedSystemId, setSelectedSystemId] = useState<string>('');
  const [accessResults, setAccessResults] = useState<AccessReportRow[]>([]);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  // A legördülő menük adatainak betöltése
  useEffect(() => {
    Promise.all([getPersonel(), getSystems()]).then(([personelRes, systemRes]) => {
        setPersonelList(personelRes.data);
        setSystemList(systemRes.data);
    }).catch(() => {
        setAccessError('A szűrőkhöz szükséges adatok betöltése sikertelen.');
    });
  }, []);

  const handleGenerateCertReport = async () => {
    setCertLoading(true);
    setCertError(null);
    setCertResults([]);
    try {
      const response = await getExpiringCertificates(certMonths);
      setCertResults(response.data);
    } catch (err) {
      setCertError('A tanúsítvány jelentés lekérdezése sikertelen.');
    } finally {
      setCertLoading(false);
    }
  };

  // ÚJ FÜGGVÉNY a rendszerengedély riport generálásához
  const handleGeneratePermitReport = async () => {
    setPermitLoading(true);
    setPermitError(null);
    setPermitResults([]);
    try {
      const response = await getExpiringPermits(permitMonths);
      setPermitResults(response.data);
    } catch (err) {
      setPermitError('A rendszerengedély jelentés lekérdezése sikertelen.');
    } finally {
      setPermitLoading(false);
    }
  };
 
  // --- ÚJ FÜGGVÉNY a hozzáférési riport generálásához ---
  const handleGenerateAccessReport = async () => {
    setAccessLoading(true);
    setAccessError(null);
    setAccessResults([]);
    try {
      const params = {
        personelId: selectedPersonelId ? Number(selectedPersonelId) : undefined,
        systemId: selectedSystemId ? Number(selectedSystemId) : undefined,
      };
      const response = await getAccessReport(params);
      setAccessResults(response.data);
    } catch (err) {
      setAccessError('A hozzáférési jelentés lekérdezése sikertelen.');
    } finally {
      setAccessLoading(false);
    }
  };  



  return (
    <div>
      <h1>Jelentések</h1>

      {/* --- HOZZÁFÉRÉSI JELENTÉS SZEKCIÓ --- */}
      <hr style={{ marginTop: '2rem' }}/>
      <h3>Hozzáférési Jelentés</h3>
      <p>Válasszon egy személyt vagy egy rendszert a szűkítéshez. Ha egyiket sem választja, minden hozzáférést listáz.</p>
      <div className="report-controls">
        <label>Személy:</label>
        <select value={selectedPersonelId} onChange={(e) => {setSelectedPersonelId(e.target.value); setSelectedSystemId('');}}>
            <option value="">-- Mindenki --</option>
            {personelList.map(p => <option key={p.personel_id} value={p.personel_id}>{p.nev}</option>)}
        </select>
        <label>Rendszer:</label>
        <select value={selectedSystemId} onChange={(e) => {setSelectedSystemId(e.target.value); setSelectedPersonelId('');}}>
            <option value="">-- Összes rendszer --</option>
            {systemList.map(s => <option key={s.systemid} value={s.systemid}>{s.systemname}</option>)}
        </select>
        <button onClick={handleGenerateAccessReport} disabled={accessLoading}>
          {accessLoading ? 'Generálás...' : 'Jelentés készítése'}
        </button>
      </div>

      {accessError && <p style={{ color: 'red' }}>{accessError}</p>}

      {accessResults.length > 0 && (
        <table className="personel-table" style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th>Személy neve</th>
              <th>Rendszer neve</th>
              <th>Jogosultság</th>
            </tr>
          </thead>
          <tbody>
            {accessResults.map((row, index) => (
              <tr key={index}>
                <td>{row.personel_nev}</td>
                <td>{row.system_name}</td>
                <td>{row.access_level.toUpperCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      
      {/* --- Lejáró Rendszerengedélyek Szekció --- */}
      <hr style={{ marginTop: '2rem' }}/>
      <h3>Lejáró Rendszerengedélyek</h3>
      <div className="report-controls">
        <label htmlFor="permit-months-input">Hónapok száma:</label>
        <input
          id="permit-months-input"
          type="number"
          value={permitMonths}
          onChange={(e) => setPermitMonths(Number(e.target.value))}
          min="1"
        />
        <button onClick={handleGeneratePermitReport} disabled={permitLoading}>
          {permitLoading ? 'Generálás...' : 'Jelentés készítése'}
        </button>
      </div>

      {permitError && <p style={{ color: 'red' }}>{permitError}</p>}

      {permitResults.length > 0 && (
        <table className="personel-table" style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th>Rendszer neve</th>
              <th>Státusz</th>
              <th>Engedély száma</th>
              <th>Lejárat dátuma</th>
            </tr>
          </thead>
          <tbody>
            {permitResults.map((row, index) => (
              <tr key={index}>
                <td>{row.systemname}</td>
                <td>{row.status}</td>
                <td>{row.engedely_szam}</td>
                <td>{formatDate(row.ervenyesseg_datuma)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Lejáró Tanúsítványok Szekció --- */}
      <hr style={{ marginTop: '2rem' }}/>
      <h3>Lejáró Személyi Biztonsági Tanúsítványok</h3>
      <div className="report-controls">
        <label htmlFor="cert-months-input">Hónapok száma:</label>
        <input
          id="cert-months-input"
          type="number"
          value={certMonths}
          onChange={(e) => setCertMonths(Number(e.target.value))}
          min="1"
        />
        <button onClick={handleGenerateCertReport} disabled={certLoading}>
          {certLoading ? 'Generálás...' : 'Jelentés készítése'}
        </button>
      </div>

      {certError && <p style={{ color: 'red' }}>{certError}</p>}

      {certResults.length > 0 && (
        <table className="personel-table" style={{ marginTop: '2rem' }}>
          <thead>
            <tr>
              <th>Név</th>
              <th>Rendfokozat</th>
              <th>Beosztás</th>
              <th>Nemzeti lejárata</th>
              <th>NATO lejárata</th>
              <th>EU lejárata</th>
            </tr>
          </thead>
          <tbody>
            {certResults.map((row, index) => (
              <tr key={index}>
                <td>{row.nev}</td>
                <td>{row.rendfokozat || 'N/A'}</td>
                <td>{row.beosztas || 'N/A'}</td>
                <td>{formatDate(row.szbt_lejarat)}</td>
                <td>{formatDate(row.nato_lejarat)}</td>
                <td>{formatDate(row.eu_lejarat)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}