import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Cross1Icon } from "@radix-ui/react-icons"
import { Dot, MessageCircle, Search } from "lucide-react"
import React, { useEffect, useState } from 'react'
import AssetTable from './AssetTable'
import StockChart from './StockChart'
import { getCoinDetails } from "@/lib/api"
import { useNavigate } from "react-router-dom"

// Simple SearchBar component
const SearchBar = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/search');
  };
  
  return (
    <div className="w-full">
      <div 
        className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-100"
        onClick={handleClick}
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="text-gray-500">Search coins...</span>
      </div>
    </div>
  );
};

const Home = () => {
    const [category, setCategory] = React.useState("all");
    const [inputValue, setInputValue] = React.useState("");
    const [isBotRelease, setIsBotRelease] = React.useState(false);
    const [selectedCoin, setSelectedCoin] = useState({
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
      current_price: 69242,
      price_change_percentage_24h: 0.71,
      price_change_24h: -1319049822.578
    });

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

    const handleBotRelease = () => setIsBotRelease(!isBotRelease);

    const handleCategory = (value) => {
        setCategory(value)
        // Dispatch an event to notify the AssetTable component
        const event = new CustomEvent('categoryChange', { 
          detail: { category: value } 
        });
        window.dispatchEvent(event);
    };

    const handleChange = (e) => {
      setInputValue(e.target.value);
    }
    
    const handleKeyPress = (event) => {
      if(event.key === "Enter"){
        console.log(inputValue)
      }
      setInputValue("")
    }

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
              <div className="w-full max-w-md">
                <SearchBar />
              </div>
              
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
          <div className="hidden lg:block lg:w-[50%] p-5">
            <StockChart coinId={selectedCoin.id}/>
            <div className="flex gap-5 items-center mt-4">
              <div>
                <Avatar className="w-12 h-12">
                  <AvatarImage
                    src={selectedCoin.image}
                    alt={selectedCoin.name}
                  />
                </Avatar>
              </div>
              <div>            
                <div className='flex items-center gap-2'>
                  <p className="font-bold text-lg">{selectedCoin.symbol.toUpperCase()}</p>
                  <Dot className="text-gray-400"/>
                  <p className='text-gray-400'>{selectedCoin.name}</p>
                </div>
                <div className='flex items-end gap-2'>
                  <p className="text-xl font-bold">
                    {formatPrice(selectedCoin.current_price)}
                  </p>
                  <p className={selectedCoin.price_change_percentage_24h < 0 ? 'text-red-600' : 'text-green-600'}>
                    <span>{selectedCoin.price_change_24h ? selectedCoin.price_change_24h.toFixed(2) : "0.00"}</span>
                    <span> ({selectedCoin.price_change_percentage_24h ? selectedCoin.price_change_percentage_24h.toFixed(2) : "0.00"}%)</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className="absolute bottom-5 right-5 z-40 flex-col
        justify-end items-end gap-2">


{isBotRelease && <div className="rounded-md w-[20rem] md:w-[25rem] lg:w-[25rem] h-[70vh] bg-slate-900 flex flex-col">
  <div className="flex justify-between items-center border-b px-6 h-[12%]">
    <p className="text-white font-semibold">Chat Bot</p>
    <Button 
    onClick={handleBotRelease}
    variant="ghost" size="icon">
      <Cross1Icon className="text-white" />
    </Button>
  </div>

  
  <div className="flex-1 flex flex-col overflow-y-auto gap-5 px-5 py-2 scroll-container">
    <div className="self-start pb-5 w-auto">
      <div className="justify-end self-end px-5 py-2 rounded-md bg-slate-800 w-auto text-white">
        <p>Hi~ o(*￣▽￣*)ブ</p>
        <p>you can ask crypto related any question</p>
        <p>like, price, market cap extra...</p>
      </div>
    </div>

    {[1, 1, 1].map((item, i) => (
  <div key={i} className={`${i % 2 === 0 ? "self-start" : "self-end"} pb-5 w-auto`}>
    {i % 2 === 0 ? (
      <div className="justify-end self-end px-5 py-2 rounded-md bg-slate-800 w-auto text-white">
        <p>blablabla</p>
      </div>
    ) : (
      <div className="justify-end self-end px-5 py-2 rounded-md bg-slate-800 w-auto text-white">
        <p>blablabla</p>
      </div>
    )}
  </div>
))}    <div className='h-[12%] border-t'></div>
    <input className='w-full h-full order-none outline-none'
    placeholder='write prompt'
    onChange={handleChange}
    value={inputValue}
    onKeyPress={handleKeyPress}
    />
    </div>
</div>}

          <div className='relative w-[10rem] cursor-pointer group'>
          <Button 
          onClick={handleBotRelease}
          className="w-full h-[3rem] gap-2 items-center">
            <MessageCircle
            size={30}
              className="fill-[#1e293b] -rotate-90 stroke-none group-hover:fill-[#1a1a1a]"
            />
            <span className="text-2xl">Chat Bot</span>
          </Button>

          </div>
        </section>
      </div>
    )
}

export default Home