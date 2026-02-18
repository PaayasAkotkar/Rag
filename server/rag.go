package server

import (
	"app/server/graph/model"
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
)

// BuildChessPrompt returns strict rules for the ai to follow
func BuildChessPrompt(student *model.ChessStudentRequest, store *RAGStore, chunks []chunk) string {
	var sb strings.Builder
	query := student.Query

	sb.WriteString(fmt.Sprintf("You are a professional chess coach speaking to %s.\n\n", *student.Name))
	sb.WriteString(fmt.Sprintf("IMPORTANT: Start your response in the 'information.desc' field with: 'Hello %s!'\n\n", *student.Name))
	sb.WriteString(fmt.Sprintf("Student's Query: %s\n\n", *query))

	if len(chunks) > 0 {
		sb.WriteString(store.ToContextString(chunks))
	} else {
		sb.WriteString("Use your own chess expertise to answer the student's query.\n\n")
	}

	sb.WriteString("JSON STRUCTURE RULES:\n")
	sb.WriteString("- You MUST return valid JSON matching the exact structure below.\n")
	sb.WriteString("- 'information', 'suggestion', and 'bestPractice' are OBJECTS, not arrays.\n")
	sb.WriteString("- Put all lists of items (books, videos, FENs) into 'miscItems' at the top level or within the objects.\n")
	sb.WriteString("- Use 'suggestion' (singular) as the key, not 'suggestions'.\n\n")

	sb.WriteString("FIELD USAGE:\n")
	sb.WriteString("- 'information': General intro and overview.\n")
	sb.WriteString("- 'suggestion': Strategic advice for the specific position/query.\n")
	sb.WriteString("- 'bestPractice': General chess principles applicable here.\n")
	sb.WriteString("- 'miscItems': A list of key-value pairs for tools, resources, and copyable text.\n\n")

	sb.WriteString("MANDATORY JSON TEMPLATE:\n")
	sb.WriteString(`{
  "information": {
    "title": "...",
    "desc": "Hello [Name]! ...",
    "year": "2025"
  },
  "suggestion": {
     "title": "...",
     "desc": "..."
  },
  "bestPractice": {
     "title": "...",
     "desc": "..."
  },
  "miscItems": [
		{ "key": "book1", "value": { "title": "📚 My System", "desc": "Great strategy book...", "canCopy": false, "isLink": false } },
		{ "key": "vid1", "value": { "title": "📺 Guide Video", "desc": "Detailed analysis of master games.", "canCopy": false, "isLink": true, "link": "https://www.youtube.com/watch?v=FULL_ID_HERE" } },
		{"key": "Best Games", "value": { "title": "📺 Best Chess Games of the decade 2019", "desc": "here are some of the best chess game fen you can copy and use and anaylsis.", "canCopy": true,"isLink":false,"copy":"rn1q1rk1/pp2b1pp/2p2n2/3p1pB1/3P4/1QP2N2/PP1N1PPP/R4RK1 b - - 1 11" } }
	                                 ]
}`)
	sb.WriteString("\n\n")
	sb.WriteString("SPECIAL HANDLING:\n")
	sb.WriteString("- For FEN/PGN: Set 'canCopy': true and put the code in 'copy'.\n")
	sb.WriteString("- For Links/Videos: Set 'isLink': true and put the URL in 'link'.\n")
	sb.WriteString("- You MUST include at least one YouTube video link in 'miscItems'.\n\n")

	sb.WriteString("CRITICAL: Return ONLY raw JSON. No markdown code blocks. Ensure 'suggestion' and 'bestPractice' are single objects, NOT arrays.\n")
	return sb.String()
}

// CleanJSONResponse from markdown code blocks
func cleanJSONResponse(text string) string {
	text = strings.TrimSpace(text)
	text = strings.TrimPrefix(text, "```json")
	text = strings.TrimPrefix(text, "```")
	text = strings.TrimSuffix(text, "```")
	text = strings.TrimSpace(text)
	return text
}

// ai generated
func embedText(ctx context.Context, em ai.Embedder, text string) ([]float32, error) {
	res, err := em.Embed(ctx, &ai.EmbedRequest{
		Input: []*ai.Document{
			ai.DocumentFromText(text, nil),
		},
	})
	if err != nil {
		return nil, fmt.Errorf("embed: %w", err)
	}
	if len(res.Embeddings) == 0 {
		return nil, fmt.Errorf("no embeddings returned")
	}
	return res.Embeddings[0].Embedding, nil
}

var (
	chessCoachFlow func(context.Context, *model.ChessStudentRequest) (*model.OnChessCoachReply, error)
	flowOnce       sync.Once
)

// InitFlows returns coach reply schema
func InitFlows(g *genkit.Genkit, store *RAGStore) {
	flowOnce.Do(func() {
		f := genkit.DefineFlow(g, "chessCoachFlow",
			func(ctx context.Context, input *model.ChessStudentRequest) (*model.OnChessCoachReply, error) {
				em := googlegenai.GoogleAIEmbedder(g, "gemini-embedding-001")

				// 1. Embed the query
				queryEmbedding, err := embedText(ctx, em, *input.Query)
				if err != nil {
					return nil, fmt.Errorf("embedding query: %w", err)
				}

				// 2. Hybrid search for relevant chunks
				chunks, err := store.HybridSearch(ctx, queryEmbedding, *input.Query, 5)
				if err != nil {
					return nil, fmt.Errorf("hybrid search: %w", err)
				}

				// 3. Build prompt with context
				prompt := BuildChessPrompt(input, store, chunks)

				// 4. Generate AI response
				resp, err := genkit.Generate(ctx, g, ai.WithPrompt(prompt))
				if err != nil {
					return nil, fmt.Errorf("generate: %w", err)
				}

				cleaned := cleanJSONResponse(resp.Text())

				var coach model.OnChessCoachReply
				if err := json.Unmarshal([]byte(cleaned), &coach); err != nil {
					return nil, fmt.Errorf("parse response: %w\nraw: %s", err, cleaned)
				}

				// 5. Ingest Q&A history in background
				go func() {
					bgCtx := context.Background()
					content := fmt.Sprintf("Q: %s\nA: %s", *input.Query, *coach.Information.Desc)
					embedding, err := embedText(bgCtx, em, content)
					if err != nil {
						return
					}

					store.IngestIfNewWithEmbedding(bgCtx, content, "qa-history", map[string]any{
						"student": *input.Name,
						"query":   *input.Query,
						"type":    "qa",
					}, embedding)
				}()

				return &coach, nil
			},
		)
		chessCoachFlow = f.Run
	})
}

// AskChessCoach returns the reply of the ai
func AskChessCoach(
	ctx context.Context,
	student *model.ChessStudentRequest,
	store *RAGStore,
	g *genkit.Genkit,
) (*model.OnChessCoachReply, error) {
	if chessCoachFlow == nil {
		return nil, fmt.Errorf("chessCoachFlow not initialized")
	}

	response, err := chessCoachFlow(ctx, student)
	if err != nil {
		return nil, fmt.Errorf("chess coach flow: %w", err)
	}

	return response, nil
}
