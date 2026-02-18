'use client'
import { CSSMaths } from "@/app/misc/algorithm"
import { colorPallete } from "@/app/misc/color-pallete"
import { useCopy } from "@/app/services/copy/copy"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import SquarePostComposorButton from "../buttons/post-composor-buttons/square-post-composor-button/square-post-composor-button"
import Pencil from "../pencil/pencil"
import { ChessCoachMiscItems } from "@/app/services/rag-graphql/operation"
import MiscBackground from "./copy"
import { useState } from "react"
import { makeSmallChange } from "@/app/misc/types"
import { useDevice } from "@/app/services/device/use-device"
import { respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"

interface input {
    misc: ChessCoachMiscItems
    startDelay?: number
    forceStop?: boolean
    makeSmallChanges?: makeSmallChange
}

export default function MiscItem({ makeSmallChanges, startDelay, misc, forceStop = false }: input) {
    const { copy, isCopied } = useCopy()
    const _copy = isCopied ? 'copied' : 'copy'
    const [isCopyReady, setIsCopyReady] = useState(false)
    const [isLinkReady, setIsLinkReady] = useState(false)

    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom
    const { device } = useDevice()

    const fontSize = CSSMaths.GenerateClamp(makeSmallChanges?.fontSize ?? 100, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)

    return (
        <div className="w-full max-w-full p-2">
            {misc.title && (
                <Pencil
                    startDelay={startDelay}
                    makeSmallChanges={makeSmallChanges}
                    write={misc.title}
                    forceStop={forceStop}
                />
            )}

            {misc.desc && (
                <Pencil
                    startDelay={startDelay}
                    makeSmallChanges={makeSmallChanges}
                    write={misc.desc}
                    forceStop={forceStop}
                />
            )}

            {misc.canCopy && misc.copy && (
                <MiscBackground>
                    <div
                        style={{
                            flexDirection: device.isMobilePortrait ? 'column' : 'row'
                        }}
                        className="flex gap-2 items-center">
                        <Pencil
                            startDelay={startDelay}
                            makeSmallChanges={makeSmallChanges}
                            write={misc.copy}
                            forceStop={forceStop}
                            onWritingComplete={() => setIsCopyReady(true)}
                        />
                        <SquarePostComposorButton
                            makeSmallChanges={makeSmallChanges}
                            title={_copy}
                            node={{
                                onClick: () => copy(misc.copy ?? ""),
                                disabled: !isCopyReady,
                                style: { opacity: isCopyReady ? 1 : 0.5 }
                            }}
                        />
                    </div>
                </MiscBackground>
            )}

            {misc.isLink && misc.link && (
                <MiscBackground>
                    <a
                        href={isLinkReady ? misc.link : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !isLinkReady && e.preventDefault()}
                        style={{
                            fontSize: fontSize,
                            color: isLinkReady ? colorPallete.$blue_pallete.blue3 : 'gray',
                            cursor: isLinkReady ? 'pointer' : 'default'
                        }}
                        className="underline underline-offset-4 decoration-[1.1px]"
                    >
                        <Pencil
                            startDelay={startDelay}
                            makeSmallChanges={makeSmallChanges}
                            write={misc.link}
                            forceStop={forceStop}
                            onWritingComplete={() => setIsLinkReady(true)}
                        />
                    </a>
                </MiscBackground>
            )}
        </div>
    )
}
