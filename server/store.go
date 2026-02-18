package server

import (
	"context"
	"fmt"
	"log"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/pgvector/pgvector-go"
)

// ai generated
type RAGStore struct {
	db *pgxpool.Pool
}

type chunk struct {
	ID        int
	Content   string
	Source    string
	Metadata  map[string]any
	Score     float64
	Embedding []float32
}

func NewRAGStore(databaseURL string) (*RAGStore, error) {
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, fmt.Errorf("parsing database url: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("connecting to postgres: %w", err)
	}
	return &RAGStore{db: pool}, nil
}

func (s *RAGStore) InitSchema(ctx context.Context) error {
	// First, ensure the vector extension exists
	if _, err := s.db.Exec(ctx, `CREATE EXTENSION IF NOT EXISTS vector`); err != nil {
		return fmt.Errorf("creating vector extension: %w", err)
	}

	// Check for existing dimension mismatch
	var dim int
	err := s.db.QueryRow(ctx, `
		SELECT atttypmod 
		FROM pg_attribute 
		WHERE attrelid = 'chunks'::regclass AND attname = 'embedding'
	`).Scan(&dim)

	if err == nil && dim != 768 {
		log.Printf("Dimension mismatch detected (%d != 768). Recreating chunks table...", dim)
		s.db.Exec(ctx, "DROP TABLE IF EXISTS chunks")
	}

	// Create table with unique constraint on content for easy deduplication
	_, err = s.db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS chunks (
			id        SERIAL PRIMARY KEY,
			content   TEXT NOT NULL UNIQUE,
			source    TEXT NOT NULL DEFAULT '',
			metadata  JSONB DEFAULT '{}',
			embedding vector(768)
		)`)
	if err != nil {
		return fmt.Errorf("creating chunks table: %w", err)
	}

	// Create HNSW index for fast vector similarity search
	// HNSW is better than IVFFlat for dynamic data and provides high recall
	_, err = s.db.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS chunks_embedding_idx
		ON chunks USING hnsw (embedding vector_cosine_ops)`)
	if err != nil {
		return fmt.Errorf("creating vector index: %w", err)
	}

	// Create GIN index for Full Text Search (keyword search)
	_, err = s.db.Exec(ctx, `
		CREATE INDEX IF NOT EXISTS chunks_fts_idx
		ON chunks USING GIN (to_tsvector('english', content))`)
	if err != nil {
		return fmt.Errorf("creating fts index: %w", err)
	}

	return nil
}

func (s *RAGStore) Ingest(ctx context.Context, content, source string, metadata map[string]any, embedding []float32) error {
	if metadata == nil {
		metadata = make(map[string]any)
	}

	var vec *pgvector.Vector
	if embedding != nil {
		v := pgvector.NewVector(embedding)
		vec = &v
	}

	// Using ON CONFLICT DO NOTHING to handle deduplication at the DB level efficiently
	_, err := s.db.Exec(ctx, `
		INSERT INTO chunks (content, source, metadata, embedding) 
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (content) DO NOTHING`,
		content, source, metadata, vec)

	return err
}

func (s *RAGStore) IngestIfNewWithEmbedding(ctx context.Context, content, source string, metadata map[string]any, embedding []float32) error {
	// Wrapper to match previous API, now handled by InitSchema's UNIQUE constraint and Ingest's ON CONFLICT
	return s.Ingest(ctx, content, source, metadata, embedding)
}

func (s *RAGStore) SearchByID(ctx context.Context, id int, topK int) ([]chunk, error) {
	var embedding pgvector.Vector
	err := s.db.QueryRow(ctx, `SELECT embedding FROM chunks WHERE id = $1`, id).Scan(&embedding)
	if err != nil {
		return nil, fmt.Errorf("fetching embedding for id %d: %w", id, err)
	}
	// Note: We don't have the text here, so we only do vector search
	return s.vectorSearch(ctx, embedding.Slice(), topK)
}

