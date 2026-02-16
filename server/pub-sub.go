// this is my end of territory
// its simple to learn
// information & tip:
// pub-sub system doesnt act like get & post it just get function that saves so much of implementation
package server

import (
	"sync"

	"app/server/graph/model"
)

func InitPubSub() *PubSub {
	return &PubSub{
		subs: make(map[string]map[chan *model.OnChessCoachReply]struct{}),
	}
}

type PubSub struct {
	mu   sync.Mutex
	subs map[string]map[chan *model.OnChessCoachReply]struct{}
}

func (ps *PubSub) Subscribe(room string) chan *model.OnChessCoachReply {
	ch := make(chan *model.OnChessCoachReply, 1)
	ps.mu.Lock()
	defer ps.mu.Unlock()
	if _, ok := ps.subs[room]; !ok {
		ps.subs[room] = make(map[chan *model.OnChessCoachReply]struct{})
	}
	ps.subs[room][ch] = struct{}{}
	return ch
}

func (ps *PubSub) Unsubscribe(room string, subscriber chan *model.OnChessCoachReply) {
	ps.mu.Lock()
	defer ps.mu.Unlock()
	if sub, ok := ps.subs[room]; ok {
		if _, ok := ps.subs[room][subscriber]; ok {
			delete(sub, subscriber)
			close(subscriber)
		}
		if len(sub) == 0 {
			delete(ps.subs, room)
		}
	}
}

func (ps *PubSub) Broadcast(room string, latest *model.OnChessCoachReply) {
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
