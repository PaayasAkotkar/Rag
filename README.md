# project: RAG Model - Chess Coaching System
# date: Feb-10-2026 - Feb-16-2026

A full-stack application combining AI-powered Retrieval Augmented Generation.The system provides an interactive chess coaching platform with real-time puzzle generation, analysis model.

## Quick Start with Docker (Recommended)

The easiest way to view the project is using Docker Compose. This will set up the vector database, the Go backend, and the Next.js frontend automatically.

### 1. Configure Environment
Create a `.env` file from the example:
```bash
cp .env.example .env
```
Open `.env` and add your **Gemini API Key** to the `ENV` field.

### Option 1: Docker Compose (Best for development)
```bash
docker-compose up --build
```

### Option 2: Single Docker Image (Unified)
If you prefer a single container running everything:
```bash
docker build -t rag-chess-app .
docker run -p 3000:3000 -p 8080:8080 --env-file .env rag-chess-app
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/query](http://localhost:8080/query)
- **Playground**: [http://localhost:8080/](http://localhost:8080/)

## Project Overview

**RAG Model** is a modern web application built with:
- **Backend**: Go with GraphQL API and WebSocket support
- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Database**: SQLite with chess puzzle database
- **Real-time**: Pub/Sub architecture for live updates

## Project Structure

```
rag-model/
├── chess/                     # Chess puzzle engine & GraphQL resolvers
│   ├── chess.go               # CSV to SQLite database loader
│   ├── graph/                 # Chess GraphQL schema & resolvers
│   ├── pub-sub.go             # Pub/Sub for real-time updates
│   ├── service.go             # Graphql Schema
│   └── chess_puzzles/         # CSV data folder (REQUIRED - must create)
│       └── puzzle_db1.csv     # Chess puzzle dataset
│
├── server/                     # Main RAG GraphQL server
│   ├── server.go              # Server initialization & HTTP setup
│   ├── service.go             # Graphql Schema
_   |── rag.go                 # Gemini-Setup
│   ├── pub-sub.go             # Message broker
│   ├── graph/                 # RAG GraphQL schema & resolvers
│   └── env.go                 # Environment configuration
│
├── rag/                        # Next.js Frontend
│   ├── app/
│   │   ├── component/         # React components (Chess, Chat, Puzzles)
│   │   ├── services/          # GraphQL clients & API calls
│   │   ├── ui/                # Reusable UI components
│   │   ├── misc/              # Utilities & helpers
│   │   └── layout.tsx         # Root layout
│   
│
├── main.go                     # Entry point (starts server)
├── go.mod                      # Go module dependencies
```

## ⚠️ CRITICAL: Database & Folder Setup
### Step 1: Create Chess Puzzles Folder
**This folder MUST exist before running the chess Go files.**

### Step 2: Download Chess Puzzle Database (Lichess)

The system requires a chess puzzle CSV database to function. Follow these steps:

**Option A: Download from Lichess Database (Recommended)**

1. Visit: **https://database.lichess.org/**
2. Download the latest **puzzles.csv** file (usually 200MB+)
3. Place it in `chess/chess_puzzles/` and rename to `puzzle_db1.csv`

**CSV Column Definitions**:
- `id`: Unique puzzle ID (integer)
- `fen`: Chess position in FEN notation
- `moves`: Solution moves (space-separated UCI notation, e.g., `e5 d4 c3`)
- `rating`: Puzzle difficulty (1000-2800+)
- `popularity`: Popularity score (0-100)
- `unused`: (Unused column - can be any value)
- `themes`: Puzzle categories (comma-separated, e.g., `endgame,tactics,fork`)

Expected output: File should be present (size: MB+ if using Lichess database)

### Step 4: Database Initialization

On the **first run** of the Go backend, the system will automatically:
1. Read `chess/chess_puzzles/puzzle_db1.csv`
2. Create `chess_puzzleDB1.db` (SQLite database)
3. Import all puzzles from CSV to SQLite
4. Build indices for fast queries

## Key Features

### Chess Puzzle System
- **Database**: SQLite-backed puzzle storage with 1M+ puzzles (from Lichess)
- **Real-time Distribution**: WebSocket pub/sub for live puzzle updates
- **GraphQL API**: Query/Subscription-based puzzle access
- **Themes**: Filter puzzles by theme (endgame, opening, tactics, etc.)
- **Difficulty Levels**: Puzzles rated from 800 to 2800+ Elo

### Frontend Components
- **Chess Grid**: Interactive chess board visualization
- **Puzzle Interface**: Step-by-step puzzle solving
- **AI Chat**: Real-time chess coaching assistant
- **Progress Tracking**: Student performance analytics
- **Responsive UI**: Tailwind CSS with modern animations (Anime.js, Motion)

### Backend Services
- **GraphQL Server**: Full GraphQL API with WebSocket support
- **Pub/Sub Messaging**: Real-time updates via subscriptions
- **Chess Engine**: Puzzle processing & filtering
- **Firebase Genkit Integration**: AI-powered coaching responses