func (s *RAGStore) HybridSearch(ctx context.Context, queryEmbedding []float32, queryText string, topK int) ([]chunk, error) {
	var vectorResults []chunk
	var err error

	if queryEmbedding != nil {
		vectorResults, err = s.vectorSearch(ctx, queryEmbedding, topK*2)
		if err != nil {
			log.Printf("Vector search error: %v", err)
		}
	}

	keywordResults, err := s.keywordSearch(ctx, queryText, topK*2)
	if err != nil {
		log.Printf("Keyword search error: %v", err)
	}

	// Merge using Reciprocal Rank Fusion (RRF)
	return mergeRRF(vectorResults, keywordResults, topK), nil
}

func (s *RAGStore) vectorSearch(ctx context.Context, embedding []float32, limit int) ([]chunk, error) {
	rows, err := s.db.Query(ctx, `
		SELECT id, content, source, metadata,
		       1 - (embedding <=> $1) AS score
		FROM chunks
		ORDER BY embedding <=> $1
		LIMIT $2`, pgvector.NewVector(embedding), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []chunk
	for rows.Next() {
		var c chunk
		if err := rows.Scan(&c.ID, &c.Content, &c.Source, &c.Metadata, &c.Score); err != nil {
			return nil, err
		}
		results = append(results, c)
	}
	return results, rows.Err()
}

func (s *RAGStore) keywordSearch(ctx context.Context, query string, limit int) ([]chunk, error) {
	if strings.TrimSpace(query) == "" {
		return nil, nil
	}

	rows, err := s.db.Query(ctx, `
		SELECT id, content, source, metadata,
		       ts_rank(to_tsvector('english', content), plainto_tsquery('english', $1)) AS score
		FROM chunks
		WHERE to_tsvector('english', content) @@ plainto_tsquery('english', $1)
		ORDER BY score DESC
		LIMIT $2`, query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []chunk
	for rows.Next() {
		var c chunk
		if err := rows.Scan(&c.ID, &c.Content, &c.Source, &c.Metadata, &c.Score); err != nil {
			return nil, err
		}
		results = append(results, c)
	}
	return results, rows.Err()
}

func (s *RAGStore) GetCount(ctx context.Context) (int, error) {
	var count int
	err := s.db.QueryRow(ctx, "SELECT count(*) FROM chunks").Scan(&count)
	return count, err
}

func (s *RAGStore) Clear(ctx context.Context) error {
	_, err := s.db.Exec(ctx, "TRUNCATE TABLE chunks")
	return err
}

func (s *RAGStore) ToContextString(chunks []chunk) string {
	if len(chunks) == 0 {
		return ""
	}

	var sb strings.Builder
	sb.WriteString("### RELEVANT KNOWLEDGE BASE ###\n")
	for i, c := range chunks {
		sb.WriteString(fmt.Sprintf("\n--- Source: %s [Result %d] ---\n", c.Source, i+1))
		sb.WriteString(c.Content)
		if len(c.Metadata) > 0 {
			sb.WriteString("\nMetadata: ")
			metaParts := []string{}
			for k, v := range c.Metadata {
				metaParts = append(metaParts, fmt.Sprintf("%s:%v", k, v))
			}
			sb.WriteString(strings.Join(metaParts, ", "))
		}
		sb.WriteString("\n")
	}
	sb.WriteString("\n-------------------------------\n")
	return sb.String()
}

func mergeRRF(vectorResults, keywordResults []chunk, topK int) []chunk {
	const k = 60.0 // Constant used in RRF to prevent low ranks from dominating
	scores := make(map[int]float64)
	chunkMap := make(map[int]chunk)

	for rank, c := range vectorResults {
		scores[c.ID] += 1.0 / (k + float64(rank+1))
		chunkMap[c.ID] = c
	}
	for rank, c := range keywordResults {
		scores[c.ID] += 1.0 / (k + float64(rank+1))
		if _, ok := chunkMap[c.ID]; !ok {
			chunkMap[c.ID] = c
		}
	}

	type ranked struct {
		id    int
		score float64
	}
	var all []ranked
	for id, score := range scores {
		all = append(all, ranked{id, score})
	}

	sort.Slice(all, func(i, j int) bool {
		return all[i].score > all[j].score
	})

	results := make([]chunk, 0, topK)
	for i, r := range all {
		if i >= topK {
			break
		}
		c := chunkMap[r.id]
		c.Score = r.score
		results = append(results, c)
	}
	return results
}

// end
