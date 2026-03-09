# PitStopShop

## 📌 Opis aplikacije

PitStopShop je fullstack web aplikacija za online prodaju auto-delova i
opreme, sa jasno definisanim korisničkim ulogama: **customer**,
**mechanic** i **admin**.

Aplikacija omogućava: - Registraciju i prijavu korisnika (JWT
autentifikacija u HTTP-only cookie-ju) - Pregled, pretragu i filtriranje
proizvoda - Kreiranje porudžbina i praćenje statusa - Upravljanje
proizvodima (admin) - Tehničke recenzije proizvoda (mechanic) -
Administratorski dashboard sa statistikom i KPI podacima

Sistem je implementiran kao odvojeni frontend i backend servis, uz MySQL
bazu podataka.

---

## 🛠️ Tehnologije

### Backend

- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT (autentifikacija)
- bcrypt (hash lozinki)
- Multer + Cloudinary (upload slika)
- Swagger (API dokumentacija)

### Frontend

- React (Vite)
- JavaScript / JSX
- CSS / Tailwind (ukoliko se koristi)
- Vitest + React Testing Library (testovi)

### DevOps

- Docker
- Docker Compose
- GitHub Actions (CI/CD)

---

## 🚀 Lokalno pokretanje (bez Docker-a)

### 1. Kloniranje repozitorijuma

```bash
git clone <repository-url>
cd pitstopshop
```

### 2. Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

Backend će biti dostupan na:

    http://localhost:5000

Swagger dokumentacija:

    http://localhost:5000/docs

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend će biti dostupan na:

    http://localhost:5173

---

## 🐳 Pokretanje pomoću Docker-a i docker-compose-a

Aplikacija je potpuno dockerizovana i može se pokrenuti jednom komandom.

### 1. Build i pokretanje svih servisa

```bash
docker compose up --build
```

Servisi koji se pokreću: - MySQL baza (port 3306) - Backend (port 5000) - Frontend (port 5173)

### 2. Pokretanje u pozadini

```bash
docker compose up --build -d
```

### 3. Gašenje servisa

```bash
docker compose down
```

### 4. Gašenje uz brisanje baze (volume-a)

```bash
docker compose down -v
```

---

## 🔐 Bezbednost

- JWT autentifikacija u HTTP-only cookie-ju
- Role-based autorizacija (customer, mechanic, admin)
- Zaštita od IDOR napada kroz proveru vlasništva resursa
- Prisma ORM zaštita od SQL Injection napada
- CORS konfiguracija ograničena na frontend domen

---
