'use client'
import { ChessCoachReply } from "@/app/services/rag-graphql/operation"
import Pencil from "../pencil/pencil"
import MiscItem from "../misc-item/misc-item"
import { makeSmallChange } from "@/app/misc/types"

export default function Writer({
    note,
    startDelay,
    forceStop = false,
    onWritingStart,
    onWritingComplete,
    makeSmallChange
}: {
    note: ChessCoachReply | undefined,
    startDelay?: number,
    forceStop?: boolean,
    onWritingStart?: () => void,
    onWritingComplete?: () => void,
    makeSmallChange?: makeSmallChange
}) {

    return (
        <>
            {note &&
                <div className="w-full">
                    <div className="whitespace-pre-wrap w-full break-words">
                        {note.year && (
                            <Pencil
                                startDelay={startDelay}
                                write={note.year}
                                forceStop={forceStop}
                                onWritingStart={onWritingStart}
                                onWritingComplete={onWritingComplete}
                                makeSmallChanges={makeSmallChange}
                            />
                        )}
                        {note.title && (
                            <Pencil
                                startDelay={startDelay}
                                write={note.title}
                                forceStop={forceStop}
                                onWritingStart={onWritingStart}
                                onWritingComplete={onWritingComplete}
                                makeSmallChanges={makeSmallChange}
                            />
                        )}
                        {note.desc && (
                            <Pencil
                                startDelay={startDelay}
                                write={note.desc}
                                forceStop={forceStop}
                                onWritingStart={onWritingStart}
                                onWritingComplete={onWritingComplete}
                                makeSmallChanges={makeSmallChange}
                            />
                        )}
                        {note.miscItems && note.miscItems.map((item) => (
                            <MiscItem
                                startDelay={startDelay}
                                key={item.key}
                                misc={item.value}
                                forceStop={forceStop}
                                makeSmallChanges={makeSmallChange}
                            />
                        ))}
                        {note.outro && (
                            <Pencil
                                startDelay={startDelay}
                                write={note.outro}
                                forceStop={forceStop}
                                onWritingStart={onWritingStart}
                                onWritingComplete={onWritingComplete}
                                makeSmallChanges={makeSmallChange}
                            />
                        )}
                    </div>
                </div>
            }
        </>
    )
}