import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from 'graphql-ws';
import { HttpLink, InMemoryCache } from '@apollo/client/core';
import { getMainDefinition } from "@apollo/client/utilities";
import { Kind, OperationTypeNode } from "graphql";
import { ApolloLink } from "@apollo/client";
import { ApolloClient } from "@apollo/client";

// env
const chessPuzzleHTTP = 'http://localhost:8080/chess-puzzles'
const chessPuzzleWS = 'ws://localhost:8080/chess-puzzles'
const ragHTTP = 'http://localhost:8080/ask-chess-coach'
const ragWS = 'ws://localhost:8080/ask-chess-coach'
// end

// clients
const httpChessPuzzleClient = new HttpLink({ uri: chessPuzzleHTTP })
const gqlChessPuzzleClient = new GraphQLWsLink(createClient({ url: chessPuzzleWS }))

const httpRagClient = new HttpLink({ uri: ragHTTP })
const gqlRagClient = new GraphQLWsLink(createClient({ url: ragWS }))
// end

// link
const chessPuzzleLink = ApolloLink.split(({ query }) => {

    const def = getMainDefinition(query)
    return def.kind === Kind.OPERATION_DEFINITION &&
        def.operation === OperationTypeNode.SUBSCRIPTION
},
    gqlChessPuzzleClient,
    httpChessPuzzleClient)

const ragLink = ApolloLink.split(({ query }) => {

    const def = getMainDefinition(query)
    return def.kind === Kind.OPERATION_DEFINITION &&
        def.operation === OperationTypeNode.SUBSCRIPTION
},
    gqlRagClient,
    httpRagClient)
// end

export function InitGraphql() {
    return {
        chess_puzzle: new ApolloClient({
            link: chessPuzzleLink,
            cache: new InMemoryCache()
        }),
        rag: new ApolloClient({
            link: ragLink,
            cache: new InMemoryCache()
        })
    }
}

