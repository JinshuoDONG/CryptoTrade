import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { DotIcon } from "lucide-react"
import { useState, useEffect } from "react"

const TreadingForm = ({ coinData }) => {
  const [orderType, setOrderType] = useState("BUY")
  const [amount, setAmount] = useState("")
  const [quantity, setQuantity] = useState(0)
  const [insufficientFunds, setInsufficientFunds] = useState(false)
  
  // 模拟钱包余额
  const walletBalance = 10000
  const availableCoin = coinData?.symbol ? 5 : 0
  
  // 根据输入金额计算可以购买的币数量
  useEffect(() => {
    if (amount && coinData?.market_data?.current_price?.usd) {
      const calculatedQuantity = parseFloat(amount) / coinData.market_data.current_price.usd
      setQuantity(calculatedQuantity)
      
      // 检查余额是否足够
      if (parseFloat(amount) > walletBalance && orderType === "BUY") {
        setInsufficientFunds(true)
      } else if (calculatedQuantity > availableCoin && orderType === "SELL") {
        setInsufficientFunds(true)
      } else {
        setInsufficientFunds(false)
      }
    } else {
      setQuantity(0)
      setInsufficientFunds(false)
    }
  }, [amount, coinData, orderType])

  // 输入金额改变时
  const handleAmountChange = (e) => {
    const value = e.target.value
    if (value === "" || (!isNaN(value) && parseFloat(value) >= 0)) {
      setAmount(value)
    }
  }
  
  // 切换买卖类型时重置状态
  const toggleOrderType = () => {
    setOrderType(orderType === "BUY" ? "SELL" : "BUY")
    setAmount("")
    setQuantity(0)
    setInsufficientFunds(false)
  }

  // 格式化价格
  const formatPrice = (price) => {
    if (!price) return "$0"
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
  
  // 格式化价格变化
  const formatPriceChange = (change) => {
    if (!change) return "0.00%"
    return `${change.toFixed(2)}%`
  }

  // 安全的获取数据，防止undefined错误
  const safelyGetData = () => {
    if (!coinData) {
      return {
        symbol: "COIN",
        name: "Cryptocurrency",
        image: { large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
        currentPrice: 0,
        priceChange: 0,
        priceChangePercentage: 0,
        isPriceDown: false
      }
    }

    const currentPrice = coinData.market_data?.current_price?.usd || 0
    const priceChangePercentage = coinData.market_data?.price_change_percentage_24h || 0
    const isPriceDown = priceChangePercentage < 0
    const priceChange = coinData.market_data?.price_change_24h || 0

    return {
      symbol: coinData.symbol || "COIN",
      name: coinData.name || "Cryptocurrency",
      image: coinData.image || { large: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png" },
      currentPrice,
      priceChange,
      priceChangePercentage,
      isPriceDown
    }
  }

  const {
    symbol,
    name,
    image,
    currentPrice,
    priceChange,
    priceChangePercentage,
    isPriceDown
  } = safelyGetData()

  return (
    <div className="space-y-8 p-5">
      <div>
        <div className="flex gap-4 items-center justify-between">
          <Input
            className="py-7 focus:outline-none"
            placeholder="Enter Amount ($)"
            onChange={handleAmountChange}
            type="number"
            name="amount"
            value={amount}
            min="0"
          />
          <div>
            <p className="border text-md flex justify-center items-center w-36 h-14 rounded-md">
              {quantity.toFixed(8)} {symbol.toUpperCase()}
            </p>
          </div>
        </div>

        {insufficientFunds && (
          <h1 className="text-red-600 text-center pt-4">
            {orderType === "BUY" 
              ? "Insufficient wallet balance to buy" 
              : `Insufficient ${symbol.toUpperCase()} to sell`}
          </h1>
        )}
      </div>
      
      <div className="flex gap-5 items-center">
        <div className="w-[60px]">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={image.large}
              alt={name}
            />
          </Avatar>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold">{symbol.toUpperCase()}</p>
            <DotIcon className="text-gray-600"/>
            <p className="text-gray-600">{name}</p>
          </div>
          <div className="flex items-end gap-2">
            <p className="text-xl font-bold">{formatPrice(currentPrice)}</p>       
            <p className={isPriceDown ? "text-red-600" : "text-green-600"}>
              <span>{priceChange.toFixed(2)}</span>
              <span> ({formatPriceChange(priceChangePercentage)})</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p>Order Type</p>
        <p>Market Order</p>
      </div>

      <div className="flex items-center justify-between">
        <p>{orderType === "BUY" ? "Available Cash" : `Available ${symbol.toUpperCase()}`}</p>
        <p>{orderType === "BUY" 
          ? formatPrice(walletBalance) 
          : `${availableCoin} ${symbol.toUpperCase()}`}</p>
      </div>
      
      <div className="space-y-3">
        <Button 
          className="w-full py-6"
          disabled={insufficientFunds || !amount || amount === "0"}
        >
          {orderType} {symbol.toUpperCase()}
        </Button>
        <Button 
          className="w-full py-6" 
          variant="outline"
          onClick={toggleOrderType}
        >
          {orderType === "BUY" ? "Or Sell" : "Or Buy"} {symbol.toUpperCase()}
        </Button>
      </div>
    </div>
  )
}

export default TreadingForm
