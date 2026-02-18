package server

import (
	"context"
	"fmt"
	"math/rand"
	"testing"
)

func TestRAGStore(t *testing.T) {

	ctx := context.Background()
	store, err := NewRAGStore(DBURL)
	if err != nil {
		t.Fatalf("Failed to connect: %v", err)
	}
	defer store.db.Close()

	err = store.InitSchema(ctx)
	if err != nil {
		t.Fatalf("InitSchema failed: %v", err)
	}
	// Helper to generate random embedding for testing
	genEmbedding := func() []float32 {
		emb := make([]float32, 768)
		for i := range emb {
			emb[i] = rand.Float32()
		}
		return emb
	}

	// 2. Test Ingest
	testContent := "The Sicilian Defense is a popular chess opening."
	testSource := "Opening Handbook"
	testMetadata := map[string]any{
		"category":   "opening",
		"difficulty": "medium",
	}
	testEmb := genEmbedding()

	err = store.Ingest(ctx, testContent, testSource, testMetadata, testEmb)
	if err != nil {
		t.Errorf("Ingest failed: %v", err)
	}

	// 3. Test Hybrid Search
	t.Run("HybridSearch", func(t *testing.T) {
		results, err := store.HybridSearch(ctx, testEmb, "Sicilian Defense", 5)
		if err != nil {
			t.Fatalf("HybridSearch failed: %v", err)
		}

		if len(results) == 0 {
			t.Error("Expected at least one result, got 0")
		}

		found := false
		for _, res := range results {
			if res.Content == testContent {
				found = true
				break
			}
		}
		fmt.Println("expect this to be ..", results)
		if !found {
			t.Errorf("Ingested content '%s' not found in search results", testContent)
		}
	})

	// 4. Test formatting
	t.Run("ToContextString", func(t *testing.T) {
		chunks := []chunk{
			{
				Content:  "Test content",
				Source:   "Test source",
				Metadata: map[string]any{"key": "val"},
			},
		}
		output := store.ToContextString(chunks)
		if output == "" {
			t.Error("ToContextString returned empty string")
		}
		if !testing.Short() {
			t.Logf("Formatted context output:\n%s", output)
		}
	})
}
