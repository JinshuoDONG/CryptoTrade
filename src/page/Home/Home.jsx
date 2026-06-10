import { Button } from "@/components/ui/button"
import CoinImage from "@/components/ui/coin-image"
import { Dot } from "lucide-react"
import React, { useEffect, useState } from 'react'
import AssetTable from './AssetTable'
import StockChart from './StockChart'
import { useNavigate } from "react-router-dom"

const Home = () => {
    const [category, setCategory] = React.useState("top50");
    const navigate = useNavigate();
    const [selectedCoin, setSelectedCoin] = useState(null);

    useEffect(() => {
      // 监听用户点击的币种
      const handleCoinSelected = (event) => {
        if (event.detail && event.detail.coin) {
          setSelectedCoin(event.detail.coin);
        }
      };
      
      window.addEventListener("coinSelected", handleCoinSelected);
      
      return () => {
        window.removeEventListener("coinSelected", handleCoinSelected);
      };
    }, []);

    const handleCategory = (value) => {
        setCategory(value)
        // Dispatch an event to notify the AssetTable component
        const event = new CustomEvent('categoryChange', { 
          detail: { category: value } 
        });
        window.dispatchEvent(event);
    };

    // 价格格式化
    const formatPrice = (price) => {
      if (!price) return "$0";
      
      return price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    return (
      <div className="relative">
        <div className="lg:flex">
          <div className="lg:w-[50%] lg:border-r">
            
            <div className="p-3 flex flex-col gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <Button onClick={() => handleCategory("all")}
                variant={category === "all" ? "default" : "outline"} 
                className="rounded-full">
                  All
                </Button>
                <Button onClick={() => handleCategory("top50")}
                variant={category === "top50" ? "default" : "outline"} 
                className="rounded-full">
                  Top 50
                </Button>
                <Button onClick={() => handleCategory("topGainers")}
                variant={category === "topGainers" ? "default" : "outline"} 
                className="rounded-full">
                  Top Gainers
                </Button>
                <Button onClick={() => handleCategory("topLosers")}
                variant={category === "topLosers" ? "default" : "outline"} 
                className="rounded-full">
                  Top Losers
                </Button>
              </div>
            </div>
            <AssetTable/>
          </div>          
          <div className="hidden lg:block lg:w-[50%] p-5 sticky top-0 h-screen overflow-y-auto">
            {selectedCoin ? (
              <>
                <StockChart coinId={selectedCoin.id}/>
                <div className="flex gap-5 items-center mt-4">
                  <div>
                    <CoinImage symbol={selectedCoin.symbol} src={selectedCoin.image} className="w-12 h-12 rounded-full" alt={selectedCoin.name} />
                  </div>
                  <div className="flex-1">
                    <div className='flex items-center gap-2'>
                      <p className="font-bold text-lg">{selectedCoin.symbol.toUpperCase()}</p>
                      <Dot className="text-gray-400"/>
                      <p className='text-gray-400'>{selectedCoin.name}</p>
                    </div>
                    <div className='flex items-end gap-2'>
                      <p className="text-xl font-bold">
                        {formatPrice(selectedCoin.current_price)}
                      </p>
                      <p className={selectedCoin.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}>
                        <span>{selectedCoin.price_change_24h ? selectedCoin.price_change_24h.toFixed(2) : "0.00"}</span>
                        <span> ({selectedCoin.price_change_percentage_24h ? selectedCoin.price_change_percentage_24h.toFixed(2) : "0.00"}%)</span>
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => navigate(`/market/${selectedCoin.id}`)}>
                    Trade
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-[450px] text-gray-400">
                <p className="text-lg">Click a coin in the table to view its chart</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
}

export default Home