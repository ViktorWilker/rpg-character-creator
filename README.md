# ⚔ Dark Fantasy RPG — Character Creator

A web-based character creation and management system for a custom **Lovecraftian medieval dark fantasy** tabletop RPG system, adapted from Ordem Paranormal RPG.

The core game logic runs in **C++ compiled to WebAssembly**, while the frontend is plain HTML/CSS/JS and the backend is Node.js with MongoDB.

---

## ✦ Features

- **Full character creation flow** — class, origin, attributes, proficiencies, stats
- **C++ game logic via WebAssembly** — all calculations (HP, Stamina, Mana, proficiency limits) run natively in C++
- **Origin system** — 26 origins, each granting 2 proficiencies and a unique power, loaded dynamically from JSON
- **Class system** — Combatente, Especialista, Ocultista, each with unique stat bases and proficiency rules
- **Duplicate proficiency rule** — if an origin and class grant the same proficiency, it counts as Veteran (double rank)
- **Firebase Authentication** — secure login and registration
- **MongoDB Atlas** — persistent character sheet storage, separating static (creation) and dynamic (session) data
- **Play screen** — track HP, Stamina and Mana in real time during sessions
- **Responsive UI** — works on desktop and mobile

---

## ⚙ Tech Stack

| Layer | Technology |
|-------|-----------|
| Game Logic | C++17 |
| Browser Runtime | WebAssembly (Emscripten) |
| Frontend | HTML5, CSS3, Vanilla JS |
| Authentication | Firebase Auth |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Mongoose) |
| Fonts | Cinzel + Crimson Pro |

---

## 🗂 Project Structure

```
rpg-character-creator/
├── index.html              # Main UI — all screens
├── setup.js                # Frontend logic + Firebase Auth + API calls
├── rpg_core.js             # WASM glue code (pre-compiled)
├── rpg_core.wasm           # Compiled C++ module (pre-compiled)
│
├── bindings.cpp            # Emscripten bindings — exposes C++ to JS
├── PlayerCharacter.cpp     # Core character class implementation
│
├── include/
│   ├── PlayerCharacter.h   # Character class definition
│   ├── origins_data.h      # JSON-driven origins & classes data layer
│   ├── attribute.h         # Attribute enum
│   ├── proficiencies.h     # Proficiency enum
│   ├── CombatenteCharacter.h
│   ├── EspecialistaCharacter.h
│   └── OcultistaCharacter.h
│
├── data/
│   └── origins.json        # Source of truth for all origins, classes and rules
│
└── servidor/               # Node.js backend
    ├── server.js           # Express server + Firebase Admin auth middleware
    ├── models/
    │   └── Ficha.js        # Mongoose schema for character sheets
    └── routes/
        └── fichas.js       # REST API routes (CRUD)
```

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)
- A [Firebase](https://firebase.google.com/) project with Authentication enabled

### 1. Clone the repository

```bash
git clone https://github.com/ViktorWilker/rpg-character-creator.git
cd rpg-character-creator
```

### 2. Configure the backend

```bash
cd servidor
npm install
```

Create a `.env` file inside `servidor/`:

```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json
```

Place your Firebase Admin SDK private key as `servidor/firebase-key.json`.

### 3. Start the backend

```bash
node server.js
```

You should see:
```
✅ MongoDB connected!
✅ Server running on port 3001
```

### 4. Open the frontend

Open `index.html` with a local server (e.g. VS Code Live Server or `npx serve .`).

> The WASM files (`rpg_core.js` and `rpg_core.wasm`) are pre-compiled and included in the repository — no Emscripten setup required to run the app.

---

## 🔨 Recompiling the WASM (optional)

If you want to modify the C++ game logic and recompile:

1. Install [Emscripten](https://emscripten.org/docs/getting_started/downloads.html)
2. Run from the project root:

```bash
emcc bindings.cpp PlayerCharacter.cpp OcultistaCharacter.cpp CombatenteCharacter.cpp EspecialistaCharacter.cpp -I include -o rpg_core.js -lembind -std=c++17
```

---

## 📖 Game System

This project implements a custom adaptation of **Ordem Paranormal RPG** (by Jambô Editora), reskinned for a Lovecraftian medieval dark fantasy setting.

### Key adaptations

| Original | This System |
|----------|-------------|
| NEX (Exposure Level) | Maestria (Mastery) |
| PE (Effort Points) | Estamina (Stamina) |
| PM (Mana Points) | Mana |
| Sanity | Corruption |

### Classes

| Class | HP Base | Stamina Base | Mana Base |
|-------|---------|-------------|-----------|
| Combatente | 20 + VIG | 6 + (VIG+AGI)/2 | — |
| Especialista | 16 + VIG | 8 + (VIG+AGI)/2 | — |
| Ocultista | 12 + VIG | 4 + (VIG+AGI)/2 | 8 + (INT+PRE)/2 |

### Attribute Generation

- All attributes start at **1**
- **4 points** to distribute (max 3 per attribute)
- May reduce one attribute to **0** to gain **+1 extra point**

---

## 📄 License

This project is for portfolio and educational purposes.  
Ordem Paranormal RPG is property of [Jambô Editora](https://jamboeditora.com.br/).

---

*Built with C++, WebAssembly, and a lot of eldritch dread.*
