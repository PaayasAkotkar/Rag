'use client'
import { motion } from "motion/react"
import { $ } from "animejs"
import { motionDefaultProps } from "@/app/misc/types"

interface input {
    src?: string,
    title?: string,
    alt?: string
    node?: motionDefaultProps<HTMLButtonElement>
    theme?: string
    size?: number
}
export default function NormalPostComposorButton({ src, title, alt, node, theme, size }: input) {

    const _size = size ?? 20

    return (
        <>
            <motion.button
                style={{
                    width: `${_size * 0.25}rem`, height: `${_size * 0.25}rem`,
                    backgroundColor: theme && theme.length > 0 ? theme : "black"
                }}
                {...node} className='rounded-full flex items-center justify-center overflow-hidden px-5'>
                {
                    src && alt &&
                    <img className="w-12 h-12 object-contain" src={src} alt={alt} />
                }
                {
                    title && <span className="text-default text-white leading-none">{title}</span>
                }
            </motion.button>
        </>
    )
}