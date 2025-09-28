// mrmnew/frontend/src/utils/date.utils.ts

/**
 * Dátumot formáz YYYY.MM.DD. formátumra.
 * Kezeli a string, Date, null és undefined értékeket is.
 */
export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '-';

  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}.`;
  } catch (error) {
    return 'Érvénytelen dátum';
  }
};

/**
 * Dátumot és időt formáz YYYY.MM.DD. HH:mm:ss formátumra.
 */
export const formatDateTime = (date: Date | string | null | undefined): string => {
    if (!date) return '-';

    try {
      const d = new Date(date);
      const datePart = formatDate(d); // Újrahasznosítjuk a fenti függvényt
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${datePart} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return 'Érvénytelen dátum';
    }
};