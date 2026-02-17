// Package Server implements the rag system
package server

import (
	"app/server/graph/model"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/firebase/genkit/go/ai"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
)

// BuildChessPrompt strict rules for the ai to follow
func BuildChessPrompt(student *model.ChessStudentRequest) string {
	var sb strings.Builder
	query := student.Query
	// some of the prompt is created using claude
	sb.WriteString(fmt.Sprintf("You are a professional chess coach speaking to %s.\n\n", *student.Name))
	sb.WriteString(fmt.Sprintf("IMPORTANT: Start your response in the 'information.desc' field with: 'Hello %s!'\n\n", *student.Name))
	sb.WriteString(fmt.Sprintf("Student's Query: %s\n\n", *query))

	sb.WriteString("CONTENT GUIDELINES:\n")
	sb.WriteString("- Information/Suggestion/BestPractice 'desc' fields should be summaries. Do NOT put long lists of items (books, moves, videos) in 'desc'.\n")
	sb.WriteString("- Move ALL lists, recommendations, links, and copyable text into 'miscItems'.\n")
	sb.WriteString("- You can use emojis in 'title' fields to be expressive.\n\n")

	sb.WriteString("FIELD USAGE:\n")
	sb.WriteString("- 'miscItems': THE ONLY PLACE for lists, books, videos, or external links.\n")
	sb.WriteString("- Structure: [ { \"key\": \"unique_id\", \"value\": { \"title\": \"...\", \"desc\": \"...\", \"canCopy\": boolean, \"isLink\": boolean } } ]\n")
	sb.WriteString("- Use descriptive keys (e.g., 'book_1', 'video_guide', 'fen_string')\n\n")

	sb.WriteString("SPECIAL HANDLING:\n")
	sb.WriteString("- BOOKS/RESOURCES: Create a miscItem for EACH book/resource. Set isLink=true if you have a URL, otherwise just title/desc.\n")
	sb.WriteString("- YOUTUBE: You MUST include at least one YouTube video link in miscItems. Search for 'Chess [Topic]'. Title: '📺 Video: ...'\n")
	sb.WriteString("- MOVES/FEN: Put PGNs and FENs in miscItems with canCopy=true.\n")
	sb.WriteString("- OPENINGS: Link to Lichess/Chess.com analysis in miscItems.\n")
	sb.WriteString("- ALWAYS use year '2025'.\n\n")

	sb.WriteString("EXAMPLE JSON STRUCTURE:\n")
	sb.WriteString(`"miscItems": [
	{ "key": "book1", "value": { "title": "📚 My System", "desc": "Great strategy book...", "canCopy": false, "isLink": false } },
	{ "key": "vid1", "value": { "title": "📺 Guide Video", "desc": "this youtuber has earned more followers because he is so good at analysis the chess game.", "canCopy": false,"link":"https://youtube.com/...", "isLink": true } }
	{"key": "Best Games", "value": { "title": "📺 Best Chess Games of the decade 2019", "desc": "here are some of the best chess game fen you can copy and use and anaylsis.", "canCopy": true,"isLink":false,"copy":"rn1q1rk1/pp2b1pp/2p2n2/3p1pB1/3P4/1QP2N2/PP1N1PPP/R4RK1 b - - 1 11" } }  
                                 ]`)
	sb.WriteString("\n\n")
	sb.WriteString("CRITICAL: Return ONLY raw JSON. No markdown code blocks. Ensure all lists are inside 'miscItems'.\n")
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

// AskChessCoach returns the reply of the ai
// genKit is qite powerful and easy to learn
// pattern:
//  1. copy paste the init stuff and do some chages
//  2. gefine the flow
//  3. build your prompt
//     prompt pattern:
//     a. desc or theme
//     b. guideline
//     c. struct field usage
//     d. disclaimer
//     e. example for better results
//
// honeslty speaking promp is better than using the define flow struct
// 4. unmarhsall it
func AskChessCoach(student *model.ChessStudentRequest) *model.OnChessCoachReply {
	ctx := context.Background()

	g := genkit.Init(ctx,
		genkit.WithPlugins(&googlegenai.GoogleAI{APIKey: ENV}),
		genkit.WithDefaultModel(MODEL),
	)

	chessCoachFlow := genkit.DefineFlow(g, "chessCoachFlow",
		func(ctx context.Context, input *model.ChessStudentRequest) (*model.OnChessCoachReply, error) {
			prompt := BuildChessPrompt(input)

			resp, err := genkit.Generate(ctx, g,
				ai.WithPrompt(prompt),
			)
			if err != nil {
				return nil, fmt.Errorf("failed to generate chess coaching: %w", err)
			}

			responseText := resp.Text()
			cleanedJSON := cleanJSONResponse(responseText)

			var coach model.OnChessCoachReply
			if err := json.Unmarshal([]byte(cleanedJSON), &coach); err != nil {
				return nil, fmt.Errorf("failed to parse AI response: %w\nResponse: %s", err, cleanedJSON)
			}

			return &coach, nil
		},
	)

	response, err := chessCoachFlow.Run(ctx, student)
	if err != nil {
		log.Fatalf("could not generate chess coaching: %v", err)
	}

	fmt.Println("<<<<<<ASK CHESS COACH SPEAKING>>>>>>>>")
	responseJSON, _ := json.MarshalIndent(response, "", "  ")
	fmt.Println(string(responseJSON))
	return response
}
