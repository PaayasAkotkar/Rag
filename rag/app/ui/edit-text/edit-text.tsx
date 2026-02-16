'use client'
import { CSSMaths } from "@/app/misc/algorithm";
import TextFrame from "../text-frame/text-frame";
import RainbowPostComposorButton from "../buttons/post-composor-buttons/rainbow-post-composor-button/rainbow-post-composor-button";
import { useZoomLevel } from "@/app/services/zoom/use-zoom";
import { useDevice } from "@/app/services/device/use-device";
import React, { useEffect, useState } from "react";
import { TextGhost } from "@/app/services/text-ghost/text-ghost";
import { makeSmallChange } from "@/app/misc/types";

interface input {
    get?: (value: string, triggered: boolean) => void
    defaultValue?: string
    makeSmallChange?: makeSmallChange
}

export default function EditTextArea({
    get,
    defaultValue,
    makeSmallChange
}: input) {
    const [text, setText] = useState(defaultValue ?? "")

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSubmit()
        }
    }

    const onSubmit = () => {
        get?.(text, true)
        setText(text)
    }

    const eraseText = () => {
        get?.(defaultValue ?? "", true)
    }


    useEffect(() => {
        const eraseEvent = (ev: KeyboardEvent) => {
            if (ev.key.toLowerCase() == 'delete') {
                ev.preventDefault()
                eraseText()
            }
        }

        window.addEventListener('keydown', eraseEvent)
        return () => {
            window.removeEventListener("keydown", eraseEvent);
        }
    }, [])

    const { zoom } = useZoomLevel()
    const { device } = useDevice()
    const counterScale = 1 / zoom
    const _frame = makeSmallChange?.frameSize ?? (device.isPcLandscape ? 500 : device.isMobilePortrait ? 450 : 300)
    const _fontSize = CSSMaths.GenerateClamp(makeSmallChange?.fontSize ?? 300, 1920, 0.90, 'px', counterScale)
    const textColor = makeSmallChange?.textColor ?? 'black'

    return (
        <TextFrame size={_frame}>
            <form className="w-full" onSubmit={onSubmit}>
                <div className='relative right-1 p-2 flex flex-row justify-between'>
                    <div>
                        <RainbowPostComposorButton
                            makeSmallChanges={makeSmallChange}
                            node={{ onClick: onSubmit }}
                            src="/logo/triangle.svg"
                            alt="triangle"
                        />
                    </div>
                    <div>
                        <RainbowPostComposorButton
                            makeSmallChanges={makeSmallChange}
                            title="X"
                            node={{ onClick: eraseText }}
                        />
                    </div>
                </div>
                <TextGhost
                    text={text}
                    fontSize={_fontSize}
                >
                    <textarea
                        onKeyDown={handleKeyDown}
                        defaultValue={text}
                        onFocus={(e) => {
                            const val = e.target.value;
                            e.target.setSelectionRange(val.length, val.length);
                        }}
                        onChange={(e) => {
                            setText(e.target.value)
                        }}
                        rows={1}
                        autoFocus={true}
                        style={{
                            fontSize: _fontSize,
                            border: 'none',
                            outline: 'none',
                            color: textColor,
                        }}
                        className='resize-none w-full focus:outline-none'
                    />
                </TextGhost>
            </form>
        </TextFrame>
    )
}