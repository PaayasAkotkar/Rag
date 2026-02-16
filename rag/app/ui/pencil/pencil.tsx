'use client'
import { useEffect, useState, useRef } from "react"
import { CSSMaths } from "@/app/misc/algorithm"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { makeSmallChange } from "@/app/misc/types"

interface input {
    write: string
    startDelay?: number
    forceStop?: boolean
    onWritingStart?: () => void
    onWritingComplete?: () => void
    makeSmallChanges?: makeSmallChange
}
export default function Pencil({
    write,
    startDelay = 100,
    forceStop = false,
    onWritingStart,
    onWritingComplete,
    makeSmallChanges
}: input) {
    const [text, setText] = useState<string>("")
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentIndexRef = useRef<number>(0)
    const isWritingRef = useRef<boolean>(false)
    const previousWriteRef = useRef<string>("")

    // stop animation
    useEffect(() => {
        if (forceStop && isWritingRef.current) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
            isWritingRef.current = false
            onWritingComplete?.()
        }
    }, [forceStop])

    // start animation
    useEffect(() => {
        if (write !== previousWriteRef.current) {
            previousWriteRef.current = write
            setText("")
            currentIndexRef.current = 0
            isWritingRef.current = false

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }

        if (forceStop || !write || isWritingRef.current) {
            return
        }

        const startWriting = () => {
            isWritingRef.current = true
            onWritingStart?.()

            const writeNextChar = () => {
                if (currentIndexRef.current < write.length && !forceStop) {
                    currentIndexRef.current++
                    setText(write.slice(0, currentIndexRef.current))
                    timeoutRef.current = setTimeout(writeNextChar, 100)
                } else if (currentIndexRef.current >= write.length) {
                    isWritingRef.current = false
                    onWritingComplete?.()
                }
            }

            timeoutRef.current = setTimeout(writeNextChar, 100)
        }

        timeoutRef.current = setTimeout(startWriting, startDelay)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                timeoutRef.current = null
            }
        }
    }, [write, forceStop])

    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom
    const fontSize = CSSMaths.GenerateClamp(makeSmallChanges?.fontSize ?? 100, 1920, 0.90, 'px', counterScale)
    // imp for mobile devices else the color will be considered as white
    const textColor = makeSmallChanges?.textColor ?? 'black'

    return (
        <div
            className="whitespace-pre-wrap"
            style={{ fontSize: fontSize, color: textColor }}
        >
            {text}
        </div>
    )
}