import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Cross1Icon } from "@radix-ui/react-icons"
import { Dot, MessageCircle } from "lucide-react"
import React, { useEffect, useState } from 'react'
import AssetTable from './AssetTable'
import StockChart from './StockChart'
import { getChatbotResponse } from "@/lib/chatService"
import { useNavigate } from "react-router-dom"

const Home = () => {
    const [category, setCategory] = React.useState("top50");
    const [inputValue, setInputValue] = React.useState("");
    const [isBotRelease, setIsBotRelease] = React.useState(false);
    const navigate = useNavigate();
    const [selectedCoin, setSelectedCoin] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

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
                    <Avatar className="w-12 h-12">
                      <AvatarImage
                        src={selectedCoin.image}
                        alt={selectedCoin.name}
                      />
                    </Avatar>
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
        <section className="absolute bottom-5 right-5 z-40 flex-col
        justify-end items-end gap-2">


{isBotRelease && <div className="rounded-md w-[20rem] md:w-[25rem] lg:w-[25rem] h-[70vh] bg-slate-900 flex flex-col">
  <div className="flex justify-between items-center border-b px-6 h-[12%]">
    <p className="text-white font-semibold">Chat Bot</p>
    <Button onClick={handleBotRelease} variant="ghost" size="icon">
      <Cross1Icon className="text-white" />
    </Button>
  </div>

  <div className="flex-1 flex flex-col overflow-y-auto gap-3 px-5 py-2 scroll-container">
    {chatMessages.length === 0 && (
      <div className="self-start pb-5 w-auto">
        <div className="px-5 py-2 rounded-md bg-slate-800 w-auto text-white">
          <p>Hi~ o(*￣▽￣*)ブ</p>
          <p>I'm your crypto assistant. Ask me about prices, top gainers, or market overview!</p>
        </div>
      </div>
    )}
    {chatMessages.map((msg, i) => (
      <div key={i} className={`${msg.sender === 'bot' ? 'self-start' : 'self-end'} pb-1 w-auto max-w-[85%]`}>
        <div className={`px-4 py-2 rounded-md whitespace-pre-wrap text-sm ${msg.sender === 'bot' ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'}`}>
          {msg.text}
        </div>
      </div>
    ))}
    {chatLoading && (
      <div className="self-start pb-1">
        <div className="px-4 py-2 rounded-md bg-slate-800 text-white text-sm">Thinking...</div>
      </div>
    )}
  </div>

  <div className="border-t p-3 flex gap-2">
    <input
      className="flex-1 bg-slate-800 text-white rounded-md px-3 py-2 text-sm outline-none"
      placeholder="Ask about crypto..."
      onChange={handleChange}
      value={inputValue}
      onKeyDown={async (e) => {
        if (e.key === 'Enter' && inputValue.trim() && !chatLoading) {
          const msg = inputValue.trim();
          setInputValue('');
          setChatMessages(prev => [...prev, { sender: 'user', text: msg }]);
          setChatLoading(true);
          try {
            const reply = await getChatbotResponse(msg);
            setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
          } catch {
            setChatMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
          } finally {
            setChatLoading(false);
          }
        }
      }}
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