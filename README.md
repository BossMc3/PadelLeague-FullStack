# 🎾 PadelLeague — Full-Stack Platform for Real-Time Padel Tournament Management

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-green?logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-Educational-lightgrey)

PadelLeague is a modern **full-stack tournament management platform** built as a complete digital ecosystem for organizing, managing, and tracking **padel competitions in real time**.

The platform follows a **decoupled Client–Server architecture (Monorepo)** consisting of:

* ⚡ **Next.js Frontend**
* 🔐 **Spring Boot Backend**
* ☁️ **Cloud-hosted PostgreSQL database (Supabase)**

It delivers tournament automation, live scoring, authentication workflows, ELO ranking, and real-time standings updates.

---

# 📸 Application Preview

## Landing Page & User Dashboard

|             Landing Page            |            User Dashboard           |
| :---------------------------------: | :---------------------------------: |
| ![](./screenshots/landing-page.png) | ![](./screenshots/user-profile.png) |

## Tournament View & Email Verification

|            Active Tournaments           |             OTP Verification             |
| :-------------------------------------: | :--------------------------------------: |
| ![](./screenshots/tournaments-list.png) | ![](./screenshots/auth-verify-email.png) |

---

# ✨ Features

## 🏆 Tournament Management

### Automated Tournament Generation

* Automatic bracket creation
* Supports:

  * **Single Elimination**
  * **Round Robin**

### Team Registration System

* Seamless registration process
* Supports **2-player teams**
* Direct enrollment into active tournaments

### Dynamic ELO Ranking

* Automatic player rating recalculation
* Updates instantly after match completion

### Real-Time Standings

Track:

* Wins
* Losses
* Sets won
* Overall ranking points

---

## 🔐 Authentication & Security

### Stateless Authentication

* JWT-based authentication
* Role-based authorization

Supported roles:

```text
ROLE_USER
ROLE_ADMIN
ROLE_ORGANIZER
```

### Secure Email Workflows

Supports:

* OTP Email Verification
* Password Recovery
* Password Reset

Built with:

* Spring Mail
* Thymeleaf Email Templates

---

## ⚡ Live Features

### Real-Time Match Scores

Implemented using:

```text
Server-Sent Events (SSE)
```

Features:

* Instant updates
* No manual refresh
* Live spectator experience

---

# 🛠 Tech Stack

## 🎨 Frontend

| Technology      | Purpose               |
| --------------- | --------------------- |
| Next.js 16      | Application Framework |
| React 19        | UI Library            |
| TypeScript      | Type Safety           |
| Tailwind CSS v4 | Styling               |
| Axios           | API Communication     |

---

## ⚙ Backend

| Technology      | Purpose           |
| --------------- | ----------------- |
| Spring Boot 4   | Backend Framework |
| Spring Data JPA | ORM               |
| Spring Security | Authentication    |
| jjwt (0.11.5)   | JWT Management    |
| PostgreSQL      | Database          |
| Supabase        | Cloud Hosting     |
| Spring Mail     | Email Service     |

---

# 🔌 API Reference

**Base URL**

```text
http://localhost:8080/api
```

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/auth/login`           | Authenticate user and generate JWT |
| POST   | `/auth/register`        | Create new account                 |
| POST   | `/auth/forgot-password` | Send password recovery email       |
| POST   | `/auth/reset-password`  | Reset account password             |

---

# 📁 Project Structure

```bash
PadelLeague-FullStack/
│
├── frontend/                    # Next.js Client (Port 3000)
│   ├── public/
│   └── src/
│       └── app/
│
├── liga-backend/                # Spring Boot API (Port 8080)
│   ├── src/main/java/ro/ddc/liga/
│   └── Dockerfile
│
└── screenshots/
```

---

# 🚀 Local Setup

## Prerequisites

Install:

* JDK 21+
* Node.js 18+
* npm
* PostgreSQL or Supabase instance

---

## 1. Clone Repository

```bash
git clone https://github.com/USERNAME_TAU/PadelLeague-FullStack.git

cd PadelLeague-FullStack
```

---

## 2. Backend Setup (Spring Boot)

### Configure Database

Open:

```text
liga-backend/src/main/resources/application.properties
```

Update:

```properties
spring.datasource.url=jdbc:postgresql://your-host:5432/your-db
spring.datasource.username=your-user
spring.datasource.password=your-password
```

### Run Backend

```bash
cd liga-backend

./mvnw spring-boot:run
```

Windows:

```bash
mvnw spring-boot:run
```

Backend will run on:

```text
http://localhost:8080
```

---

## 3. Frontend Setup (Next.js)

Open a second terminal:

```bash
cd frontend
```

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend available at:

```text
http://localhost:3000
```

---

# 👥 Development Team

Developed in collaboration with:

### Frontend / Integration / ELO Logic

**Ciufu Alex**
GitHub → https://github.com/BossMc3

---

### Backend Development / Spring Boot

**Eusebiu Fodor**
GitHub → https://github.com/euseby

---

### Database Design / Testing

**Andrei Ciontea**
GitHub → https://github.com/anduciontea

---

# 🏅 Project Context

Built during:

**Springathon / Hackathon 2026**

---

## 📄 License

This repository is intended for **educational and portfolio purposes**.
