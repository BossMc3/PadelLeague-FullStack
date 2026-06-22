# 🏓 PadelLeague

> **Uită de grupurile de WhatsApp. Uită de bracket-urile pe hârtie. PadelLeague e here.**

O platformă full-stack construită în cadrul unui hackathon pentru a organiza turnee și ligi de padel — cu bracket-uri live, clasamente în timp real și un sistem ELO real.

---

## ✨ Features

### 🎯 Core
- 🏆 **Creare & management turnee** — Single Elimination și Round-Robin, generat automat
- 👥 **Înregistrare echipe** — Padel e dublu, deci echipe de 2 jucători
- 📊 **Clasamente live** — Victorii, seturi, puncte, toate la zi
- 🎾 **Bracket vizual** — Vezi progresul turneului în timp real
- 🔐 **Autentificare JWT** — Roluri separate pentru Organizer și Spectator
- 📧 **Reset parolă prin email** — Flow complet de forgot/reset password

### ⚡ Bonus
- 📡 **Live updates** — SSE (Server-Sent Events) pentru scoruri live fără refresh
- 🧮 **Sistem ELO** — Rating-ul jucătorilor se actualizează automat după fiecare meci
- 👤 **Profiluri jucători** — Statistici complete: victorii, seturi, puncte, ELO history
- 👁️ **View spectator public** — Fără cont, fără login, direct la acțiune

---

## 🛠️ Tech Stack

| Layer | Tehnologie |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Backend** | Spring Boot 4 + Spring Data JPA + Spring Security |
| **Auth** | JWT (jjwt 0.11.5) |
| **Database** | PostgreSQL (via Supabase) |
| **Real-time** | Server-Sent Events (SSE) |
| **Email** | Spring Mail + Thymeleaf templates |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |

---

## 🏗️ Arhitectură

```
PadelLeague
├── frontend/          # Next.js app (port 3000)
│   └── src/
│       ├── app/       # App Router pages & routes
│       ├── components/# React components reutilizabile
│       ├── context/   # React Context (auth state)
│       ├── lib/       # API clients & utilities
│       └── types/     # TypeScript type definitions
│
└── liga-backend/      # Spring Boot API (port 8080)
    └── src/main/java/
        └── ro/ddc/liga/
```

---

## 🗂️ Data Model

```
Player ──┐
         ├──► Team ──► Match ──► Tournament
Player ──┘
```

- **Player** — id, name, email, elo_rating, total_wins, total_losses
- **Tournament** — id, name, format (SINGLE_ELIMINATION / ROUND_ROBIN), status (DRAFT / ONGOING / COMPLETED)
- **Team** — id, tournament_id, player1_id, player2_id
- **Match** — id, tournament_id, team1_id, team2_id, scoruri, winner_id, round_number, status

---

## 🔌 API Contract

**Base URL:** `http://localhost:8080/api`

| Method | Endpoint | Descriere |
|--------|----------|-----------|
| `POST` | `/auth/login` | Login cu email + parolă, returnează JWT |
| `POST` | `/auth/register` | Înregistrare cont nou |
| `POST` | `/auth/forgot-password` | Trimite email de reset |
| `POST` | `/auth/reset-password` | Resetare parolă cu token |

**Response login/register:**
```json
{
  "token": "jwt-token",
  "email": "user@example.com",
  "role": "ROLE_USER"
}
```

> Roluri disponibile: `ROLE_USER` | `ROLE_ADMIN`

---

## 👤 Roluri & Acces

| Feature | Spectator (public) | Player | Organizer (Admin) |
|---------|:-----------------:|:------:|:-----------------:|
| Vezi bracket-uri | ✅ | ✅ | ✅ |
| Vezi clasamente | ✅ | ✅ | ✅ |
| Live scores | ✅ | ✅ | ✅ |
| Profil jucător | ❌ | ✅ | ✅ |
| Creare turneu | ❌ | ❌ | ✅ |
| Adăugare echipe | ❌ | ❌ | ✅ |
| Introducere scoruri | ❌ | ❌ | ✅ |

---

## 🧠 Algoritmi implementați

### Bracket Generation
- **Single Elimination** — generare automată arbore de meciuri, avansare automată a câștigătorului
- **Round-Robin** — fiecare echipă joacă contra tuturor celorlalte, clasament pe puncte

### ELO Rating
Rating-ul se calculează automat după fiecare meci finalizat:
```
E_A = 1 / (1 + 10^((R_B - R_A) / 400))
R_A' = R_A + K * (S_A - E_A)
```
unde `K = 32` și `S_A` este 1 (victorie) sau 0 (înfrângere).

---

## 🔒 Securitate

- Autentificare stateless cu **JWT Bearer tokens**
- Parole hashuite cu **BCrypt**
- **CORS** configurat pentru `localhost:3000`
- Endpoint-uri publice (spectator view) fără autentificare
- Endpoint-uri admin protejate cu `@PreAuthorize("hasRole('ADMIN')")`

---

## 🐳 Docker

Backend-ul vine cu `Dockerfile` inclus:

```dockerfile
# liga-backend/Dockerfile
```

---

<div align="center">
  <strong>PadelLeague</strong> — Because your tournament deserves better than a WhatsApp group.
</div>
