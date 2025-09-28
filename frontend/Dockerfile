# mrm-frontend/Dockerfile

# Használjuk ugyanazt a friss Node.js verziót
FROM node:22-alpine

# Munkakönyvtár beállítása
WORKDIR /usr/src/app

# A cache kihasználása érdekében először a package.json fájlokat másoljuk
COPY package*.json ./

# Függőségek telepítése
RUN npm install

# A forráskód többi részének bemásolása
COPY . .

# A fejlesztői szerver indítása. A --host kulcsfontosságú!
CMD ["npm", "run", "dev", "--", "--host"]