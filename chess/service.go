package chess

import (
	"app/chess/graph"
	"app/chess/graph/model"
	"context"
)

type ChessPuzzleResolver struct {
}
type ChessPuzzleService struct {
	*ChessPuzzleResolver
}

func (r *ChessPuzzleResolver) InitPuzzles(ctx context.Context, input model.PuzzleInput) ([]*model.Puzzle, error) {
	return GetPuzzle(int(input.Limit)), nil
}

func (r *ChessPuzzleResolver) GetPuzzles(ctx context.Context, input model.PuzzleInput) (*model.MutationReply, error) {
	pubSub.Broadcast(input.Room, GetPuzzle(int(input.Limit)))
	return &model.MutationReply{
		Msg: "searching indepth...",
	}, nil
}

func (r *ChessPuzzleResolver) LatestPuzzles(ctx context.Context, input model.PuzzleInput) (<-chan []*model.Puzzle, error) {
	ch := pubSub.Subscribe(input.Room)
	go func() {
		<-ctx.Done()
		pubSub.Unsubscribe(input.Room, ch)
	}()
	return ch, nil
}

func (r *ChessPuzzleResolver) Mutation() graph.MutationResolver { return &ChessPuzzleService{r} }
func (r *ChessPuzzleResolver) Query() graph.QueryResolver       { return &ChessPuzzleService{r} }
func (r *ChessPuzzleResolver) Subscription() graph.SubscriptionResolver {
	return &ChessPuzzleService{r}
}
