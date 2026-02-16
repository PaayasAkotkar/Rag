'use client'
import { CSSMaths } from "@/app/misc/algorithm"
import { respBaseHeight, respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"
import { makeSmallChange } from "@/app/misc/types"
import { useDevice } from "@/app/services/device/use-device"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { motion } from "motion/react"
import { useEffect, useState } from "react"
import BlurFilter from "../filter/blur/blur"
import { colorPallete } from "@/app/misc/color-pallete"

interface input {
    makeSmallChanges?: makeSmallChange
    evvalScore: number // centipawns or mate score
    whiteTheme?: string
    blackTheme?: string
}

export default function EvalBar({ evvalScore, makeSmallChanges, whiteTheme, blackTheme }: input) {
    const [winPerc, setWinPerc] = useState<number>(50) // Start at 50% (equal position)

    // formula link: https://lichess.org/@/jk_182/blog/expected-score-of-grandmasters-based-on-evaluation/GB9sX2ab
    useEffect(() => {
        const k = 0.00368208 // Adjusted constant for better scaling
        const rawPercentage = 50 + 50 * (2 / (1 + Math.exp(-k * evvalScore)) - 1)
        const clampedPercentage = Math.max(0, Math.min(100, rawPercentage))
        setWinPerc(clampedPercentage)
    }, [evvalScore])

    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom
    const { device } = useDevice()

    const _w = makeSmallChanges?.width ?? (device.isPcLandscape ? 150 : device.isMobilePortrait ? 30 : 40)
    const _h = makeSmallChanges?.height ?? (device.isPcLandscape ? 800 : device.isMobilePortrait ? 500 : 550)
    const _f = makeSmallChanges?.height ?? (device.isPcLandscape ? 70 : device.isMobilePortrait ? 60 : 65)


    const w = CSSMaths.GenerateClamp(_w, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)
    const h = CSSMaths.GenerateClamp(_h, respBaseHeight, respZoom, 'vh', counterScale, respMin, respMax)
    const f = CSSMaths.GenerateClamp(_f, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)



    const _whiteTheme = whiteTheme ?? colorPallete.$voilet_pallete.voilet1
    const _blackTheme = blackTheme ?? colorPallete.$yellow_palletes.yellow8

    const displayEval = evvalScore >= 0
        ? `+${(evvalScore / 100).toFixed(1)}`
        : (evvalScore / 100).toFixed(1)

    const whiteTirColor: { right: string, left: string, mid: string } = makeSmallChanges?.triColor ?? {
        right: colorPallete.$green_palletes.green1, left: colorPallete.$voilet_pallete.voilet1,
        mid: colorPallete.$yellow_palletes.yellow1
    }
    const blackTriColor: { right: string, left: string, mid: string } = makeSmallChanges?.triColor ?? {
        right: colorPallete.$red_pallete.red1, left: colorPallete.$blue_pallete.blue1,
        mid: colorPallete.$yellow_palletes.yellow1
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <motion.div
                className="px-2 py-1 rounded"
                style={{
                    backgroundColor: 'white',
                    color: 'black'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <span style={{ fontSize: f }}>
                    {displayEval}
                </span>
            </motion.div>

            <motion.div
                style={{
                    width: w,
                    height: h,
                    backgroundColor: _blackTheme,
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
                className="relative"
            >
                <div className="absolute bottom-0 w-full h-full">
                    <motion.div
                        initial={{ height: '50%' }}
                        animate={{
                            height: `${winPerc}%`,
                            backgroundColor: _whiteTheme
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 100,
                            damping: 20,
                            duration: 0.5
                        }}
                        className="relative w-full h-full overflow-hidden"
                    >
                        <BlurFilter
                            triggerAnimation={true}
                            tricolor={whiteTirColor}
                        />

                    </motion.div>
                </div>

                <div
                    className="absolute w-full h-[2px] left-0 z-10"
                    style={{ top: '50%', transform: 'translateY(-50%)' }}
                />

                <div className="absolute bottom-0 w-full h-full">
                    <   motion.div className="absolute inset-0 flex items-center justify-center z-20"
                        style={{
                            color: winPerc > 50 ? _blackTheme : _whiteTheme,
                            mixBlendMode: 'difference'
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.7 }}
                    >

                        <BlurFilter
                            tricolor={blackTriColor}
                            triggerAnimation={true}
                        />

                    </motion.div>
                </div>


            </motion.div>
        </div>
    )
}