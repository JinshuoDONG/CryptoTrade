import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { useState } from 'react'
import { coinFallbackSvg } from '@/lib/api'

/**
 * CoinImage — displays a coin icon from the CoinCap CDN.
 * Falls back to a coloured letter avatar when the CDN image fails to load.
 *
 * Props:
 *  - symbol  (string)  coin symbol, e.g. "btc"
 *  - src     (string)  optional override for the image URL
 *  - className (string) passed to the Avatar wrapper (default: "w-8 h-8")
 *  - alt     (string)  img alt text
 */
export default function CoinImage({ symbol, src, className = 'w-8 h-8', alt = '' }) {
  const [error, setError] = useState(false)
  const cdnSrc = src || (symbol ? `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png` : '')
  const fallback = symbol ? coinFallbackSvg(symbol) : ''

  return (
    <Avatar className={className}>
      <AvatarImage
        src={error ? fallback : cdnSrc}
        alt={alt || symbol || 'coin'}
        onError={() => setError(true)}
      />
    </Avatar>
  )
}
