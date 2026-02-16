'use client'

import { CSSMaths } from "@/app/misc/algorithm"
import { useDevice } from "@/app/services/device/use-device"
import { useZoomLevel } from "@/app/services/zoom/use-zoom"
import { respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet"

interface CopyBackgroundProps {
    children: React.ReactNode
}

export default function MiscBackground({ children }: CopyBackgroundProps) {
    const { zoom } = useZoomLevel()
    const { device } = useDevice()
    const counterScale = 1 / zoom

    const roundedValue = device.isPcLandscape ? 50 : device.isMobilePortrait ? 10 : 12
    const rounded = CSSMaths.GenerateClamp(
        roundedValue,
        respBaseWidth,
        respZoom,
        'px',
        counterScale,
        respMin,
        respMax
    )

    const paddingValue = device.isPcLandscape ? 4 : device.isMobilePortrait ? 16 : 20
    const padding = CSSMaths.GenerateClamp(
        paddingValue,
        respBaseWidth,
        respZoom,
        'px',
        counterScale,
        respMin,
        respMax
    )

    return (
        <div
            className="w-fit bg-yellow1 overflow-hidden"
            style={{
                borderRadius: rounded,
                padding: padding
            }}
        >
            {children}
        </div>
    )
}