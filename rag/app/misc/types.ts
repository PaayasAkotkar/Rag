import React from "react";
import { HTMLMotionProps } from "motion/react"

export type pallete<T extends string> = {
    [K in `${T}${number}`]: `#${string}`;
};

export type motionDefaultProps<T extends HTMLElement> = HTMLMotionProps<any> & React.HTMLAttributes<T>;

export type defaultProps<T extends HTMLElement> = React.HTMLAttributes<T>;


export interface makeSmallChange {
    blurEffect?: boolean

    width?: number
    height?: number
    fontSize?: number
    frameSize?: number
    size?: number // this can be use for button size 

    theme?: string
    textColor?: string
    blurCap?: string
    btnTextColor?: string

    triColor?: { right: string, left: string, mid: string }
}
export interface responsiveLayout {
    max: number
    min: number
    baseZoom: number
    baseDimension: number
    unit: string
}