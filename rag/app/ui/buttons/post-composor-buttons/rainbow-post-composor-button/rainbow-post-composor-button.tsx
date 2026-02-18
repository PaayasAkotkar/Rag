'use client'
import { motion } from "motion/react"
import { useState, useEffect } from "react"
import { makeSmallChange, motionDefaultProps } from "@/app/misc/types"
import NormalFilter from "@/app/ui/filter/normal/normal"
import BlurFilter from "@/app/ui/filter/blur/blur"
import { CSSMaths } from "@/app/misc/algorithm"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"

interface input {
    src?: string,
    title?: string,
    alt?: string
    type?: "button" | "submit" | "reset"
    node?: motionDefaultProps<HTMLButtonElement>
    pause?: boolean
    makeSmallChanges?: makeSmallChange
}
export default function RainbowPostComposorButton({
    src, title, alt, node, pause, type = "button",
    makeSmallChanges,

}: input) {
    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom

    const mcs: makeSmallChange = makeSmallChanges ?? {
        size: 20,
        fontSize: 16,
        textColor: 'black',
        theme: "black",
        blurCap: "10px",
        blurEffect: false
    }

    const _size = mcs.size ?? 20
    const f = mcs.fontSize ?? 20
    const tc = mcs.btnTextColor ?? 'black'
    const th = mcs.theme ?? "black"
    const be = mcs.blurEffect ?? false
    const bc = mcs.blurCap ?? '10px'

    const w = CSSMaths.GenerateClamp(_size, respBaseWidth, respZoom, 'vh', counterScale, respMin, respMax)
    const h = CSSMaths.GenerateClamp(_size, respBaseWidth, respZoom, 'vh', counterScale, respMin, respMax)
    const fontSize = CSSMaths.GenerateClamp(f, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)

    const [click, setClick] = useState(pause ?? false)

    useEffect(() => {
        if (pause !== undefined) setClick(pause)
    }, [pause])

    const handleCombinedClick = (e: React.MouseEvent<any>) => {
        if (!click) setClick(true);
        const currentTarget = e.currentTarget;
        const rect = currentTarget.getBoundingClientRect();

        const delayedEvent = {
            ...e,
            currentTarget: { ...currentTarget, getBoundingClientRect: () => rect }
        } as unknown as React.MouseEvent<any>;

        if (node?.onClick) {
            setTimeout(() => node.onClick?.(delayedEvent), 400);
        }
    };


    return (
        <motion.button
            type={type ?? "button"}
            {...node}
            onClick={handleCombinedClick}
            initial="idle"
            style={{
                width: w,
                height: h,
                backgroundColor: th,
                padding: 0,
                flexShrink: 0,
            }}
            className="relative rounded-full flex items-center justify-center overflow-hidden border-none cursor-pointer"
        >
            {click && !be && (
                <NormalFilter onComplete={() => setClick(false)} tricolor={makeSmallChanges?.triColor} triggerAnimation={click} />
            )}
            {click && be && (
                <BlurFilter blurCap={bc} onComplete={() => setClick(false)} tricolor={makeSmallChanges?.triColor} triggerAnimation={click} />
            )}

            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none p-[15%]">
                {src && (
                    <img
                        className="w-full h-full object-contain"
                        src={src}
                        alt={alt ?? 'button icon'}
                    />
                )}
                {title && (
                    <span
                        className="font-medium whitespace-nowrap"
                        style={{
                            color: tc,
                            fontSize: fontSize
                        }}
                    >
                        {title}
                    </span>
                )}
            </div>
        </motion.button>
    );
}