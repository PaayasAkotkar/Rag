FROM golang:1.25-alpine AS backend-builder
RUN apk add --no-cache gcc musl-dev
WORKDIR /app
COPY go.mod go.sum ./
COPY server/ ./server/
COPY chess/ ./chess/
RUN go mod download
COPY main.go ./
RUN go build -o backend-app main.go

FROM node:22-alpine AS frontend-builder
WORKDIR /app/rag
COPY rag/package*.json ./
RUN npm install
COPY rag/ ./
RUN npm run build

FROM node:22-alpine
RUN apk add --no-cache ca-certificates
WORKDIR /app

COPY --from=backend-builder /app/backend-app ./

COPY --from=backend-builder /app/chess/chess_puzzles/puzzle_db1.csv ./chess/chess_puzzles/
COPY --from=frontend-builder /app/rag/.next ./rag/.next
COPY --from=frontend-builder /app/rag/public ./rag/public
COPY --from=frontend-builder /app/rag/package*.json ./rag/
COPY --from=frontend-builder /app/rag/node_modules ./rag/node_modules

RUN echo '#!/bin/sh' > /app/start.sh && \
    echo './backend-app &' >> /app/start.sh && \
    echo 'cd rag && npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 8080 3000

CMD ["/app/start.sh"]
