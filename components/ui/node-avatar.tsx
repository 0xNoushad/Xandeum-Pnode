"use client"

import { useMemo } from "react"
import Image from "next/image"

interface ValidatorInfo {
  name?: string
  iconUrl?: string
}

interface NodeAvatarProps {
  pubkey: string
  validatorInfo?: ValidatorInfo
  size?: number
  className?: string
}

function hashToColor(str: string, offset: number = 0): string {
  let hash = offset
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash
  }
  const h = Math.abs(hash) % 360
  return `hsl(${h}, 65%, 45%)`
}

export function NodeAvatar({ pubkey, validatorInfo, size = 40, className = "" }: NodeAvatarProps) {
  const { color1, color2, initials } = useMemo(() => {
    // Use validator name initials if available, otherwise pubkey
    const init = validatorInfo?.name 
      ? validatorInfo.name.slice(0, 2).toUpperCase()
      : pubkey.slice(0, 2).toUpperCase()
    
    return {
      color1: hashToColor(pubkey, 0),
      color2: hashToColor(pubkey, 100),
      initials: init,
    }
  }, [pubkey, validatorInfo])

  // If validator has an icon URL, use it
  if (validatorInfo?.iconUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-full ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={validatorInfo.iconUrl}
          alt={validatorInfo.name || pubkey.slice(0, 8)}
          width={size}
          height={size}
          className="object-cover"
          onError={(e) => {
            // Fallback to gradient on error
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  // Default: gradient avatar with initials
  return (
    <div
      className={`flex items-center justify-center rounded-full font-mono font-bold text-white/90 ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: `linear-gradient(135deg, ${color1}, ${color2})`,
      }}
    >
      {initials}
    </div>
  )
}
