import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

/**
 * Склейка Tailwind-классов: clsx собирает условные, twMerge разрешает конфликты
 * (последний выигрывает) — поэтому className из пропсов может переопределить базовый.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
