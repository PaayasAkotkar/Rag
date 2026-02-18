'use client'
import { motion } from "motion/react"
import { colorPallete } from "@/app/misc/color-pallete"
import { animate, createTimeline } from 'animejs'
import { useRef, useState, useEffect } from "react"
import { CSSMaths } from "@/app/misc/algorithm"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { makeSmallChange, motionDefaultProps } from "@/app/misc/types"
import BlurFilter from "../../../filter/blur/blur"
import NormalFilter from "../../../filter/normal/normal"
import Image from "next/image"
import { useDevice } from "@/app/services/device/use-device"

interface input {
    src?: string,
    title?: string,
    alt?: string
    node?: motionDefaultProps<HTMLButtonElement>
    makeSmallChanges?: makeSmallChange
}

export default function SquarePostComposorButton({
    makeSmallChanges, src, title, alt,
    node, }: input) {

    const { zoom } = useZoomLevel();
    const counterScale = 1 / zoom;
    const { device } = useDevice()

    const rightRef = useRef<HTMLDivElement>(null)
    const midRef = useRef<HTMLDivElement>(null)
    const leftRef = useRef<HTMLDivElement>(null)

    const [click, setClick] = useState(false)

    useEffect(() => {
        if (click && midRef.current && leftRef.current && rightRef.current) {
            const timeline = createTimeline({ loop: false })

            animate(midRef.current, { scale: [0, 1], opacity: [0, 1], duration: 0 })

            timeline
                .add(midRef.current, {
                    scale: [0, 1],
                    opacity: [0, 1],
                    easing: 'easeOutElastic(1, .8)',
                    duration: 600
                })
                .add(leftRef.current, {
                    scale: [0, 1],
                    opacity: [0, 1],
                    easing: 'easeOutElastic(1, .8)',
                    duration: 600
                }, '-=400')
                .add(rightRef.current, {
                    scale: [0, 1],
                    opacity: [0, 1],
                    easing: 'easeOutElastic(1, .8)',
                    duration: 600
                }, '-=400').then(() => {
                    setClick(false)
                })
        }
    }, [click])

    const handleCombinedClick = (e: React.MouseEvent<any>) => {
        if (!click) setClick(true);

        const currentTarget = e.currentTarget;
        const rect = currentTarget.getBoundingClientRect();

        const delayedEvent = {
            ...e,
            currentTarget: {
                ...currentTarget,
                getBoundingClientRect: () => rect,
            }
        } as unknown as React.MouseEvent<any>;

        if (node?.onClick) {
            setTimeout(() => {
                node?.onClick?.(delayedEvent);
            }, 200);
        }
    };

    const handleAnimationComplete = () => {
        setClick(false);
    }

    const [imgError, setImgError] = useState<boolean>(false)

    const tc = makeSmallChanges?.btnTextColor ?? 'black'
    const th = makeSmallChanges?.theme ?? "black"
    const be = makeSmallChanges?.blurEffect ?? false
    const bc = makeSmallChanges?.blurCap ?? '10px'

    const targetW = makeSmallChanges?.width ?? (device.isMobileLandscape ? 90 : (device.isMobilePortrait ? 168 : 110))
    const targetH = makeSmallChanges?.height ?? (device.isMobileLandscape ? 90 : (device.isMobilePortrait ? 168 : 19))
    const targetImg = device.isMobileLandscape ? 24 : (device.isMobilePortrait ? 28 : 32)
    const targetFont = makeSmallChanges?.fontSize ?? (device.isMobileLandscape ? 15 : (device.isMobilePortrait ? 55 : 47))

    const btnW = CSSMaths.GenerateClamp(targetW, 900, 0.90, 'vh', counterScale, 0.65, 1.4)
    const btnH = CSSMaths.GenerateClamp(targetH, 900, 0.90, 'vh', counterScale, 0.65, 1.4)
    const btnRound = CSSMaths.GenerateClamp(50, 900, 0.90, 'px', counterScale, 0.65, 1.4)
    const imgSize = CSSMaths.GenerateClamp(targetImg, 900, 0.90, 'vh', counterScale, 0.65, 1.4)
    const _fontSize = CSSMaths.GenerateClamp(targetFont, 920, 0.90, 'px', counterScale, 0.65, 1.4)

    const _tricolor = makeSmallChanges?.triColor ?? { right: colorPallete.$pink_pallete.pink1, mid: colorPallete.$orange_pallete.orange1, left: colorPallete.$green_palletes.green1 }

    return (
        <motion.button
            {...node}
            onClick={handleCombinedClick}
            style={{
                width: btnW,
                height: btnH,
                borderRadius: btnRound,
                backgroundColor: th,
            }}
            className="relative p-2 flex flex-row  max-w-full items-center justify-center gap-2  overflow-hidden "
        >
            {click && !be &&
                <NormalFilter onComplete={handleAnimationComplete} tricolor={_tricolor} triggerAnimation={click} />
            }
            {click && be &&
                <BlurFilter blurCap={bc} onComplete={handleAnimationComplete} tricolor={_tricolor} triggerAnimation={click} />
            }

            {(src || title) && (
                <div className="absolute flex items-center justify-center z-20 pointer-events-none gap-2">
                    {src && (
                        <div
                            className="rounded-full bg-white overflow-hidden flex-shrink-0"
                            style={{ width: imgSize, height: imgSize }}
                        >
                            {!imgError && (
                                <Image
                                    src={src}
                                    alt={alt ?? "img"}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            )}
                        </div>
                    )}
                    {title && (
                        <span
                            className="leading-none"
                            style={{ fontSize: _fontSize, color: tc }}
                        >
                            {title}
                        </span>
                    )}
                </div>
            )}
        </motion.button>
    )
}