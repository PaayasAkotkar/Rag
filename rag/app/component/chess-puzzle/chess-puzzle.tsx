'use client'
import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CSSMaths } from '@/app/misc/algorithm';
import useChessGraphql from "@/app/services/chess-graphql/chess-graphql";
import BlurFilter from '@/app/ui/filter/blur/blur';
import { getPieceUnicode, fenRecord, Piece } from './misc';
import ProBookV1 from '@/app/ui/pro-books/pro-bookV1/pro-bookV1';
import { colorPallete } from '@/app/misc/color-pallete';
import { respBaseWidth, respZoom } from '@/app/misc/sheet';
import EvalBar from '@/app/ui/eval-bar/eval-bar';

// @todo resp left
// claude generated chessPuzzle some of the sutff is done by me
export default function ChessPuzzle() {
    const { puzzles } = useChessGraphql('room1');
    const [reachSquare, setReachSquare] = useState<string | null>(null)

    const [pieceMap, setPieceMap] = useState<Record<string, Piece>>({});
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

    const config = {
        design: { width: 1920, zoom: 0.67 },
        sizes: { square: 250, padding: 16, font: 52, piece: 134 },
        colors: {
            light: colorPallete.$white_pallete.white3, dark: colorPallete.$yellow_palletes.yellow9, accent: 'black',
            label: 'black', boardBorder: 'black',
        }
    };

    const styles = useMemo(() => ({
        square: CSSMaths.GenerateClamp(config.sizes.square, respBaseWidth, respZoom, 'px'),
        padding: CSSMaths.GenerateClamp(config.sizes.padding, respBaseWidth, respZoom, 'px'),
        fontSize: CSSMaths.GenerateClamp(config.sizes.font, respBaseWidth, respZoom, 'px'),
        pieceSize: CSSMaths.GenerateClamp(config.sizes.piece, respBaseWidth, respZoom, 'px'),
    }), []);

    useEffect(() => {
        if (puzzles && puzzles.length > 0) {
            setPieceMap(fenRecord(puzzles[0].fen));
        }
    }, [puzzles]);

    const handleSquareClick = (squareId: string) => {
        if (!selectedSquare) {
            if (pieceMap[squareId]) setSelectedSquare(squareId);
            return;
        }

        if (selectedSquare === squareId) {
            setSelectedSquare(null);
            return;
        }

        const newMap = { ...pieceMap };
        const movingPiece = newMap[selectedSquare];

        setReachSquare(squareId);
        delete newMap[selectedSquare];
        newMap[squareId] = movingPiece;

        setPieceMap(newMap);
        setSelectedSquare(null);
    };

    const boardData = useMemo(() => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
        return ranks.flatMap((rank, rIdx) =>
            files.map((file, fIdx) => ({
                id: `${file}${rank}`,
                isDark: (rIdx + fIdx) % 2 === 1,
                rank, file,
                isFirstColumn: fIdx === 0,
                isLastRow: rIdx === 7,
            }))
        );
    }, []);

    if (!puzzles) return <div className="h-screen flex items-center justify-center">Loading...</div>;



    return (
        <ProBookV1 bg={colorPallete.$green_palletes.green11}>
            <div className='w-full flex flex-row'>
                <div>
                    <EvalBar evvalScore={1.2}></EvalBar>
                </div>
                <div
                    className="w-full flex items-center justify-center relative"
                    style={{
                        padding: styles.padding,
                    }}
                >
                    <div
                        className="grid grid-cols-8 grid-rows-8"
                        style={{ width: `calc(${styles.square} * 8)`, height: `calc(${styles.square} * 8)` }}
                    >
                        {boardData.map((square) => {
                            const piece = pieceMap[square.id];
                            const isSelected = selectedSquare === square.id;

                            return (
                                <div
                                    key={square.id}
                                    onClick={() => handleSquareClick(square.id)}
                                    className="relative flex items-center justify-center cursor-pointer"
                                    style={{
                                        width: styles.square,
                                        height: styles.square,
                                        backgroundColor: isSelected ? '#E8F0FE' : (square.isDark ? config.colors.dark : config.colors.light),
                                        border: `0.5px solid ${config.colors.boardBorder}`
                                    }}
                                >
                                    {
                                        isSelected &&
                                        <div className='inset-0 w-full absolute overflow-hidden'>
                                            <BlurFilter triggerAnimation={true}></BlurFilter>
                                        </div>
                                    }
                                    {
                                        reachSquare && reachSquare === square.id &&
                                        <div className='inset-0 w-full absolute overflow-hidden'>
                                            <BlurFilter triggerAnimation={true}></BlurFilter>
                                        </div>
                                    }

                                    {/* Piece Container */}
                                    {piece && (
                                        <motion.div
                                            layoutId={piece.id}
                                            transition={{
                                                type: "spring",
                                                stiffness: 350,
                                                damping: 30
                                            }}
                                            animate={{
                                                scale: isSelected ? 1.2 : 1,
                                                y: isSelected ? -8 : 0,
                                                zIndex: isSelected ? 50 : 10
                                            }}
                                            className="select-none flex items-center justify-center pointer-events-none"
                                            style={{
                                                fontSize: styles.pieceSize,
                                                color: piece.type === piece.type.toUpperCase() ? '#202124' : '#5F6368',
                                                position: 'absolute' // Absolute ensures it stays centered in the square
                                            }}
                                        >

                                            {getPieceUnicode(piece.type)}
                                        </motion.div>
                                    )}

                                    {/* Coordinates */}
                                    {square.isFirstColumn && (
                                        <span className="absolute top-1 left-1 opacity-60 font-bold pointer-events-none" style={{ fontSize: styles.fontSize }}>{square.rank}</span>
                                    )}
                                    {square.isLastRow && (
                                        <span className="absolute bottom-1 right-1 opacity-60 font-bold pointer-events-none" style={{ fontSize: styles.fontSize }}>{square.file}</span>
                                    )}

                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </ProBookV1 >

    );
}