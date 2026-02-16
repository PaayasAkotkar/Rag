// nothing special here if you not able to understand just go to the generatd schema.resolvers.go and understand it or refer to schema.graphqls
// pro tip: in order not to get confused you simply copy and paste the generated schema and add that in one single struct and keep one parent that just receives those funcs
package server

import (
	"app/server/graph"
	"app/server/graph/model"
	"context"
	"log"
)

type RagResolver struct{}
type RagService struct{ *RagResolver }

func (r *RagResolver) AskChessCoach(ctx context.Context, input *model.ChessStudentRequest) (*model.ChessCoachPayload, error) {
	log.Println("RAG request made...")
	// magic of pubsub
	coach := AskChessCoach(input)
	pubsub.Broadcast(*input.ID, coach)
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
	ch := pubsub.Subscribe(*input.ID)
	go func() {
		<-ctx.Done()
		pubsub.Unsubscribe(*input.ID, ch)
	}()
	return ch, nil
}

func (r *RagResolver) Mutation() graph.MutationResolver { return &RagService{r} }

func (r *RagResolver) Query() graph.QueryResolver { return &RagService{r} }

func (r *RagResolver) Subscription() graph.SubscriptionResolver { return &RagService{r} }
