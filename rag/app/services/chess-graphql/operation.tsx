import { gql } from "@apollo/client";

// Query to initialize puzzles
export const INIT_PUZZLES = gql`
  query InitPuzzles($input: PuzzleInput!) {
    initPuzzles(input: $input) {
      id
      fen
      moves
      rating
      popularity
      themes
    }
  }
`;

// Mutation to get new puzzles
export const GET_PUZZLES = gql`
  mutation GetPuzzles($input: PuzzleInput!) {
    getPuzzles(input: $input) {
      msg
    }
  }
`;

// Subscription to listen for latest puzzles
export const LATEST_PUZZLES = gql`
  subscription LatestPuzzles($input: PuzzleInput!) {
    latestPuzzles(input: $input) {
      id
      fen
      moves
      rating
      popularity
      themes
    }
  }
`;
