# Morning Show Backend Implementation Plan

## Overview
Migrering från client-side localStorage till en riktig backend med Node.js + Express + PostgreSQL.

## Arkitektur

### Stack
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL
- **Frontend:** Befintlig HTML/CSS/JavaScript (uppdaterad)
- **Authentication:** Grundläggande (ingen auth i MVP)

### Systemöversikt
```
Frontend (index.html, script.js)
    ↓ (REST API calls)
    ↓
Backend (Express server på :3000)
    ↓ (SQL queries)
    ↓
PostgreSQL Database
```

## Databasschemat

### episodes tabell
Lagrar alla episoder (4 säsonger × 3 episoder = 12 rader)

```sql
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season INTEGER NOT NULL,
  episode INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  blurb TEXT NOT NULL,
  focus VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(season, episode)
);
```

### comments tabell
Lagrar alla kommentarer, länkade till episoder

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES episodes(id) ON DELETE CASCADE,
  name VARCHAR(40) NOT NULL,
  text VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_episode_id ON comments(episode_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

## REST API Endpoints

### Episodes
| Metod | Endpoint | Beskrivning |
|-------|----------|-------------|
| GET | `/api/episodes` | Hämta alla episoder |
| GET | `/api/episodes/:id` | Hämta en specifik episod |

**Exempel response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "season": 1,
  "episode": 1,
  "title": "Episode 1",
  "blurb": "...",
  "focus": "...",
  "prompt": "..."
}
```

### Comments
| Metod | Endpoint | Beskrivning | Body |
|-------|----------|-------------|------|
| GET | `/api/episodes/:episodeId/comments` | Hämta kommentarer för episod | - |
| POST | `/api/episodes/:episodeId/comments` | Lägg till kommentar | `{name, text}` |
| DELETE | `/api/comments/:commentId` | Ta bort kommentar | - |

**POST request body:**
```json
{
  "name": "Anna",
  "text": "Väldigt bra avsnitt!"
}
```

**GET response (sorterad nyaste först):**
```json
[
  {
    "id": "...",
    "episode_id": "...",
    "name": "Anna",
    "text": "Väldigt bra avsnitt!",
    "created_at": "2026-04-13T10:30:00Z"
  }
]
```

## Projektstruktur

```
morning-show/
├── index.html
├── styles.css
├── script.js (uppdaterad - API calls istället för localStorage)
├── docs/
│   └── BACKEND_PLAN.md (denna fil)
├── backend/
│   ├── src/
│   │   ├── server.js (Express app)
│   │   ├── db.js (PostgreSQL connection pool)
│   │   └── routes/
│   │       ├── episodes.js
│   │       └── comments.js
│   ├── .env (Git-ignored)
│   ├── .env.example
│   ├── package.json
│   └── README.md
└── .gitignore
```

## Implementationssteg

### Steg 1: Database Setup
1. Skapa PostgreSQL database (lokalt eller cloud)
2. Kör schema SQL-filen
3. Seed initial episod-data från befintlig `showData`

### Steg 2: Backend Scaffolding
1. Skapa `/backend` mapp
2. `npm init` och installera dependencies:
   ```bash
   npm install express pg dotenv cors
   npm install --save-dev nodemon
   ```
3. Skapa `.env` fil med:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/morning_show
   PORT=3000
   NODE_ENV=development
   ```

### Steg 3: API Implementation
1. Skapa `src/db.js` - PostgreSQL connection pool
2. Skapa `src/routes/episodes.js` - GET /api/episodes endpoints
3. Skapa `src/routes/comments.js` - Comment CRUD endpoints
4. Skapa `src/server.js` - Express app som kopplar ihop allt

### Steg 4: Frontend Updates (script.js)
1. **Ta bort:**
   - `loadComments()` och `saveComments()`
   - Hardcoded `showData` array
   - Allt localStorage-relaterat

2. **Lägg till API helpers:**
   ```javascript
   const API = "http://localhost:3000/api";
   
   async function fetchEpisodes() {
     const res = await fetch(`${API}/episodes`);
     return res.json();
   }
   
   async function fetchComments(episodeId) {
     const res = await fetch(`${API}/episodes/${episodeId}/comments`);
     return res.json();
   }
   
   async function postComment(episodeId, name, text) {
     const res = await fetch(`${API}/episodes/${episodeId}/comments`, {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ name, text })
     });
     return res.json();
   }
   ```

3. **Uppdatera render()-funktionen:**
   - Hämta episoder från API istället för hardcoded array
   - Hämta kommentarer från API istället för localStorage

### Steg 5: Test & Deploy
1. Starta backend: `npm run dev` (nodemon)
2. Testa alla endpoints med curl eller Postman
3. Verifiera att frontend kan ansluta
4. Deploy backend (Render, Railway, etc.)
5. Uppdatera frontend API_URL för production

## Validering & Begränsningar

### Input Validation (Backend)
- `name`: Max 40 tecken, required
- `text`: Max 500 tecken, required
- `episode_id`: Måste existera i episodes-tabellen

### CORS Setup
Backend måste tillåta requests från frontend:
```javascript
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: false
}));
```

## Migrering från localStorage

### Seed-process
1. Exportera befintlig episod-data från `showData`
2. Importera till `episodes` tabell
3. OBS: Gamla localStorage-kommentarer förloras (kan sparas med manuell export först)

## Deployment

### Alternativ 1: Railway.app (rekommenderat)
- Gratis PostgreSQL + Node.js hosting
- Automatisk deploy från GitHub
- Environment variables enkelt

### Alternativ 2: Render.com
- Gratis PostgreSQL + Node.js
- GitHub integration

### Alternativ 3: Fly.io
- Mer avancerat, men kraftfullt
- Bättre för skalning

## Nästa fase (Future)

Efter MVP kan man lägga till:
- **User Authentication** - JWT tokens, registrering
- **Content Management** - Admin panel för episoder
- **Moderation** - Markera/ta bort spam-kommentarer
- **Analytics** - Populäraste episoder, kommentarfrekvens
- **Real-time updates** - WebSockets för live comments

## Säkerhet

### MVP (Minimal)
- Input validation
- CORS whitelist
- Rate limiting på API (senare)

### Framtid
- Autentisering på delete
- CSRF protection
- SQL injection prevention (prepared statements)
- XSS prevention (sanitize user input)

## Testchecklist

- [ ] POST /api/episodes returnerar alla 12 episoder
- [ ] GET /api/episodes/:id returnerar rätt episod
- [ ] POST /api/episodes/:id/comments lägger till kommentar
- [ ] Nya kommentarer visas omedelbar på frontend
- [ ] Kommentarer är persistent efter refresh
- [ ] DELETE /api/comments/:id tar bort kommentar
- [ ] Frontend visar kommentarer sorterade nyaste först
- [ ] CORS fungerar mellan localhost:3000 och frontend
- [ ] Formuläret validerar (max längder)
- [ ] Responsive design fungerar fortfarande
- [ ] Blå frame-border visas fortfarande
