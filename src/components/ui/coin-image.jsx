import { useState } from 'react'
import { coinFallbackSvg } from '@/lib/api'

/**
 * CoinImage — displays a coin icon from the CoinCap CDN.
 * Falls back to a coloured letter avatar when the CDN image fails to load.
 *
 * Props:
 *  - symbol  (string)  coin symbol, e.g. "btc"
 *  - src     (string)  optional override for the image URL
 *  - className (string) CSS classes (default: "w-8 h-8 rounded-full")
 *  - alt     (string)  img alt text
 */
export default function CoinImage({ symbol, src, className = 'w-8 h-8 rounded-full', alt = '' }) {
  const [error, setError] = useState(false)
  const cdnSrc = src || (symbol ? `https://assets.coincap.io/assets/icons/${symbol.toLowerCase()}@2x.png` : '')
  const fallback = symbol ? coinFallbackSvg(symbol) : ''

  const imgSrc = (error || !cdnSrc) ? fallback : cdnSrc

  return (
    <img
      src={imgSrc}
      alt={alt || symbol || 'coin'}
      className={className}
      onError={() => setError(true)}
    />
  )
}
