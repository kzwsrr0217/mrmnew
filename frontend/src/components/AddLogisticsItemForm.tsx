// mrmnew/frontend/src/components/AddLogisticsItemForm.tsx

import { useState, FormEvent } from 'react';
import { createLogisticsItem } from '../services/api.service';

enum LogisticsItemType {
  ESZKOZ = 'Eszköz',
  KESZLET = 'Készlet',
}

export function AddLogisticsItemForm({ onSuccess, onCancel }: { onSuccess: () => void, onCancel: () => void }) {
    const [type, setType] = useState<LogisticsItemType>(LogisticsItemType.ESZKOZ);
    const [name, setName] = useState('');
    const [logisticsId, setLogisticsId] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [location, setLocation] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent) => { 
        event.preventDefault();
        setError(null);
        try {
            await createLogisticsItem({
                type, name, logistics_id: logisticsId, serial_number: serialNumber, quantity, location
            });
            onSuccess();
        } catch(err: any) {
            setError(err.response?.data?.message || 'Hiba a tétel létrehozása közben.');
        }
    };
    
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <form onSubmit={handleSubmit}>
                    <h3>Új logisztikai tétel rögzítése</h3>
                    {error && <p style={{color: 'red'}}>{error}</p>}

                    <div><label>Típus:</label><select value={type} onChange={e => setType(e.target.value as LogisticsItemType)}><option value={LogisticsItemType.ESZKOZ}>Eszköz</option><option value={LogisticsItemType.KESZLET}>Készlet</option></select></div>
                    <div><label>Megnevezés:</label><input type="text" value={name} onChange={e => setName(e.target.value)} required /></div>
                    <div><label>Hely:</label><input type="text" value={location} onChange={e => setLocation(e.target.value)} required /></div>
                    <div><label>Mennyiség:</label><input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required min="1" /></div>
                    
                    {type === LogisticsItemType.ESZKOZ && (
                        <>
                            <div><label>Gyári szám:</label><input type="text" value={serialNumber} onChange={e => setSerialNumber(e.target.value)} /></div>
                            <div><label>HETK Kód:</label><input type="text" value={logisticsId} onChange={e => setLogisticsId(e.target.value)} /></div>
                        </>
                    )}
                    
                    <button type="submit">Mentés</button>
                    <button type="button" onClick={onCancel}>Mégse</button>
                </form>
            </div>
        </div>
    );
}