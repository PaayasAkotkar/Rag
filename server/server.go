package server

import (
	"app/server/graph"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/lru"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/firebase/genkit/go/genkit"
	"github.com/firebase/genkit/go/plugins/googlegenai"
	"github.com/go-chi/cors"
	"github.com/gorilla/websocket"
	"github.com/vektah/gqlparser/v2/ast"
)

const defaultPort = "8080"

func Server() {
	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	ctx := context.Background()
	g := genkit.Init(ctx,
		genkit.WithPlugins(&googlegenai.GoogleAI{APIKey: ENV}),
		genkit.WithDefaultModel(MODEL),
	)

	store, err := NewRAGStore(DBURL)
	if err != nil {
		log.Fatal(err)
	}
	if err := store.InitSchema(ctx); err != nil {
		log.Fatal(err)
	}

	// Register flows once
	InitFlows(g, store)

	resolver := &RagResolver{
		store:  store,
		pubsub: InitPubSub(),
		g:      g,
	}

	srv := handler.New(graph.NewExecutableSchema(graph.Config{
		Resolvers: resolver,
	}))

	srv.AddTransport(transport.Options{})
	srv.AddTransport(transport.GET{})
	srv.AddTransport(transport.POST{})
	srv.AddTransport(transport.GRAPHQL{})
	srv.AddTransport(transport.Websocket{
		Upgrader: websocket.Upgrader{
			WriteBufferSize: 1024,
			ReadBufferSize:  1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		KeepAlivePingInterval: 10 * time.Second,
	})
	srv.SetQueryCache(lru.New[*ast.QueryDocument](1000))

	srv.Use(extension.Introspection{})
	srv.Use(extension.AutomaticPersistedQuery{
		Cache: lru.New[string](100),
	})

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
	})

	http.Handle("/", playground.Handler("GraphQL playground", "/ask-coach"))

	http.Handle("/ask-chess-coach", c.Handler(srv))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)

	server := &http.Server{
		Addr: ":" + port,
	}

	go func() {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	sig := <-quit
	log.Printf("Received signal: %v, initiating graceful shutdown...", sig)

	_, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Graceful shutdown failed: %v — forcing exit", err)
	}

	log.Println("Server exited cleanly")
}
