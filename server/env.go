package server

<<<<<<< HEAD
import (
	"os"
)

var (
	ENV   = ""                          // your api key
	MODEL = "googleai/gemini-2.5-flash" // or anyother model
	DBURL = ""
=======
const (
	ENV   = "" // your api key
	MODEL = "googleai/gemini-2.5-flash" // or anyother model
>>>>>>> c63f03e8b15dd0a910de7056826cbc98004bbd65
)

var (
	pubsub = InitPubSub()
)

func init() {
	if e := os.Getenv("ENV"); e != "" {
		ENV = e
	}
	if m := os.Getenv("MODEL"); m != "" {
		MODEL = m
	}
	if d := os.Getenv("DBURL"); d != "" {
		DBURL = d
	}
}
