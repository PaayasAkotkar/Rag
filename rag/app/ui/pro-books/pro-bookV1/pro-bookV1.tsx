'use client'
import { CSSMaths } from "@/app/misc/algorithm"
import { colorPallete } from "@/app/misc/color-pallete"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { useRef, } from "react"
import { useDevice } from "@/app/services/device/use-device"
import { makeSmallChange } from "@/app/misc/types"
import { respBaseHeight, respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"

interface input {
    bg?: string
    makeSmallChanges?: makeSmallChange
    children?: React.ReactNode
}

export default function ProBookV1({ bg, children, makeSmallChanges }: input) {
    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom;
    const { device } = useDevice()

    const _w = makeSmallChanges?.width ?? (device.isPcLandscape ? 1800 : device.isMobilePortrait ? 700 : 1500)
    const _h = makeSmallChanges?.height ?? (device.isPcLandscape ? 900 : device.isMobilePortrait ? 1500 : 600)

    const w = CSSMaths.GenerateClamp(
        _w,
        respBaseWidth,
        respZoom,
        'vw',
        counterScale,
        respMin,
        respMax)

    const h = CSSMaths.GenerateClamp(
        _h,
        respBaseHeight,
        respZoom,
        'vh',
        counterScale,
        respMin,
        respMax)

    const rounded = CSSMaths.lazyGenerateClamp(
        30,
        respBaseWidth,
        respZoom,
        'px',
        respMin,
        counterScale
    )

    const _padding = CSSMaths.lazyGenerateClamp(
        10,
        respBaseWidth,
        respZoom,
        'px',
        respMin,
        counterScale
    )

    const proBookRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div style={{
                width: w,
                height: h,
                backgroundColor: bg ? bg : colorPallete.$blue_pallete.blue2,
                borderRadius: rounded,
                padding: _padding,
                overflow: 'hidden'
            }}>
                <div ref={proBookRef} className="w-full h-full grid grid-rows-[auto_1fr]">
                    <div className="w-full h-full relative flex flex-col justify-between overflow-hidden rounded-b-[inherit]">
                        <div className="relative w-full flex-1 min-h-0 flex flex-col">
                            {children}
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}