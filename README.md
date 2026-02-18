# project: RAG Model - Chess Coaching System
# date: Feb-10-2026 - Feb-16-2026

A full-stack application combining AI-powered Retrieval Augmented Generation.The system provides an interactive chess coaching platform with real-time puzzle generation, analysis model.

## Motivation
<p> This is coded in-order to understand the basic of Rag system.
The reason behind using Graphql is simple because it adapts the perfect pubsub system and no need to worry about go coroutine and more or like easy to understand.</p>

## Project Overview

**RAG Model** is a modern web application built with:
- **Backend**: Go with GraphQL API and WebSocket support
- **Frontend**: Next.js 16 with React 19 and TypeScript
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
## NOTE
chess folder and chess puzzle in the rag folder is a side project but you can play with for that you can download the puzzle db from the lichess (https://database.lichess.org/#puzzles) and place it in the chess folder /chess_puzzles and name the csv file to puzzle_db1.csv.
