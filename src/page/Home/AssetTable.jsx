import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCoinMarkets, getTopGainers, getTopLosers } from "@/lib/api"
import { ArrowDown, ArrowUp } from "lucide-react"
  
const AssetTable = () => {
  const navigate = useNavigate()
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("all")
  const [sortDirection, setSortDirection] = useState('desc') // Default to descending order (highest to lowest)
  const [sortBy, setSortBy] = useState('price_change') // 'price_change' or 'volume'

  // Helper function to sort coins
  const sortCoins = (coinsData, sortField, direction) => {
    return [...coinsData].sort((a, b) => {
      if (sortField === 'price_change') {
        // Sort by price change percentage
        if (direction === 'asc') {
          return (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
        } else {
          return (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
        }
      } else if (sortField === 'volume') {
        // Sort by trading volume
        if (direction === 'asc') {
          return (a.total_volume || 0) - (b.total_volume || 0)
        } else {
          return (b.total_volume || 0) - (a.total_volume || 0)
        }
      }
      return 0
    })
  }

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true)
      try {
        let data = []
        
        switch(category) {
          case "all":
            data = await getCoinMarkets()
            setSortBy('price_change')
            break
          case "top50":
            data = await getCoinMarkets("usd", 50)
            setSortBy('volume')
            break
          case "topGainers":
            data = await getTopGainers()
            setSortBy('price_change')
            break
          case "topLosers":
            data = await getTopLosers()
            setSortBy('price_change')
            break
          default:
            data = await getCoinMarkets()
            setSortBy('price_change')
        }
        
        // Sort data based on category and selected sort field
        const sortedData = sortCoins(data, category === 'top50' ? 'volume' : 'price_change', sortDirection)
        setCoins(sortedData)
      } catch (error) {
        console.error("Error fetching coin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
  }, [category, sortDirection])

  // Handle category change from the parent component
  useEffect(() => {
    const handleCategoryChange = (event) => {
      if (event.detail && event.detail.category) {
        setCategory(event.detail.category)
      }
    }
    
    window.addEventListener("categoryChange", handleCategoryChange)
    
    return () => {
      window.removeEventListener("categoryChange", handleCategoryChange)
    }
  }, [])

  // Toggle sort direction
  const toggleSort = () => {
    setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc')
  }

  const formatNumber = (num) => {
    if (!num) return "0"
    return new Intl.NumberFormat('en-US').format(num)
  }

  const formatPrice = (price) => {
    if (!price) return "$0"
    
    // 对小数价格进行特殊处理
    if (price < 1) {
      return `$${price.toFixed(6)}`
    }
    
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`
  }
  
  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) return "0.00%"
    return `${percentage.toFixed(2)}%`
  }

  // 处理点击硬币事件
  const handleCoinClick = (coin) => {
    // 发送事件通知Home组件更新右侧图表
    const event = new CustomEvent('coinSelected', {
      detail: { coin }
    });
    window.dispatchEvent(event);
    
    // 同时导航到详情页
    navigate(`/market/${coin.id}`);
  };

  // Get sort arrow for column headers
  const getSortArrow = () => {
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px] md:w-[200px]">Coin</TableHead>
            <TableHead>SYMBOL</TableHead>
            <TableHead 
              onClick={category === 'top50' ? toggleSort : undefined}
              className={category === 'top50' ? 'cursor-pointer' : ''}
            >
              <div className="flex items-center">
                VOLUME
                {category === 'top50' && getSortArrow()}
              </div>
            </TableHead>
            <TableHead>MARKET CAP</TableHead>
            <TableHead 
              onClick={category !== 'top50' ? toggleSort : undefined}
              className={category !== 'top50' ? 'cursor-pointer' : ''}
            >
              <div className="flex items-center">
                24h
                {category !== 'top50' && getSortArrow()}
              </div>
            </TableHead>
            <TableHead className="text-right">PRICE</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
            </TableRow>
          ) : coins.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">No data available</TableCell>
            </TableRow>
          ) : (
            coins.map((coin) => (
              <TableRow key={coin.id} className="hover:bg-gray-50 cursor-pointer">
                <TableCell 
                  onClick={() => handleCoinClick(coin)}
                  className="font-medium flex items-center gap-2">
                  <Avatar className='-z-50 w-8 h-8'>
                    <AvatarImage src={coin.image} alt={coin.name} />
                  </Avatar>
                  <span>{coin.name}</span>
                </TableCell>
                <TableCell className="font-medium">{coin.symbol?.toUpperCase()}</TableCell>
                <TableCell>{formatNumber(coin.total_volume)}</TableCell>
                <TableCell>{formatNumber(coin.market_cap)}</TableCell>
                <TableCell 
                  className={`font-medium ${coin.price_change_percentage_24h > 0 
                    ? "text-red-500" 
                    : "text-green-500"}`}
                >
                  {formatPercentage(coin.price_change_percentage_24h)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(coin.current_price)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default AssetTable