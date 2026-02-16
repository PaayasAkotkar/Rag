package chess

import (
	"sync"

	"app/chess/graph/model"
)

func InitPubSub() *PubSub {
	return &PubSub{
		subs: make(map[string]map[chan []*model.Puzzle]struct{}),
	}
}

type PubSub struct {
	mu   sync.Mutex
	subs map[string]map[chan []*model.Puzzle]struct{}
}

func (ps *PubSub) Subscribe(room string) chan []*model.Puzzle {
	ch := make(chan []*model.Puzzle, 1)
	ps.mu.Lock()
	defer ps.mu.Unlock()
	if _, ok := ps.subs[room]; !ok {
		ps.subs[room] = make(map[chan []*model.Puzzle]struct{})
	}
	ps.subs[room][ch] = struct{}{}
	return ch
}

func (ps *PubSub) Unsubscribe(room string, subscriber chan []*model.Puzzle) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	if sub, ok := ps.subs[room]; ok {
		if _, ok := ps.subs[room][subscriber]; ok {
			delete(sub, subscriber)
			close(subscriber)
		}
		// delete only if no one left
		if len(sub) == 0 {
			delete(ps.subs, room)
		}
	}
}

func (ps *PubSub) Broadcast(room string, latest []*model.Puzzle) {
	ps.mu.Lock()
	defer ps.mu.Unlock()

	subs := ps.subs[room]
	for ch := range subs {
		select {
		case ch <- latest:
		default:
		}
	}
}
