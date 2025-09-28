# mrm-backend/Dockerfile

# Használj egy frissebb Node.js verziót, ami a NestJS-hez is jó
FROM node:22-alpine

# A konténeren belüli munkakönyvtár beállítása
WORKDIR /usr/src/app

# Először csak a package.json fájlokat másoljuk, hogy a Docker cache-t ki tudjuk használni
COPY package*.json ./

# ==================== A JAVÍTÁS ====================
# Kifejezetten beállítjuk a környezetet 'development'-re a build idejére.
# Ez garantálja, hogy a devDependencies is telepítésre kerüljenek,
# felülírva bármilyen más rejtett beállítást.
ENV NODE_ENV=development
# ===================================================

# Függőségek telepítése
RUN npm install

# Az összes többi forrásfájl bemásolása
COPY . .

# Az alkalmazás indítása fejlesztői módban
CMD ["npm", "run", "start:dev"]
