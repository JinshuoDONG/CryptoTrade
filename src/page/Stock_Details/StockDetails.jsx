import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Avatar, AvatarImage } from "@radix-ui/react-avatar"
import { BookmarkFilledIcon } from "@radix-ui/react-icons"
import { BookmarkIcon, DotIcon } from "lucide-react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import StockChart from "../Home/StockChart"
import TreadingForm from "./TreadingForm"
import { getCoinDetails } from "@/lib/api"
import { useAuth } from "@/lib/AuthContext"
import LoginAlert from "@/components/LoginAlert"

const StockDetails = () => {
  const { id } = useParams() // 获取URL中的币种ID
  const [coinData, setCoinData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showLoginAlert, setShowLoginAlert] = useState(false)
  const navigate = useNavigate()
  const { isLoggedIn, isBookmarked, addBookmark, removeBookmark } = useAuth()

  // 切换收藏状态
  const toggleBookmark = () => {
    if (!isLoggedIn) {
      // 显示登录提醒，而不是直接跳转
      setShowLoginAlert(true)
      return
    }
    
    console.log('Toggle bookmark for coin:', id, 'currently bookmarked:', isBookmarked(id))
    
    if (isBookmarked(id)) {
      removeBookmark(id)
        .then(success => {
          if (success) {
            console.log('Successfully removed from watchlist:', id)
          } else {
            console.error('Failed to remove from watchlist:', id)
          }
        })
    } else {
      addBookmark(id)
        .then(success => {
          if (success) {
            console.log('Successfully added to watchlist:', id)
          } else {
            console.error('Failed to add to watchlist:', id)
          }
        })
    }
  }

  // 获取币种详细信息
  useEffect(() => {
    const fetchCoinData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await getCoinDetails(id);
        if (!data) {
          throw new Error(`Failed to fetch data for ${id}`);
        }
        setCoinData(data);
      } catch (error) {
        console.error('Error fetching coin details:', error);
        setError(error.message || 'Failed to load coin data');
      } finally {
        setLoading(false);
      }
    }

    fetchCoinData();
  }, [id])

  // 格式化价格变化百分比
  const formatPriceChange = (priceChange) => {
    if (!priceChange) return "0.00%";
    return `${priceChange.toFixed(2)}%`;
  }

  // 格式化价格
  const formatPrice = (price) => {
    if (!price) return "$0";
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  if (loading) {
    return (
      <div className="p-5 mt-5 flex justify-center items-center min-h-[50vh]">
        <p>Loading coin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 mt-5 flex flex-col justify-center items-center min-h-[50vh]">
        <p className="text-red-500 mb-2">Error: {error}</p>
        <p>Please try again later or check the coin ID.</p>
      </div>
    );
  }

  if (!coinData) {
    return (
      <div className="p-5 mt-5 flex flex-col justify-center items-center min-h-[50vh] text-center">
        <p className="text-xl mb-2">No data available for this coin.</p>
        <p className="text-gray-500">The coin "{id}" might not exist or there was an issue fetching its data.</p>
      </div>
    );
  }

  // 安全地获取数据，防止undefined错误
  const safeGetData = () => {
    const priceChangePercentage = coinData.market_data?.price_change_percentage_24h || 0;
    const isPriceUp = priceChangePercentage > 0;
    const priceChange = coinData.market_data?.price_change_24h || 0;
    const currentPrice = coinData.market_data?.current_price?.usd || 0;
    
    return {
      priceChangePercentage,
      isPriceUp,
      priceChange,
      currentPrice
    };
  };
  
  const { priceChangePercentage, isPriceUp, priceChange, currentPrice } = safeGetData();

  return (
    <div className="p-5 mt-5" >
      <div className="flex justify-between flex-wrap md:flex-nowrap">
        <div className="flex gap-5 items-center">
          <div className="w-[60px] md:w-[100px]">
            <Avatar className="h-12 w-12 md:h-20 md:w-20">
              <AvatarImage
                src={coinData.image?.large || "https://placehold.co/200"}
                alt={coinData.name || "Cryptocurrency"}
              />
            </Avatar>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold">{(coinData.symbol || "").toUpperCase()}</p>
              <DotIcon className="text-gray-600"/>
              <p className="text-gray-600">{coinData.name || "Cryptocurrency"}</p>
            </div>
            <div className="flex items-end gap-2">
              <p className="text-xl font-bold">
                {formatPrice(currentPrice)}
              </p>       
              <p className={isPriceUp ? "text-red-600" : "text-green-600"}>
                <span>{priceChange.toFixed(2)}</span>
                <span> ({formatPriceChange(priceChangePercentage)})</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button onClick={toggleBookmark}>
            {isBookmarked(id) ? (
              <BookmarkFilledIcon className="h-6 w-6"/>
            ) : (
              <BookmarkIcon className="h-6 w-6"/>
            )}
          </Button>
          <Dialog>
            <DialogTrigger>
              <Button size="lg">Trade</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How much do you want to spend?</DialogTitle>
              </DialogHeader>
              <TreadingForm coinData={coinData} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="mt-14">
        <StockChart coinId={id} />
      </div>

      {/* 登录提醒对话框 */}
      <LoginAlert 
        isOpen={showLoginAlert}
        onOpenChange={setShowLoginAlert}
        message={`You need to log in to add "${coinData.name}" to your watchlist.`}
      />
    </div>
  )
}

export default StockDetails