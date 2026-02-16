'use client'
import { useState, useEffect, } from "react"
import ProBookV1 from "../pro-books/pro-bookV1/pro-bookV1"
import { colorPallete } from "@/app/misc/color-pallete"
import { CSSMaths } from "@/app/misc/algorithm"
import { useDevice } from "@/app/services/device/use-device"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import MessageBubble from "../message-bubble/message-bubble"
import { OnChessCoachReply } from "@/app/services/rag-graphql/operation"
import Writer from "./misc"
import { makeSmallChange } from "@/app/misc/types"
import { respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"

interface InputProps {
    note?: OnChessCoachReply
    userNote: string
    onReask?: (value: string) => void
    makeWriterSmallChange?: makeSmallChange
    makeMessageBubbleSmallChange?: makeSmallChange
    makeFrameSmallChange?: makeSmallChange
}

interface IsClose {
    isClose: boolean
    Index: number
}

export default function NoteBook({ makeFrameSmallChange, userNote, note, onReask, makeWriterSmallChange, makeMessageBubbleSmallChange }: InputProps) {
    const [history, setHistory] = useState<({ type: 'user', content: string } | { type: 'coach', content: OnChessCoachReply })[]>([])
    const [closedNotes, setClosedNotes] = useState<Set<number>>(new Set())
    const [stoppedWriters, setStoppedWriters] = useState<Set<number>>(new Set())
    const [isWriting, setIsWriting] = useState<{ [key: number]: boolean }>({})
    const [isClosed, setIsClosed] = useState<Record<number, IsClose>>({})

    useEffect(() => {
        if (userNote) {
            setHistory(prev => {
                if (prev == null)
                    return [{ type: 'user', content: userNote }]
                return [...prev, { type: 'user', content: userNote }]
            })
        }
    }, [userNote])

    useEffect(() => {
        if (note) {
            setHistory(prev => {
                if (prev == null)
                    return [{ type: 'coach', content: note }]
                return [...prev, { type: 'coach', content: note }]
            })
        }
    }, [note])

    const handleToggleNote = (index: number) => {
        const isCurrentlyClosed = isClosed[index]?.isClose ?? false

        if (isCurrentlyClosed) {
            setIsClosed(prev => ({
                ...prev,
                [index]: { isClose: false, Index: index }
            }))

            setClosedNotes(prev => {
                const newSet = new Set(prev)
                newSet.delete(index)
                if (history[index + 1] && history[index + 1].type === 'coach') {
                    newSet.delete(index + 1)
                }
                return newSet
            })
        } else {

            const nextIndex = index + 1
            const isNextWriting = history[nextIndex] && history[nextIndex].type === 'coach' && isWriting[nextIndex]

            if (isNextWriting) {
                handleStopWriting(index)
                setTimeout(() => {
                    setIsClosed(prev => ({
                        ...prev,
                        [index]: { isClose: true, Index: index }
                    }))
                    setClosedNotes(prev => new Set(prev).add(index))
                    if (history[nextIndex] && history[nextIndex].type === 'coach') {
                        setClosedNotes(prev => new Set(prev).add(nextIndex))
                    }
                }, 100)
            } else {
                setIsClosed(prev => ({
                    ...prev,
                    [index]: { isClose: true, Index: index }
                }))
                setClosedNotes(prev => new Set(prev).add(index))
                if (history[nextIndex] && history[nextIndex].type === 'coach') {
                    setClosedNotes(prev => new Set(prev).add(nextIndex))
                }
            }
        }
    }

    const handleStopWriting = (index: number) => {
        setStoppedWriters(prev => new Set(prev).add(index))
        setIsWriting(prev => ({ ...prev, [index]: false }))

        if (history[index + 1] && history[index + 1].type === 'coach') {
            setStoppedWriters(prev => new Set(prev).add(index + 1))
            setIsWriting(prev => ({ ...prev, [index + 1]: false }))
        }
    }

    const handleWritingStart = (index: number) => {
        setIsWriting(prev => ({ ...prev, [index]: true }))
    }

    const handleWritingComplete = (index: number) => {
        setIsWriting(prev => ({ ...prev, [index]: false }))
    }

    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom
    const { device } = useDevice()
    const f = (device.isPcLandscape ? 93 : device.isMobilePortrait ? 60 : 40)
    const fontSize = CSSMaths.GenerateClamp(f, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)

    return (
        <ProBookV1
            makeSmallChanges={makeFrameSmallChange}
            bg={colorPallete.$green_palletes.green11}>
            <div
                style={{
                    scrollbarColor: `black transparent`,
                }}
                className="h-full w-full overflow-y-auto overflow-x-hidden p-6 flex flex-col"
            >
                {history.map((item, index) => {
                    const isCurrentlyClosed = isClosed[index]?.isClose ?? false

                    if (item.type === 'user') {
                        return (
                            <div key={index} className="w-full">
                                {
                                    (item.content as string).length > 0 &&
                                    <MessageBubble
                                        makeEditTextAreaSmallChange={makeMessageBubbleSmallChange}
                                        makeSmallChange={makeMessageBubbleSmallChange}
                                        query={isCurrentlyClosed ? `${(item.content as string).slice(0, 50)}...` : item.content as string}
                                        onEdit={(val) => onReask?.(val)}
                                        onClose={() => handleToggleNote(index)}
                                    />
                                }
                            </div>
                        )
                    } else {
                        const note = item.content as OnChessCoachReply
                        const shouldStop = stoppedWriters.has(index)
                        const isCoachClosed = closedNotes.has(index)
                        return (
                            <div key={index} className="w-full">
                                <div
                                    className="rounded-lg p-4 w-full max-w-full"
                                    style={{
                                        display: isCoachClosed ? 'none' : 'block',
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word'
                                    }}
                                >
                                    {
                                        note.information &&
                                        <div className="flex flex-col gap-2 w-full">
                                            <Writer
                                                makeSmallChange={makeWriterSmallChange}
                                                startDelay={50}
                                                note={note.information}
                                                forceStop={shouldStop}
                                                onWritingStart={() => handleWritingStart(index)}
                                                onWritingComplete={() => handleWritingComplete(index)}
                                            />
                                        </div>
                                    }
                                    {
                                        note.suggestion &&
                                        <div className="flex flex-col gap-2 w-full">
                                            <Writer
                                                makeSmallChange={makeWriterSmallChange}
                                                startDelay={70}
                                                note={note.suggestion}
                                                forceStop={shouldStop}
                                                onWritingStart={() => handleWritingStart(index)}
                                                onWritingComplete={() => handleWritingComplete(index)}
                                            />
                                        </div>
                                    }
                                    {
                                        note.bestPractice &&
                                        <div className="flex flex-col gap-2 w-full">
                                            <Writer
                                                makeSmallChange={makeWriterSmallChange}
                                                startDelay={80}
                                                note={note.bestPractice}
                                                forceStop={shouldStop}
                                                onWritingStart={() => handleWritingStart(index)}
                                                onWritingComplete={() => handleWritingComplete(index)}
                                            />
                                        </div>
                                    }
                                    {
                                        note.miscItems &&
                                        <div className="flex flex-col gap-2 w-full">
                                            <Writer
                                                makeSmallChange={makeWriterSmallChange}
                                                startDelay={90}
                                                note={{ miscItems: note.miscItems }}
                                                forceStop={shouldStop}
                                                onWritingStart={() => handleWritingStart(index)}
                                                onWritingComplete={() => handleWritingComplete(index)}
                                            />
                                        </div>
                                    }
                                </div>
                                <div
                                    style={{ display: isCoachClosed ? 'block' : 'none' }}
                                    className="rounded-lg p-4 w-full cursor-pointer"
                                    onClick={() => handleToggleNote(index - 1)}
                                >
                                    <span style={{ fontSize: fontSize }}>...</span>
                                </div>
                            </div>
                        )
                    }
                })}
            </div>
        </ProBookV1>
    )
}