import { useState, useEffect } from 'react';
import { getBackups, triggerBackupNow, downloadBackup } from '../services/api.service';
import { saveAs } from 'file-saver';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function BackupsPage() {
    const [backups, setBackups] = useState<any>({ daily: [], weekly: [], monthly: [] });
    const [loading, setLoading] = useState(true);
    const [triggering, setTriggering] = useState(false);

    const fetchBackups = async () => {
        setLoading(true);
        try {
            const res = await getBackups();
            setBackups(res.data);
        } catch (error) {
            console.error("Hiba a mentések listázása közben:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBackups();
    }, []);

    const handleTriggerBackup = async () => {
        setTriggering(true);
        try {
            await triggerBackupNow();
            alert('Azonnali mentés sikeresen elindítva! A lista pár másodperc múlva frissül.');
            setTimeout(fetchBackups, 3000); // Adjunk időt a mentésnek
        } catch (error) {
            alert('Hiba történt a mentés indítása során.');
        } finally {
            setTriggering(false);
        }
    };
    
    const handleDownload = async (type: string, filename: string) => {
        try {
            const response = await downloadBackup(type, filename);
            saveAs(response.data, filename);
        } catch (error) {
            console.error('Download error:', error);
            alert('Hiba a fájl letöltése közben.');
        }
    };

    const renderBackupTable = (title: string, data: any[]) => (
        <div style={{marginBottom: '2rem'}}>
            <h3>{title} ({data.length} db)</h3>
            {data.length > 0 ? (
                <table className="bordered-table">
                    <thead><tr><th>Fájlnév</th><th>Méret</th><th>Készült</th><th>Műveletek</th></tr></thead>
                    <tbody>
                        {data.map(backup => (
                            <tr key={backup.filename}>
                                <td>{backup.filename}</td>
                                <td>{formatBytes(backup.size)}</td>
                                <td>{new Date(backup.createdAt).toLocaleString()}</td>
                                <td><button onClick={() => handleDownload(title.toLowerCase(), backup.filename)}>Letöltés</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p>Nincsenek mentések ebben a kategóriában.</p>}
        </div>
    );

    return (
        <div className="page-container">
            <h1>Adatbázis Mentések</h1>
            <p>Itt kezelheti a rendszer adatbázisáról készült biztonsági mentéseket a GFS (Nagyapa-Apa-Fiú) stratégia alapján.</p>
            <button onClick={handleTriggerBackup} disabled={triggering} style={{marginBottom: '2rem'}}>
                {triggering ? 'Mentés folyamatban...' : 'Azonnali mentés készítése'}
            </button>
            
            {loading ? <p>Mentések listázása...</p> : (
                <>
                    {renderBackupTable('Daily', backups.daily)}
                    {renderBackupTable('Weekly', backups.weekly)}
                    {renderBackupTable('Monthly', backups.monthly)}
                </>
            )}
        </div>
    );
}