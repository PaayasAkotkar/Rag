
export interface Piece {
    id: string;
    type: string;
    square: string
}
// fenRecord returns the fen string to current data
export function fenRecord(fen: string): Record<string, Piece> {
    if (!fen) return {}

    let res: Record<string, Piece> = {}
    let safe = fen.split(" ")[0]
    let decode = safe.includes("/") ? safe.split("/") : safe.split(/\s+/)
    let track: Record<string, number> = {}
    let files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
    decode.forEach((code, i) => {
        let rank = 8 - i
        let cur = 0

        for (let piece of code) {
            if (cur > 7) break
            let square = `${files[cur]}${rank}`
            let encode = parseInt(piece)
            if (isNaN(encode)) {
                track[piece] = (track[piece] ?? 0) + 1
                res[square] = {
                    id: `${piece}${track[piece]}`,
                    type: piece,
                    square: square
                }
                cur++
            } else {
                cur += encode
            }
        }
    })
    return res
}

// recordToFen returns the fen record to fen string
export function recordToFen(record: Record<string, Piece>,
    turn: 'w' | 'b' = 'w',
    halfmove: string = '0',
    fullmove: string = '1',
    castling: string = '-',
    enPassant: string = '-',

): string {
    let ranks: string[] = []

    // For each rank from 8 to 1
    for (let rank = 8; rank >= 1; rank--) {
        let rankStr = ''
        let lastFile = -1  // Track last file index we placed a piece

        // Get all pieces in this rank from the record
        for (let square in record) {
            if (square[1] == rank.toString()) {  // If piece is in current rank
                let file = square[0]
                let fileIndex = file.charCodeAt(0) - 'a'.charCodeAt(0)  // a=0, b=1, etc.
                let piece = record[square]

                // Calculate empty squares between last piece and this piece
                let emptyCount = fileIndex - lastFile - 1
                if (emptyCount > 0) {
                    rankStr += emptyCount
                }

                // Add the piece
                rankStr += piece.type
                lastFile = fileIndex
            }
        }

        // Add remaining empty squares to reach file 'h' (index 7)
        let remainingEmpty = 7 - lastFile
        if (remainingEmpty > 0) {
            rankStr += remainingEmpty
        }

        ranks.push(rankStr || '8')  // If rank is empty, use '8'
    }

    return ranks.join('/') + ` ${turn} ${castling} ${enPassant} ${halfmove} ${fullmove}`

}

// getPieceUnicode returns the piece unicode
export const getPieceUnicode = (p: string) => {
    const pieces: Record<string, string> = {
        'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
        'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
    };
    return pieces[p] ?? '';
};
