"use client"

import {Lottie} from "lottie-react"

/** Декоративная Lottie-анимация из `public/`: размер задаётся через `className`, анимация заполняет элемент. */
export function LottieAnimation({src, className, loop = true}: {src: string; className?: string; loop?: boolean}) {
  return <Lottie src={src} autoplay loop={loop} className={className} aria-hidden />
}
