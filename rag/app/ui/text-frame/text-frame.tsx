import { CSSMaths } from "@/app/misc/algorithm";
import { respBaseWidth, respMax, respMin, respZoom } from "@/app/misc/sheet";
import { useZoomLevel } from "@/app/services/zoom/use-zoom";
import { motion } from "motion/react";

export default function TextFrame({ children, size }: { children: React.ReactNode, size?: number }) {
    const { zoom } = useZoomLevel()
    const counterScale = 1 / zoom
    const _size = CSSMaths.GenerateClamp(size ?? 300, respBaseWidth, respZoom, 'px', counterScale, respMin, respMax)
    return (<>
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
            }}
            exit={{
                opacity: 0,
                y: 20,
                scale: 0.95,
                transition: {
                    duration: 0.6,
                    ease: [0.25, 0.1, 0.25, 1],
                },
            }}
            style={{ width: _size ?? '50%' }}
            className=' h-fit flex flex-col overflow-hidden items-end rounded-[25px] bg-yellow1'
        >
            {children}
        </motion.div>
    </>)
}