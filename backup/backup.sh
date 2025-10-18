#!/bin/sh
set -e

# Mentési könyvtárak a konténeren belül
BASE_DIR="/backups"
DAILY_DIR="$BASE_DIR/daily"
WEEKLY_DIR="$BASE_DIR/weekly"
MONTHLY_DIR="$BASE_DIR/monthly"

# Mappák létrehozása, ha nem léteznek
mkdir -p "$DAILY_DIR" "$WEEKLY_DIR" "$MONTHLY_DIR"

# Dátum változók
DAY_OF_WEEK=$(date +"%u") # 1-7 (Hétfő=1)
DAY_OF_MONTH=$(date +"%d") # 01-31
DATE=$(date +"%Y-%m-%d")

# A napi mentés fájlneve
DAILY_FILE="$DAILY_DIR/daily_backup_$DATE.sql.gz"

echo "Napi adatbázis mentés indítása: $DAILY_FILE"
mysqldump -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" | gzip > "$DAILY_FILE"
echo "Napi mentés sikeres."

# Heti mentés (minden vasárnap, ha a nap sorszáma 7)
if [ "$DAY_OF_WEEK" = "7" ]; then
  WEEKLY_FILE="$WEEKLY_DIR/weekly_backup_$DATE.sql.gz"
  echo "Heti mentés készítése..."
  cp "$DAILY_FILE" "$WEEKLY_FILE"
  echo "Heti mentés sikeres: $WEEKLY_FILE"
fi

# Havi mentés (minden hónap 1. napján az előző havi mentés)
# (Egyszerűbb a hónap első napján másolni, mint az utolsót kiszámolni)
if [ "$DAY_OF_MONTH" = "01" ]; then
  MONTHLY_FILE="$MONTHLY_DIR/monthly_backup_$DATE.sql.gz"
  echo "Havi mentés készítése..."
  cp "$DAILY_FILE" "$MONTHLY_FILE"
  echo "Havi mentés sikeres: $MONTHLY_FILE"
fi

echo "Régi mentések törlése..."
# 7 napnál régebbi napi mentések törlése
find "$DAILY_DIR" -name "*.sql.gz" -type f -mtime +7 -delete
# 5 hétnél (35 napnál) régebbi heti mentések törlése
find "$WEEKLY_DIR" -name "*.sql.gz" -type f -mtime +35 -delete
# 12 hónapnál (365 napnál) régebbi havi mentések törlése
find "$MONTHLY_DIR" -name "*.sql.gz" -type f -mtime +365 -delete
echo "Takarítás befejezve."