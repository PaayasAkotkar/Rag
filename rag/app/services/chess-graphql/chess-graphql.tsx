"use client";

import { INIT_PUZZLES, GET_PUZZLES, LATEST_PUZZLES } from "@/app/services/chess-graphql/operation";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";

interface Puzzle {
    id: string;
    fen: string;
    moves: string;
    rating: number;
    popularity: number;
    themes: string;
}
interface PuzzleInput {
    room: string;
    limit: number;
}
interface MutationReply {
    msg: string;
}

// Hook for initializing puzzles with a query
export function useInitPuzzles(input: PuzzleInput) {

    const { data, loading, error, refetch } = useQuery<
        { initPuzzles: Puzzle[] },
        { input: PuzzleInput }
    >(INIT_PUZZLES, {
        variables: { input },
        fetchPolicy: "network-only",
    });

    return {
        puzzles: data?.initPuzzles || [],
        loading,
        error,
        refetch,
    };
}

// Hook for triggering puzzle fetch via mutation
export function useGetPuzzles() {
    const [getPuzzles, { data, loading, error }] = useMutation<
        { getPuzzles: MutationReply },
        { input: PuzzleInput }
    >(GET_PUZZLES);

    const fetchPuzzles = async (input: PuzzleInput) => {
        try {
            const result = await getPuzzles({ variables: { input } });
            return result.data?.getPuzzles;
        } catch (err) {
            console.error("Error fetching puzzles:", err);
            throw err;
        }
    };

    return {
        fetchPuzzles,
        loading,
        error,
        message: data?.getPuzzles?.msg,
    };
}

// Hook for subscribing to latest puzzles
export function useLatestPuzzles(input: PuzzleInput) {
    const { data, loading, error } = useSubscription<
        { latestPuzzles: Puzzle[] },
        { input: PuzzleInput }
    >(LATEST_PUZZLES, {
        variables: { input },
    });

    return {
        latestPuzzles: data?.latestPuzzles || [],
        loading,
        error,
    };
}

// Combined hook for full chess puzzle workflow
export default function useChessGraphql(room: string, limit: number = 5) {
    const input: PuzzleInput = { room, limit };

    // Initialize puzzles on mount
    const { puzzles: initialPuzzles, loading: initLoading, error: initError, refetch } = useInitPuzzles(input);

    // Mutation to trigger new puzzle fetch
    const { fetchPuzzles, loading: fetchLoading, error: fetchError, message } = useGetPuzzles();

    // Subscribe to latest puzzles
    const { latestPuzzles, loading: subLoading, error: subError } = useLatestPuzzles(input);

    // Combine initial and latest puzzles, preferring latest if available
    const puzzles = latestPuzzles.length > 0 ? latestPuzzles : initialPuzzles;

    const requestNewPuzzles = async () => {
        await fetchPuzzles(input);
    };

    return {
        puzzles,
        loading: initLoading || fetchLoading || subLoading,
        error: initError || fetchError || subError,
        requestNewPuzzles,
        refetch,
        message,
    };
}
