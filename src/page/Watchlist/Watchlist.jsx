import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Avatar, AvatarImage } from '@radix-ui/react-avatar';
import { BookmarkFilledIcon } from "@radix-ui/react-icons";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginAlert from "@/components/LoginAlert";

const Watchlist = () => {
  const { watchlistData, loading, removeBookmark, isLoggedIn, loadWatchlistData } = useAuth();
  const navigate = useNavigate();
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  // 检查用户是否登录
  useEffect(() => {
    // 如果用户未登录，显示登录提醒
    if (!isLoggedIn) {
      setShowLoginAlert(true);
    } else {
      // 如果已登录，加载数据
      loadWatchlistData();
    }
  }, [isLoggedIn, loadWatchlistData]);

  const handleRemoveFromWatchlist = (coinId) => {
    removeBookmark(coinId);
  }

  const formatNumber = (num) => {
    if (!num) return "0";
    return new Intl.NumberFormat('en-US').format(num);
  }

  const formatPrice = (price) => {
    if (!price) return "$0";
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) return "0.00%";
    return `${percentage.toFixed(2)}%`;
  }

  // 如果用户未登录，只显示提示信息
  if (!isLoggedIn) {
    return (
      <div className="p-5 lg:p-20">   
        <h1 className="font-bold text-3xl pb-5">Watchlist</h1>
        <div className="text-center p-10 border rounded-md bg-gray-50">
          <p className="text-lg mb-2">Please log in to view your watchlist</p>
          <Button onClick={() => navigate('/auth')}>Log In</Button>
        </div>
        
        {/* 登录提醒对话框 */}
        <LoginAlert 
          isOpen={showLoginAlert}
          onOpenChange={setShowLoginAlert}
          message="You need to log in to view your watchlist."
        />
      </div>
    );
  }

  return (
    <div className="p-5 lg:p-20">   
      <h1 className="font-bold text-3xl pb-5">Watchlist</h1>
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px] py-5">Coin</TableHead>
            <TableHead>Symbol</TableHead>
            <TableHead>Volume</TableHead>
            <TableHead>Market Cap</TableHead>
            <TableHead>24h</TableHead>
            <TableHead className="">Price</TableHead>
            <TableHead className="text-right text-red-500">Remove</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
            </TableRow>
          ) : watchlistData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No coins in your watchlist. Go to the home page to add some!
              </TableCell>
            </TableRow>
          ) : (
            watchlistData.map((coin) => (
              <TableRow key={coin.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Avatar className='-z-50'>
                    <AvatarImage src={coin.image} alt={coin.name} />
                  </Avatar>
                  <span>{coin.name}</span>
                </TableCell>
                <TableCell>{coin.symbol}</TableCell>
                <TableCell>{formatNumber(coin.total_volume)}</TableCell>
                <TableCell>{formatNumber(coin.market_cap)}</TableCell>
                <TableCell className={coin.price_change_percentage_24h > 0 ? "text-red-500" : "text-green-500"}>
                  {formatPercentage(coin.price_change_percentage_24h)}
                </TableCell>
                <TableCell>{formatPrice(coin.current_price)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleRemoveFromWatchlist(coin.id)} 
                    size="icon" 
                    className="h-10 w-10"
                  >
                    <BookmarkFilledIcon className="w-6 h-6"/>
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default Watchlist