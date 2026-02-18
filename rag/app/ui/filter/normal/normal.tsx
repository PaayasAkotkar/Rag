'use client'
import { colorPallete } from "@/app/misc/color-pallete"
import { animate, createTimeline } from "animejs"
import { useEffect, useRef } from "react"

// NormalFilter returns the filter of divs that are animated to create a normal filter effect
// @Tip: always use this as naked also for if else filter
interface input {
    tricolor?: { right: string, mid: string, left: string },
    triggerAnimation: boolean,
    onComplete?: () => void
}
export default function NormalFilter({ tricolor, triggerAnimation, onComplete }: input) {
    const _tricolor = tricolor || {
        right: colorPallete.$pink_pallete.pink1,
        mid: colorPallete.$orange_pallete.orange1,
        left: colorPallete.$green_palletes.green1
    }

    const rightRef = useRef<HTMLDivElement>(null)
    const midRef = useRef<HTMLDivElement>(null)
    const leftRef = useRef<HTMLDivElement>(null)

    const runEntranceAnimation = () => {
        if (midRef.current && leftRef.current && rightRef.current) {
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
                    runExitAnimation().then(() => {
                        if (onComplete) onComplete();
                    })
                })
        }
    }

    const runExitAnimation = (): Promise<any> => {
        if (midRef.current && leftRef.current && rightRef.current) {
            const timeline = createTimeline({ loop: false })
            return timeline
                .add(rightRef.current, { scale: 0, opacity: 0, easing: 'easeInExpo', duration: 400 })
                .add(leftRef.current, { scale: 0, opacity: 0, easing: 'easeInExpo', duration: 400 }, '-=300')
                .add(midRef.current, { scale: 0, opacity: 0, easing: 'easeInExpo', duration: 400 }, '-=300') as unknown as Promise<any>
        }
        return Promise.resolve()
    }

    useEffect(() => {
        if (triggerAnimation) {
            runEntranceAnimation()
        }
    }, [triggerAnimation])

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* RIGHT DIV */}
            <div
                ref={rightRef}
                style={{ backgroundColor: _tricolor.right, transform: 'scale(0)' }}
                className="absolute top-0 left-0 w-[150%] h-[150%] rounded-full translate-x-[-20%] translate-y-[-10%]" />

            {/* MID DIV */}
            <div
                ref={midRef}
                style={{ backgroundColor: _tricolor.mid, transform: 'scale(0)' }}
                className="absolute top-0 left-0 w-[150%] h-[150%] rounded-full translate-x-[-55%] translate-y-[20%] z-2" />

            {/* LEFT DIV */}
            <div
                ref={leftRef}
                style={{ backgroundColor: _tricolor.left, transform: 'scale(0)' }}
                className="absolute bottom-0 right-0 w-[150%] h-[150%] rounded-full translate-x-[70%] translate-y-[15%]" />
        </div>

    )
}