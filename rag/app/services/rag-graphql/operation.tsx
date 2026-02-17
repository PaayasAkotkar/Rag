import { gql } from "@apollo/client";

export interface ChessCoachMiscEntry {
  key: string
  value: ChessCoachMiscItems
}

export interface ChessCoachMiscItems {
  title?: string
  desc?: string
  canCopy?: boolean
  isLink?: boolean
  link?: string
  copy?: string

}

export interface ChessCoachReply {
  year?: string
  title?: string
  desc?: string
  outro?: string
  miscItems?: ChessCoachMiscEntry[]
}


export const ChessStudent_REQUEST = gql`
  mutation askChessCoach($input: ChessStudentRequest) {
    askChessCoach(input: $input) {
      status
      message
    }
  }
`;


export interface ChessStudentRequest {
  id: string
  name: string
  query: string;
}

export interface ChessCoachMiscItems {
  title?: string
  desc?: string
  canCopy?: boolean
  isLink?: boolean
}



export interface OnChessCoachReply {
  information?: ChessCoachReply
  suggestion?: ChessCoachReply
  bestPractice?: ChessCoachReply
  miscItems?: ChessCoachMiscEntry[]
}

export interface ChessCoachPayload {
  status: number
  message: string
}

export const INIT_CHESS_SUGESSTION = gql`
  query  initCoachSuggestions($input: ChessStudentRequest) {
     initCoachSuggestions(input: $input) {
      information {
        year
        title
        desc
        outro
        miscItems {
          key
          value {
             title
             desc
             copy
             link
             canCopy
             isLink
          }
        }
      }
      suggestion {
        year
        title
        desc
        outro
        miscItems {
          key
          value {
             title
             desc
             copy
             link
             canCopy
             isLink
          }
        }
      }
      bestPractice {
        year
        title
        desc
        outro
        miscItems {
          key
          value {
             title
             desc
             copy
             link
             canCopy
             isLink
          }
        }
      }
      miscItems {
        key
        value {
           title
           desc
           canCopy
           copy
           link
           isLink
        }
      }
    }
  }
`;


export const ON_ChessCoach_REPLY = gql`
  subscription chessCoachReply($input: ChessStudentRequest) {
    chessCoachReply(input: $input) {
     information {
        year
        title
        desc
        outro
        miscItems {
          key
          value {
             title
             desc
             copy
             link
             canCopy
             isLink
          }
        }
      }
      suggestion {
        year
        title
        desc
        outro
        miscItems {
          key
          value {
             title
             desc
             canCopy
             copy
             link
             isLink
          }
        }
      }
      bestPractice {
        year
        title
        desc
        outro
        miscItems {
          key
          value {
             title
             desc
             canCopy
             copy
             link
             isLink
          }
        }
      }
      miscItems {
        key
        value {
           title
           desc
           canCopy
           copy
           link
           isLink
        }
      }
    }
  }
`;
