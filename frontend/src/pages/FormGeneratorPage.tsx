// mrmnew/frontend/src/pages/FormGeneratorPage.tsx

import { useState, useEffect, FormEvent } from 'react';
import { getPersonel, getSystems, createAccessRequest, generateAccessRequestPdfAndTicket } from '../services/api.service';
import { AccessLevel } from '../types';
import { saveAs } from 'file-saver';

// --- ÚJ TÍPUSOK ---
interface Personel {
  personel_id: number;
  nev: string;
  personal_security_data: {
    beosztas: string | null;
    rendfokozat: string | null; // Rendfokozat hozzáadása
  };
}

interface System {
  systemid: number;
  systemname: string;
}

enum MuveletTipus {
  Letrehozas = 'Létrehozás',
  Modositas = 'Módosítás',
  Torles = 'Törlés',
}

interface UserOperation {
  personelId: number;
  muvelet: MuveletTipus;
  accessLevel: AccessLevel;
  telefonszam: string;
  megjegyzes: string;
}

export function FormGeneratorPage() {
  const [personelList, setPersonelList] = useState<Personel[]>([]);
  const [systemList, setSystemList] = useState<System[]>([]);

  // Általános űrlap adatok
  const [nyilvantartasiSzam, setNyilvantartasiSzam] = useState('');
  const [felelosSzervezet, setFelelosSzervezet] = useState('MH LMVIK');
  const [systemId, setSystemId] = useState<string>('');
  const [telepitesiHely, setTelepitesiHely] = useState('');
  const [formMegjegyzes, setFormMegjegyzes] = useState('');
  const [ugyintezo, setUgyintezo] = useState('');
  const [kapja1, setKapja1] = useState('Irattár');
  const [kapja2, setKapja2] = useState('');

  const [usersToRequest, setUsersToRequest] = useState<UserOperation[]>([
    { personelId: 0, muvelet: MuveletTipus.Letrehozas, accessLevel: AccessLevel.USER, telefonszam: '', megjegyzes: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [personelRes, systemRes] = await Promise.all([getPersonel(), getSystems()]);
        setPersonelList(personelRes.data);
        setSystemList(systemRes.data);
      } catch (err) {
        setError("Az adatok betöltése sikertelen.");
      }
    };
    loadInitialData();
  }, []);

  const handleUserChange = (index: number, field: keyof UserOperation, value: any) => {
    const updatedUsers = [...usersToRequest];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setUsersToRequest(updatedUsers);
  };

  const addUserRow = () => {
    setUsersToRequest([...usersToRequest, { personelId: 0, muvelet: MuveletTipus.Letrehozas, accessLevel: AccessLevel.USER, telefonszam: '', megjegyzes: '' }]);
  };

  const removeUserRow = (index: number) => {
    setUsersToRequest(usersToRequest.filter((_, i) => i !== index));
  };
  
  const getPersonelInfo = (personelId: number, field: 'beosztas' | 'rendfokozat') => {
    const personel = personelList.find(p => p.personel_id === personelId);
    if (!personel) return 'N/A';
    return personel.personal_security_data?.[field] || 'N/A';
  }
  
  // --- DIGITÁLIS FOLYAMAT INDÍTÁSA ---
  const handleDigitalSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!systemId || usersToRequest.some(u => !u.personelId)) {
        setError('Kérlek válassz rendszert és minden sorban személyt!');
        return;
    }
    setLoading(true);

    try {
      // Minden egyes sorra külön elküldjük a digitális kérelmet
      for (const userReq of usersToRequest) {
        await createAccessRequest({
          personelId: userReq.personelId,
          systemId: Number(systemId),
          accessLevel: userReq.accessLevel,
        });
      }
      setSuccess(`${usersToRequest.length} db hozzáférési kérelem sikeresen elküldve jóváhagyásra.`);
      // Reseteljük az űrlapot
      setUsersToRequest([{ personelId: 0, muvelet: MuveletTipus.Letrehozas, accessLevel: AccessLevel.USER, telefonszam: '', megjegyzes: '' }]);
      setSystemId('');

    } catch (err: any) {
        setError(err.response?.data?.message || 'Hiba a kérelem elküldése közben.');
    } finally {
        setLoading(false);
    }
  };
  
  // --- PDF FOLYAMAT INDÍTÁSA ---
  const handleGeneratePdf = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!systemId || usersToRequest.some(u => !u.personelId) || !nyilvantartasiSzam || !ugyintezo || !kapja1 || !kapja2) {
        setError('Kérlek töltsd ki az összes kötelező mezőt a PDF generálásához!');
        return;
    }
    
    setLoading(true);

    const payload = {
        nyilvantartasi_szam: nyilvantartasiSzam,
        felelos_szervezet: felelosSzervezet,
        systemId: Number(systemId),
        telepitesi_hely: telepitesiHely,
        form_megjegyzes: formMegjegyzes,
        ugyintezo,
        kapja_1: kapja1,
        kapja_2: kapja2,
        users: usersToRequest,
    };

    try {
        const response = await generateAccessRequestPdfAndTicket(payload);
        const blob = new Blob([response.data], { type: 'application/pdf' });
        saveAs(blob, `hozzaferesi_kerelem_${systemId}.pdf`);
        setSuccess('PDF sikeresen legenerálva és a követő ticket létrehozva az RBF számára.');
    } catch (err) {
        setError('Hiba a PDF generálása közben.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div>
      <h1>Új Hozzáférési Kérelem</h1>
      <p>Válasszon a két folyamat közül: a digitális jóváhagyás belső, míg a PDF generálás külső rendszeradminisztrátor esetén használatos.</p>
      
      {/* A két gomb két külön form-ban van, hogy a 'required' attribútumok megfelelően működjenek */}
      
      <form onSubmit={handleDigitalSubmit}>
        {/* Közös mezők mindkét folyamathoz */}
        <fieldset>
            <legend>Alapvető adatok</legend>
             <div><label>Rendszer *</label><select value={systemId} onChange={e => setSystemId(e.target.value)} required><option value="">-- Válasszon --</option>{systemList.map(s => <option key={s.systemid} value={s.systemid}>{s.systemname}</option>)}</select></div>
        </fieldset>
        
        <fieldset>
            <legend>Igényelt Hozzáférések</legend>
            {usersToRequest.map((user, index) => (
                <div key={index} style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <strong>{index + 1}. Személy</strong>
                      {usersToRequest.length > 1 && <button type="button" onClick={() => removeUserRow(index)} style={{color: 'red'}}>Sor törlése</button>}
                    </div>
                     <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem'}}>
                      <div><label>Név, rendfokozat *</label><select value={user.personelId} onChange={e => handleUserChange(index, 'personelId', Number(e.target.value))} required><option value={0}>-- Válasszon --</option>{personelList.map(p => <option key={p.personel_id} value={p.personel_id}>{p.nev}, {p.personal_security_data?.rendfokozat || ''}</option>)}</select></div>
                      <div><label>Beosztás</label><input type="text" value={getPersonelInfo(user.personelId, 'beosztas')} disabled /></div>
                      <div><label>Jogosultság *</label><select value={user.accessLevel} onChange={e => handleUserChange(index, 'accessLevel', e.target.value)}>{Object.values(AccessLevel).map(level => <option key={level} value={level}>{level.toUpperCase()}</option>)}</select></div>
                    </div>
                </div>
            ))}
            <button type="button" onClick={addUserRow}>+ Új személy hozzáadása</button>
        </fieldset>
        
        <button type="submit" disabled={loading} style={{width: '100%', padding: '0.8rem', fontSize: '1.1rem', marginTop: '1rem'}}>
          Kérelem Indítása (Digitális Jóváhagyás)
        </button>
      </form>

      <hr style={{margin: '2rem 0'}}/>

      <form onSubmit={handleGeneratePdf}>
        <h2>PDF Generálása (Külső RA)</h2>
        <fieldset>
            <legend>PDF Specifikus Adatok</legend>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
              <div><label>Nyilvántartási szám *</label><input type="text" value={nyilvantartasiSzam} onChange={e => setNyilvantartasiSzam(e.target.value)} required /></div>
              <div><label>Felelős szervezet *</label><input type="text" value={felelosSzervezet} onChange={e => setFelelosSzervezet(e.target.value)} required /></div>
              <div><label>Telepítési hely</label><input type="text" value={telepitesiHely} onChange={e => setTelepitesiHely(e.target.value)} /></div>
              <div style={{gridColumn: '1 / -1'}}><label>Űrlap megjegyzés</label><textarea rows={3} value={formMegjegyzes} onChange={e => setFormMegjegyzes(e.target.value)} /></div>
              <div><label>Ügyintéző (tel.) *</label><input type="text" value={ugyintezo} onChange={e => setUgyintezo(e.target.value)} required /></div>
              <div><label>Kapja (1. pld.) *</label><input type="text" value={kapja1} onChange={e => setKapja1(e.target.value)} required /></div>
              <div><label>Kapja (2. pld.) *</label><input type="text" value={kapja2} onChange={e => setKapja2(e.target.value)} required /></div>
            </div>
        </fieldset>
        
        {/* Itt a felhasználói sorokhoz is kellenek a PDF-specifikus mezők */}
        <fieldset>
            <legend>Igényelt Hozzáférések (PDF adatok)</legend>
            {usersToRequest.map((user, index) => (
                <div key={index} style={{ borderBottom: '1px solid #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <strong>{index + 1}. Személy</strong>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem'}}>
                        <div><label>Művelet *</label><select value={user.muvelet} onChange={e => handleUserChange(index, 'muvelet', e.target.value)}><option value={MuveletTipus.Letrehozas}>L - Létrehozás</option><option value={MuveletTipus.Modositas}>M - Módosítás</option><option value={MuveletTipus.Torles}>T - Törlés</option></select></div>
                        <div><label>Telefonszám</label><input type="text" value={user.telefonszam} onChange={e => handleUserChange(index, 'telefonszam', e.target.value)} /></div>
                        <div style={{gridColumn: '1 / -1'}}><label>Megjegyzés</label><input type="text" value={user.megjegyzes} onChange={e => handleUserChange(index, 'megjegyzes', e.target.value)} /></div>
                    </div>
                </div>
             ))}
        </fieldset>

        <button type="submit" disabled={loading} style={{width: '100%', padding: '0.8rem', fontSize: '1.1rem', marginTop: '1rem', backgroundColor: '#6c757d', color: 'white'}}>
            PDF Generálása
        </button>
      </form>
      
      {error && <p style={{color: 'red', marginTop: '1rem'}}>{error}</p>}
      {success && <p style={{color: 'green', marginTop: '1rem'}}>{success}</p>}
    </div>
  );
}