# Pehelysúlyú Alpine Linux alap
FROM alpine:latest

# Telepítjük a cron-t és a mysql klienst (a mysqldump-hoz)
RUN apk add --no-cache mysql-client busybox-suid

# Létrehozzuk a mentések mappáját
RUN mkdir /backups

# Bemásoljuk a backup scriptet a konténerbe
COPY backup.sh /usr/local/bin/backup.sh
RUN chmod +x /usr/local/bin/backup.sh

# Létrehozzuk a cron feladatot. A CRON_SCHEDULE környezeti változóból fogja olvasni az időzítést.
# A >> hozzáfűzi a sort a crontab fájlhoz.
RUN echo "$CRON_SCHEDULE /usr/local/bin/backup.sh >> /var/log/cron.log 2>&1" > /etc/crontabs/root

# Elindítjuk a cron démont az előtérben
CMD ["crond", "-f"]