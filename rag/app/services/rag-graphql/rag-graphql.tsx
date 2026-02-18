"use client";
import { useMutation, useSubscription } from "@apollo/client/react";
import { ChessCoachPayload, ChessStudent_REQUEST, ChessStudentRequest, ON_ChessCoach_REPLY, OnChessCoachReply } from "./operation";

// useRag is a custom hook that provides graphql rag functionality
export function useRag() {
  const [askChessCoachMutation, { loading: mutationLoading, error: mutationError }] = useMutation<
    { askChessCoach: ChessCoachPayload },
    { input: ChessStudentRequest }
  >(ChessStudent_REQUEST);
  const askAi = async (input: ChessStudentRequest) => {
    try {
      const result = await askChessCoachMutation({ variables: { input } });
      console.log("AI Request sent:", result.data?.askChessCoach);
      return result.data?.askChessCoach;
    } catch (err) {
      console.error("Error sending AI request:", err);
      throw err;
    }
  };

  const subscribeToReplies = (
    input: ChessStudentRequest,
  ) => {
    console.log("Starting subscription for room:", input.id);
    return null;
  };

  return {
    askAi,
    subscribeToReplies,
    mutationLoading,
    mutationError,
  };
}

// useRagSubscription is a custom hook that provides graphql rag real-time update functionality
export function useRagSubscription(input: ChessStudentRequest) {
  const { data, loading, error } = useSubscription<
    { chessCoachReply: OnChessCoachReply },
    { input: ChessStudentRequest }
  >(ON_ChessCoach_REPLY, {
    variables: { input },

    onData: ({ data }) => {
      console.log("Subscription data received:", data);
    },
    onError: (err) => {
      console.error("Subscription error:", err);
    },
    onComplete: () => {
      console.log("Subscription completed");
    },
  });

  return {
    aiReply: data?.chessCoachReply,
    subscriptionLoading: loading,
    subscriptionError: error,
  };
}