import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DialogClose } from '@radix-ui/react-dialog'
import React from 'react'
import { auth } from '../../FirebaseConfig'
import { buyCrypto, sellCrypto } from '../Wallet/walletService'

const TradeForm = ({ coinData, onSuccess, onError }) => {
  const [mode, setMode] = React.useState('buy')
  const [usdAmount, setUsdAmount] = React.useState('')
  const [coinAmount, setCoinAmount] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  const price = coinData?.market_data?.current_price?.usd || coinData?.current_price || 0
  const symbol = (coinData?.symbol || '').toUpperCase()

  const handleUsdChange = (e) => {
    const val = e.target.value
    if (/^\d*\.?\d*$/.test(val)) {
      setUsdAmount(val)
      if (price > 0) setCoinAmount(val ? (parseFloat(val) / price).toFixed(6) : '')
    }
  }

  const handleCoinChange = (e) => {
    const val = e.target.value
    if (/^\d*\.?\d*$/.test(val)) {
      setCoinAmount(val)
      if (price > 0) setUsdAmount(val ? (parseFloat(val) * price).toFixed(2) : '')
    }
  }

  const handleSubmit = async () => {
    const user = auth.currentUser
    if (!user) { onError('Please log in first'); return }

    const amount = parseFloat(usdAmount)
    const coins = parseFloat(coinAmount)
    if (!amount || amount <= 0) { onError('Please enter a valid amount'); return }

    try {
      setIsLoading(true)
      onError('')

      if (mode === 'buy') {
        const result = await buyCrypto(user.uid, symbol.toLowerCase(), amount, price)
        if (result.success) {
          setUsdAmount(''); setCoinAmount('')
          if (onSuccess) await onSuccess()
        }
      } else {
        const result = await sellCrypto(user.uid, symbol.toLowerCase(), coins, price)
        if (result.success) {
          setUsdAmount(''); setCoinAmount('')
          if (onSuccess) await onSuccess()
        }
      }
    } catch (error) {
      onError(error.message || 'Trade failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-5 pt-5">
      <div className="flex gap-2">
        <Button variant={mode === 'buy' ? 'default' : 'outline'} onClick={() => setMode('buy')} className="flex-1">Buy</Button>
        <Button variant={mode === 'sell' ? 'destructive' : 'outline'} onClick={() => setMode('sell')} className="flex-1">Sell</Button>
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <p className="text-sm text-gray-600">Market Price: <span className="font-semibold">${price.toLocaleString()}</span> per {symbol}</p>
      </div>

      <div>
        <p className="pb-1 text-sm">{mode === 'buy' ? 'Spend (USD)' : 'Receive (USD)'}</p>
        <Input value={usdAmount} onChange={handleUsdChange} placeholder="100" disabled={isLoading} className="py-5" />
      </div>

      <div className="text-center text-gray-400">⇅</div>

      <div>
        <p className="pb-1 text-sm">{mode === 'buy' ? 'Receive (Crypto)' : 'Sell (Crypto)'}</p>
        <Input value={coinAmount} onChange={handleCoinChange} placeholder="0.001" disabled={isLoading} className="py-5" />
      </div>

      <DialogClose asChild>
        <Button
          onClick={handleSubmit}
          className="w-full py-6"
          variant={mode === 'sell' ? 'destructive' : 'default'}
          disabled={isLoading || !usdAmount || parseFloat(usdAmount) <= 0}
        >
          {isLoading ? 'Processing...' : mode === 'buy' ? `Buy ${symbol}` : `Sell ${symbol}`}
        </Button>
      </DialogClose>
    </div>
  )
}

export default TradeForm
