'use client'
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CSSMaths } from '@/app/misc/algorithm';
// claude generated chessGrid
export default function ChessGrid() {
    const [activeSquare, setActiveSquare] = useState<any>(null);

    const config = {
        design: {
            width: 1920,
            zoom: 0.67,
        },
        sizes: {
            square: 80,
            padding: 16,
            font: 12,
            piece: 44,
        },
        colors: {
            light: '#FFFFFF',
            dark: '#F1F3F4',
            accent: '#1A73E8',
            label: '#5F6368',
            boardBorder: '#DADCE0',
            shadow: 'rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px'
        }
    }

    const styles = useMemo(() => ({
        square: CSSMaths.GenerateClamp(config.sizes.square, config.design.width, config.design.zoom),
        padding: CSSMaths.GenerateClamp(config.sizes.padding, config.design.width, config.design.zoom),
        fontSize: CSSMaths.GenerateClamp(config.sizes.font, config.design.width, config.design.zoom),
        pieceSize: CSSMaths.GenerateClamp(config.sizes.piece, config.design.width, config.design.zoom),
    }), [config])

    const boardData = useMemo(() => {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
        const ranks = [8, 7, 6, 5, 4, 3, 2, 1]

        return ranks.flatMap((rank, rIdx) =>
            files.map((file, fIdx) => ({
                id: `${file}${rank}`,
                file,
                rank,
                isDark: (rIdx + fIdx) % 2 === 1,
                isFirstColumn: fIdx === 0,
                isLastRow: rIdx === 7,
                hasPiece: rank === 7 || rank === 2 || rank === 8 || rank === 1
            }))
        )
    }, [])

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 font-sans text-[#202124]">
            <header className="mb-10 text-center">
                <h1 className="text-3xl font-normal text-[#3C4043] mb-2">Google Chess</h1>
                <div className="flex justify-center gap-2">
                    <div className="h-1 w-8 bg-[#4285F4] rounded-full" />
                    <div className="h-1 w-8 bg-[#EA4335] rounded-full" />
                    <div className="h-1 w-8 bg-[#FBBC05] rounded-full" />
                    <div className="h-1 w-8 bg-[#34A853] rounded-full" />
                </div>
            </header>

            {/* Material Board Container */}
            <div
                className="bg-white rounded-xl relative overflow-hidden transition-shadow duration-300"
                style={{
                    padding: styles.padding,
                    boxShadow: config.colors.shadow,
                    border: `1px solid ${config.colors.boardBorder}`
                }}
            >
                <div
                    className="grid grid-cols-8 grid-rows-8"
                    style={{
                        width: `calc(${styles.square} * 8)`,
                        height: `calc(${styles.square} * 8)`,
                        border: `0.5px solid ${config.colors.boardBorder}`
                    }}
                >
                    {boardData.map((square) => (
                        <motion.div
                            key={square.id}
                            onClick={() => setActiveSquare(square.id)}
                            whileHover={{ zIndex: 10 }}
                            className="relative flex items-center justify-center cursor-pointer overflow-hidden"
                            style={{
                                width: styles.square,
                                height: styles.square,
                                backgroundColor: square.isDark ? config.colors.dark : config.colors.light,
                                border: `0.5px solid ${config.colors.boardBorder}`
                            }}
                        >
                            {/* Ripple Effect on Active */}
                            {activeSquare === square.id && (
                                <motion.div
                                    layoutId="ripple"
                                    className="absolute inset-0 bg-blue-500/10 z-0"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                />
                            )}

                            {/* Square Labels - Material Style */}
                            {square.isFirstColumn && (
                                <span
                                    className="absolute top-1 left-1 font-medium select-none pointer-events-none"
                                    style={{ fontSize: styles.fontSize, color: config.colors.label }}
                                >
                                    {square.rank}
                                </span>
                            )}
                            {square.isLastRow && (
                                <span
                                    className="absolute bottom-1 right-1 font-medium select-none pointer-events-none"
                                    style={{ fontSize: styles.fontSize, color: config.colors.label }}
                                >
                                    {square.file}
                                </span>
                            )}

                            {/* Piece - Minimalist Material Design */}
                            {square.hasPiece && (
                                <motion.div
                                    initial={false}
                                    animate={{
                                        scale: activeSquare === square.id ? 1.1 : 1,
                                        y: activeSquare === square.id ? -4 : 0
                                    }}
                                    className={`rounded-full relative z-10 transition-all duration-200 ${square.rank > 4
                                        ? 'bg-[#3C4043] shadow-md'
                                        : 'bg-white border border-[#DADCE0] shadow-sm'
                                        }`}
                                    style={{
                                        width: styles.pieceSize,
                                        height: styles.pieceSize,
                                    }}
                                />
                            )}

                            {/* Hover Overlay */}
                            <motion.div
                                className="absolute inset-0 bg-black opacity-0 transition-opacity pointer-events-none"
                                whileHover={{ opacity: 0.04 }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}