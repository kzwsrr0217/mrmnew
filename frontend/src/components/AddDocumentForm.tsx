import { useState, FormEvent } from 'react';
import { uploadDocument } from '../services/api.service';
import { DocumentType } from '../types'; 
import { Modal } from './Modal'; // Importáljuk a Modal komponenst

interface AddDocumentFormProps {
  systemId: number;
  onDocumentAdded: () => void;
  onCancel: () => void;
}

export function AddDocumentForm({ systemId, onDocumentAdded, onCancel }: AddDocumentFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<DocumentType>(DocumentType.EGYEB);
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('A fájl feltöltése kötelező.');
      return;
    }
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('system_id', String(systemId));
    formData.append('type', type);
    formData.append('registration_number', regNumber);

    try {
      await uploadDocument(formData);
      onDocumentAdded();
    } catch (err) {
      setError('Hiba a dokumentum feltöltése közben.');
      console.error(err);
    }
  };

  return (
    <Modal title="Új dokumentum feltöltése" onClose={onCancel}>
        <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
            <label>Típus:</label>
            <select value={type} onChange={(e) => setType(e.target.value as DocumentType)}>
            {Object.values(DocumentType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
        </div>
        <div>
            <label>Nyilvántartási szám:</label>
            <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} />
        </div>
        <div>
            <label>Fájl (PDF):</label>
            <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} required />
        </div>
        <div className="form-actions">
            <button type="button" onClick={onCancel}>Mégse</button>
            <button type="submit">Feltöltés</button>
        </div>
        </form>
    </Modal>
  );
}