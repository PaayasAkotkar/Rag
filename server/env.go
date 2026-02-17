package server

const (
	ENV   = "" // your api key
	MODEL = "googleai/gemini-2.5-flash" // or anyother model
)

var (
	pubsub = InitPubSub()
)
