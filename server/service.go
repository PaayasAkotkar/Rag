// nothing special here if you not able to understand just go to the generatd schema.resolvers.go and understand it or refer to schema.graphqls
// pro tip: in order not to get confused you simply copy and paste the generated schema and add that in one single struct and keep one parent that just receives those funcs
package server

import (
	"app/server/graph"
	"app/server/graph/model"
	"context"
	"log"

	"github.com/firebase/genkit/go/genkit"
)

type RagResolver struct {
	store  *RAGStore
	pubsub *PubSub
	g      *genkit.Genkit
}

type RagService struct{ *RagResolver }

func (r *RagResolver) AskChessCoach(ctx context.Context, input *model.ChessStudentRequest) (*model.ChessCoachPayload, error) {
	log.Println("RAG request made...")

	coach, err := AskChessCoach(ctx, input, r.store, r.g)
	if err != nil {
		return nil, err
	}

	r.pubsub.Broadcast(*input.ID, coach)

	status := int32(200)
	msg := "coaching thinking..."
	return &model.ChessCoachPayload{Status: &status, Message: &msg}, nil
}
func (r *RagResolver) InitCoachSuggestions(ctx context.Context, input *model.ChessStudentRequest) ([]*model.OnChessCoachReply, error) {
	log.Println("Rag init request made...")
	return []*model.OnChessCoachReply{}, nil
}

func (r *RagResolver) ChessCoachReply(ctx context.Context, input *model.ChessStudentRequest) (<-chan *model.OnChessCoachReply, error) {
	log.Println("live update request triggered...")
	ch := r.pubsub.Subscribe(*input.ID)
	go func() {
		<-ctx.Done()
		r.pubsub.Unsubscribe(*input.ID, ch)
	}()
	return ch, nil
}

func (r *RagResolver) Mutation() graph.MutationResolver { return &RagService{r} }

func (r *RagResolver) Query() graph.QueryResolver { return &RagService{r} }

func (r *RagResolver) Subscription() graph.SubscriptionResolver { return &RagService{r} }
