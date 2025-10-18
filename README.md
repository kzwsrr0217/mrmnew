# MRM - Minősített Rendszerek Nyilvántartása

## A Projekt Célja

Ez az alkalmazás a minősített rendszerek és a kapcsolódó adminisztrációs folyamatok (hozzáférések, engedélyek, port feloldások) digitális nyilvántartására és kezelésére szolgál. Célja a papíralapú adminisztráció csökkentése és egy központi, naprakész adatbázis létrehozása.

---

## Technológiai 

-   **Backend:** NestJS (Node.js keretrendszer), TypeScript, TypeORM
-   **Frontend:** React (Vite build eszközzel), TypeScript
-   **Adatbázis:** MySQL
-   **Konténerizáció:** Docker, Docker Compose

---

## Telepítés és Indítás

A projekt elindításához a következő eszközökre van szükség a fejlesztői gépen:

-   Docker Desktop
-   Node.js (LTS verzió)

**Indítás lépései:**

1.  Klónozd a repository-t a gépedre.
2.  Navigálj a projekt gyökérkönyvtárába a terminálban.
3.  Add ki a következő parancsot az alkalmazás konténerekben történő felépítéséhez és elindításához:
    ```bash
    docker-compose up --build
    ```
4.  Az alkalmazás elindulását követően a frontend elérhető a [http://localhost:5173](http://localhost:5173) címen.

**Alapértelmezett felhasználói fiók:**
-   **Felhasználónév:** `admin`
-   **Jelszó:** `admin`

---

## Projekt Struktúra

-   `/backend`: A NestJS alapú backend alkalmazás forráskódja. Itt található az API logika és az adatbázis-kezelés.
-   `/frontend`: A React alapú frontend alkalmazás forráskódja. Ez felel a felhasználói felület megjelenítéséért.