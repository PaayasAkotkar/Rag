import { gql } from "@apollo/client";

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

export const GET_PUZZLES = gql`
  mutation GetPuzzles($input: PuzzleInput!) {
    getPuzzles(input: $input) {
      msg
    }
  }
`;

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
