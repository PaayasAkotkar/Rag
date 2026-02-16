'use client'
import { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import RainbowPostComposorButton from "../buttons/post-composor-buttons/rainbow-post-composor-button/rainbow-post-composor-button";
import { CSSMaths } from "@/app/misc/algorithm";
import { useZoomLevel } from "@/app/services/zoom/use-zoom";
import TextFrame from "../text-frame/text-frame";
import { makeSmallChange } from "@/app/misc/types";
import { respBaseHeight, respMax, respMin, respZoom } from "@/app/misc/sheet";

interface input {
    get?: (value: string) => void
    makeSmallChanges?: makeSmallChange
}

export default function TextArea({ get, makeSmallChanges }: input) {

    const { watch, register, reset, handleSubmit } = useForm<{ text: string }>()
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const currentText = watch('text') ?? ''
    const [initialHeight, setInitialHeight] = useState<number | null>(null)

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(onSubmit)()
        }
    }

    const onSubmit: SubmitHandler<{ text: string }> = (data: { text: string }) => {
        get?.(data.text)
        reset({ text: "" })
        if (textareaRef.current && initialHeight) {
            textareaRef.current.style.height = `${initialHeight}px`
        }
    }

    const eraseText = () => {
        reset({ text: "" })
        if (textareaRef.current && initialHeight) {
            textareaRef.current.style.height = `${initialHeight}px`
        }
    }

    useEffect(() => {
        if (textareaRef.current && initialHeight === null) {
            setInitialHeight(textareaRef.current.scrollHeight)
        }
    }, [initialHeight])

    useEffect(() => {
        if (textareaRef.current) {
            if (currentText.length === 0 && initialHeight) {
                textareaRef.current.style.height = `${initialHeight}px`
            } else {
                textareaRef.current.style.height = 'auto'
                textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
            }
        }
    }, [currentText, initialHeight])

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
    }, [initialHeight])

    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom

    const fontSize = CSSMaths.GenerateClamp(makeSmallChanges?.fontSize ?? 300, respBaseHeight, respZoom, 'px', counterScale, respMin, respMax)
    const textColor = makeSmallChanges?.textColor ?? 'black'

    return (
        <TextFrame size={makeSmallChanges?.frameSize}>
            <form className="w-full" onSubmit={handleSubmit(onSubmit)}>
                <textarea
                    {...register('text')}
                    ref={(e) => {
                        register('text').ref(e)
                        textareaRef.current = e
                    }}
                    onKeyDown={(e) => handleKeyDown(e)}
                    rows={1}
                    autoFocus={true}
                    style={{
                        scrollbarColor: 'black transparent',
                        fontSize: fontSize,
                        color: textColor,
                        backgroundColor: 'transparent',
                        minHeight: 'auto',
                        maxHeight: '300px',
                        overflow: 'auto',
                    }}
                    className='resize-none w-full focus:outline-none pl-3'
                />
                <div className='w-full relative right-1 p-2 flex flex-row justify-between'>
                    <div>
                        <RainbowPostComposorButton
                            type="button"
                            makeSmallChanges={makeSmallChanges}
                            title="X"
                            node={{ onClick: eraseText }}
                        />
                    </div>
                    <div>
                        <RainbowPostComposorButton
                            type="submit"
                            makeSmallChanges={makeSmallChanges}
                            node={{ onClick: handleSubmit(onSubmit) }}
                            src="/logo/triangle.svg"
                            alt="triangle"
                        />
                    </div>
                </div>
            </form>
        </TextFrame>
    )
}