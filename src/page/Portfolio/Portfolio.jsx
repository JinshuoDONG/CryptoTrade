import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import CoinImage from "@/components/ui/coin-image"
import { useEffect, useState } from 'react'
import { auth } from '@/FirebaseConfig'
import { getPortfolio } from '../Wallet/walletService'
import { getCoinMarkets, coinImageUrl } from '@/lib/api'

const COIN_NAMES = {
  btc: 'Bitcoin', eth: 'Ethereum', bnb: 'BNB', sol: 'Solana',
  xrp: 'XRP', ada: 'Cardano', doge: 'Dogecoin', avax: 'Avalanche',
  dot: 'Polkadot', matic: 'Polygon', link: 'Chainlink', ltc: 'Litecoin',
  pepe: 'Pepe', sui: 'Sui', near: 'NEAR Protocol', inj: 'Injective',
};

const Portfolio = () => {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u)
      if (!u) setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchData = async () => {
      try {
        const portfolio = await getPortfolio(user.uid)
        const symbols = Object.keys(portfolio)
        if (symbols.length === 0) { setHoldings([]); setLoading(false); return }

        const markets = await getCoinMarkets('usd', 500)
        const priceMap = {}
        markets.forEach(c => { priceMap[c.id] = c.current_price })

        const items = symbols.map(sym => {
          const h = portfolio[sym]
          const price = priceMap[sym] || 0
          const value = h.amount * price
          const pnl = price > 0 ? ((price - h.avgPrice) / h.avgPrice * 100) : 0
          return {
            symbol: sym,
            name: COIN_NAMES[sym] || sym.toUpperCase(),
            amount: h.amount,
            avgPrice: h.avgPrice,
            currentPrice: price,
            value,
            pnl,
            image: coinImageUrl(sym),
          }
        })
        setHoldings(items)
      } catch (e) {
        console.error('Portfolio load error:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user])

  if (!user) return <div className="p-20 text-center text-gray-500">Please log in to view your portfolio</div>
  if (loading) return <div className="p-20 text-center">Loading portfolio...</div>

  return (
    <div className="p-5 lg:p-20">
      <h1 className="font-bold text-3xl pb-5">Portfolio</h1>
      {holdings.length === 0 ? (
        <div className="text-center p-10 border rounded-md bg-gray-50">
          <p className="text-lg mb-2">No holdings yet</p>
          <p className="text-gray-500">Go to a coin's detail page and start trading!</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Asset</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Avg Price</TableHead>
              <TableHead>Current Price</TableHead>
              <TableHead>P&L</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((item, i) => (
              <TableRow key={item.symbol}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <CoinImage symbol={item.symbol} src={item.image} />
                  </Avatar>
                  <span>{item.name}</span>
                </TableCell>
                <TableCell>{item.amount.toFixed(6)}</TableCell>
                <TableCell>${item.avgPrice.toFixed(2)}</TableCell>
                <TableCell>${item.currentPrice.toFixed(2)}</TableCell>
                <TableCell className={item.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {item.pnl >= 0 ? '+' : ''}{item.pnl.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right font-medium">${item.value.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default Portfolio
