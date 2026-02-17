'use client'

import { CSSMaths } from "@/app/misc/algorithm"
import { useCopy } from "@/app/services/copy/copy"
import { useDevice } from "@/app/services/device/use-device"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { motion } from "motion/react"
import { useState } from "react"
import EditTextArea from "../edit-text/edit-text"
import RainbowPostComposorButton from "../buttons/post-composor-buttons/rainbow-post-composor-button/rainbow-post-composor-button"
import SquarePostComposorButton from "../buttons/post-composor-buttons/square-post-composor-button/square-post-composor-button"
import { makeSmallChange } from "@/app/misc/types"
import { respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"

interface input {
    query: string,
    onEdit?: (value: string) => void
    onClose?: () => void
    makeEditTextAreaSmallChange?: makeSmallChange
    makeSmallChange?: makeSmallChange
}

export default function MessageBubble({
    makeSmallChange,
    makeEditTextAreaSmallChange,
    onClose, query,
    onEdit }: input) {

    const { copy, isCopied } = useCopy()
    const mcs = makeSmallChange ?? {
    }
    const [isEditing, setIsEditing] = useState(false)
    const [_query] = useState(query)
    const _edit = isEditing ? 'cancel' : 'edit'
    const _copy = isCopied ? 'copied' : 'copy'

    const { zoom } = useZoomLevel()
    const { device } = useDevice()
    const counterScale = 1 / zoom

    const _w = mcs.width ?? device.isPcLandscape ? 900 : device.isMobilePortrait ? 200 : 300
    const f = mcs.fontSize ?? device.isPcLandscape ? 43 : device.isMobilePortrait ? 30 : 20

    const w = CSSMaths.GenerateClamp(_w, respBaseWidth, respZoom, 'vw', counterScale, respMin, respMax)

    const _fontSize = CSSMaths.GenerateClamp(f, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)

    const rounded = CSSMaths.GenerateClamp(10, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)

    const textColor = makeSmallChange?.textColor ?? 'black'

    return (
        <div className="flex flex-col w-fit gap-2">
            {
                isEditing ?
                    <EditTextArea
                        defaultValue={_query}
                        get={(value, triggered) => {
                            if (triggered) {
                                console.log('triggerd: ', triggered)
                                setIsEditing(false)
                                onEdit?.(value)
                            }
                        }}
                        makeSmallChange={makeEditTextAreaSmallChange}
                    />
                    :
                    <motion.div
                        style={{
                            borderRadius: rounded,
                            maxWidth: w,
                            overflow: 'hidden'
                        }}
                        className="w-fit p-3 bg-yellow1"
                    >
                        <p style={{
                            fontSize: _fontSize,
                            wordBreak: 'break-word', // Changed from break-all
                            whiteSpace: 'pre-wrap',
                            color: textColor,
                        }}>
                            {_query}
                        </p>
                    </motion.div>
            }
            <div className="flex flex-row justify-between items-start gap-2">
                <SquarePostComposorButton
                    title={_copy}
                    makeSmallChanges={mcs}
                    node={{ onClick: () => copy(_query) }}
                />
                <RainbowPostComposorButton
                    type="button"
                    makeSmallChanges={mcs}
                    alt="triangle"
                    src={"/logo/triangle-left.svg"}
                    node={{ onClick: onClose }}></RainbowPostComposorButton>
                <SquarePostComposorButton
                    makeSmallChanges={mcs}
                    title={_edit}
                    node={{ onClick: () => setIsEditing(prev => !prev) }}
                />
            </div>
        </div>
    )
}