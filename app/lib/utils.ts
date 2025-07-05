import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to format addresses as 0xaaaa..bbbb
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address
  const prefix = address.slice(0, 6)
  const suffix = address.slice(-4)
  return `${prefix}..${suffix}`
}