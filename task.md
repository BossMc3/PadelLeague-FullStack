# Project: PadelLeague (Hackathon Challenge)

## 1. Project Overview
Build a "PadelLeague" platform to organize padel tournaments and leagues. The platform will replace messy WhatsApp groups and manual paper brackets by automating tournament creation, bracket management, score updates, and providing a live feed of standings.

## 2. Tech Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS.
- **Backend:** Java with Spring Boot (REST API, Spring Data JPA).
- **Database:** PostgreSQL (hosted on Supabase - use standard JDBC connection).
- **Real-time (Bonus):** WebSockets / Server-Sent Events (SSE) via Spring Boot.

## 3. Hackathon Scoring & Objectives (Prioritize These!)
The agent must design and build the application to maximize points across these criteria:
- **Data Model (10 pts):** Needs a robust, normalized PostgreSQL schema.
- **Core Features (30 pts):** Registration, bracket/round-robin generation, score entry, player profiles.
- **UX & Clarity (25 pts):** Clear distinction between "Organizer" (admin) and "Player/Spectator" (public) views. High-quality UI for brackets.
- **Bonus (15 pts):** WebSockets for live scores, basic ELO algorithm, public spectator view.

## 4. Architecture & Directory Structure
Please structure the workspace into two main directories:
- `/frontend` (Next.js project)
- `/backend` (Spring Boot project)

---

## 5. Execution Phases (Step-by-Step Instructions for the Agent)

### PHASE 1: Data Model & Backend Foundation (High Priority - 10 Tech Pts)
1. **Design the PostgreSQL Schema (Spring Data JPA Entities):**
   - `User` / `Player`: id, name, email, elo_rating, total_wins, total_losses.
   - `Tournament`: id, name, format (SINGLE_ELIMINATION, ROUND_ROBIN), status (DRAFT, ONGOING, COMPLETED).
   - `Team`: id, tournament_id, player1_id, player2_id (since Padel is doubles).
   - `Match`: id, tournament_id, team1_id, team2_id, score_team1, score_team2, winner_id, round_number, status (SCHEDULED, IN_PROGRESS, COMPLETED).
2. Create standard CRUD REST RESTful Controllers and Services for these entities.
3. Ensure CORS is configured in Spring Boot to allow requests from the Next.js frontend.

### PHASE 2: Core Frontend Views & UX (15 UX Pts)
Implement distinct layouts and routing in Next.js:
1. **Organizer Dashboard (`/organizer/...`):**
   - Create Tournament form.
   - Register Teams/Players to a tournament.
   - **Score Entry Interface:** A simple, fast UI to update match scores.
2. **Public Spectator View (`/tournament/[id]`):**
   - Read-only public view.
   - Display Live Brackets (use a clean CSS grid or a React bracket library).
   - Display Standings Table (Wins, Sets, Points).
   - *Requirement:* No login required for spectator view (Bonus - 3 pts).

### PHASE 3: The Engine - Brackets & Round-Robin (10 Core Pts)
1. **Bracket Generation Algorithm (Backend):** - Write a Spring Boot service to automatically generate matches based on registered teams.
   - Support Single Elimination (create tree structure of matches).
   - Support Round-Robin (every team plays every other team).
2. **Match Advancement Logic:**
   - When an Organizer submits a score for a Match, the backend must automatically advance the winning Team to the next round in the Bracket.

### PHASE 4: Bonus Features (Real-time & ELO)
1. **Live Updates (5 Bonus Pts):**
   - Implement SSE (Server-Sent Events) or WebSockets in Spring Boot.
   - When a score is updated via the Organizer Dashboard, push the update so the Next.js Public Spectator view updates instantly without refreshing.
2. **ELO / Ranking System (4 Bonus Pts):**
   - Implement a basic ELO calculation in the backend `MatchService`. After a match is COMPLETED, adjust the `elo_rating` of the participating players based on the result.
3. **Player Profiles (5 Core Pts):**
   - Create a `/player/[id]` page in Next.js showing historical stats (wins, sets, points, ELO history).

## 6. Development Rules for the Agent
- **No mock data in final views:** The frontend must consume the Spring Boot APIs.
- **Componentization:** Keep React components small (e.g., `<MatchCard />`, `<BracketColumn />`, `<StandingsTable />`).
- **Styling:** Use Tailwind CSS for a clean, modern sports-app aesthetic. Use distinct color schemes to differentiate Organizer mode (e.g., dark mode/admin feel) vs Public mode (bright, accessible).
- **Error Handling:** Ensure no crashes on malformed data (Stability - 7 Tech Pts). Always wrap API calls in `try/catch` and show toast notifications in the UI.

**Let's start with PHASE 1. Please generate the JPA Entities and the Spring Boot application structure first.**