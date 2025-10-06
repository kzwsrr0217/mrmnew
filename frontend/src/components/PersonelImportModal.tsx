import { useState } from 'react';
import * as XLSX from 'xlsx';
import { importPersonel } from '../services/api.service';

interface PersonelImportModalProps {
  onClose: () => void;
  onImportSuccess: () => void;
}

// Segédfüggvény az Excel sorok átalakítására
// Segédfüggvény az Excel sorok átalakítására
const transformData = (data: any[]): any[] => {
  return data.map(row => {
    // EZ A FÜGGVÉNY VÁLTOZIK
    const transformDate = (date: any): string | undefined => {
      if (!date || !(date instanceof Date)) return undefined;
      
      // Korrekció az időzóna eltolódásra, hogy a helyes napot kapjuk vissza
      // Az Excelből beolvasott dátum UTC éjfélként jön, de a new Date() helyi időzónába teszi,
      // ami visszaléptetheti egy nappal. Ez a korrekció ezt kezeli.
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset());

      // Formázás 'YYYY-MM-DD' stringgé
      return date.toISOString().split('T')[0];
    };

    return {
      nev: row['Név'] || row['nev'],
      personal_security_data: {
        beosztas: row['Beosztás'] || row['beosztas'],
        rendfokozat: row['Rendfokozat'] || row['rendfokozat'],
        titoktartasi_szam: row['Titoktartási szám'] || row['titoktartasi_szam'],
        szbt_datum: transformDate(row['SZBT dátum'] || row['szbt_datum']),
        szbt_lejarat: transformDate(row['SZBT lejárat'] || row['szbt_lejarat']),
        nato_datum: transformDate(row['NATO dátum'] || row['nato_datum']),
        nato_lejarat: transformDate(row['NATO lejárat'] || row['nato_lejarat']),
        eu_datum: transformDate(row['EU dátum'] || row['eu_datum']),
        eu_lejarat: transformDate(row['EU lejárat'] || row['eu_lejarat']),
      },
    };
  });
};

export function PersonelImportModal({ onClose, onImportSuccess }: PersonelImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      setFeedback(null); // Töröljük a korábbi visszajelzést
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      setFeedback({ type: 'error', message: 'Nincs fájl kiválasztva!' });
      return;
    }

    setIsLoading(true);
    setFeedback(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const transformedData = transformData(jsonData);

        const response = await importPersonel(transformedData);
        
        const { created, updated, errors } = response.data;
        let successMessage = `Importálás sikeres! Létrehozva: ${created}, Frissítve: ${updated}.`;
        if (errors.length > 0) {
            successMessage += `\n Hibás sorok: ${errors.join(', ')}`;
        }

        setFeedback({ type: 'success', message: successMessage });
        onImportSuccess(); // Szólunk a szülő komponensnek, hogy frissítse a listát
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Hiba történt a fájl feldolgozása vagy a szerverre küldés közben.';
        setFeedback({ type: 'error', message: `Hiba: ${errorMessage}` });
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Személyi állomány importálása Excelből</h3>
        <p>Válasszon ki egy .xlsx kiterjesztésű fájlt. A táblázatnak tartalmaznia kell a megfelelő oszlopfejléceket. <br/>A dátumokat 'YYYY-MM-DD' formátumban adja meg.</p>
        
        <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
        
        {feedback && (
          <p style={{ color: feedback.type === 'error' ? 'red' : 'green', whiteSpace: 'pre-wrap' }}>
            {feedback.message}
          </p>
        )}

        <div style={{ marginTop: '1rem' }}>
          <button onClick={handleImport} disabled={isLoading || !selectedFile}>
            {isLoading ? 'Importálás...' : 'Importálás'}
          </button>
          <button onClick={onClose} disabled={isLoading}>Mégse</button>
        </div>
      </div>
    </div>
  );
}