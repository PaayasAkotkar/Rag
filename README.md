# project: RAG Model - Chess Coaching System
# date: Feb-10-2026 - Feb-16-2026

A full-stack application combining AI-powered Retrieval Augmented Generation.The system provides an interactive chess coaching platform with real-time puzzle generation, analysis.

## Motivation
<p> This is coded in-order to understand the basic of Rag system tho it doesn't have the vector db but still it depicts how to write the prompt and understand the workflow.
The reason behind using Graphql is simple because adapts the perfect pubsub system and no need to worry about go coroutine and more or like easy to understand.</p>

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

## Troubleshooting

### ❌ Error: "chess_puzzles folder not found"

**Solution**:
```bash
mkdir -p chess/chess_puzzles
```

### ❌ Error: "puzzle_db1.csv not found" or "CSV parser error"

**Solutions**:
1. Verify file exists: `chess/chess_puzzles/puzzle_db1.csv`
2. Check file is readable and not corrupted
3. Verify CSV format matches specification (7 columns with headers)
4. Download fresh copy from https://database.lichess.org/#puzzles

### ❌ Error: "SQLite database initialization failed"

**Solutions**:
1. Delete any corrupted `chess_puzzleDB1.db` file
2. Re-run the backend - it will recreate the database
3. Check disk space (Lichess database requires ~2GB for import)
4. Verify `puzzle_db1.csv` has correct permissions

### ❌ "Too many open files" error

**Solution**:
- Backend is using too much memory during CSV import
- Increase OS file handle limits or reduce batch size in `chess/chess.go`

**TODOS**
- frontend Create Resp for the Chess Puzzle component
- backend Extract and pass the stock evaluations to eval bar

**Last Updated**: February 16, 2026
**Version**: 0.1.0
**Status**: Active Development