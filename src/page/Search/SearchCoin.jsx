import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, AvatarImage } from '@radix-ui/react-avatar'
import { Search } from 'lucide-react'
import { searchCoins } from '@/lib/api'

const SearchCoin = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  // Get query parameter from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const queryParam = searchParams.get('q')
    if (queryParam) {
      setQuery(queryParam)
      handleSearch(queryParam)
    }
  }, [location.search])
  
  // Handle search request
  const handleSearch = async (searchQuery) => {
    if (!searchQuery || searchQuery.trim() === '') {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const data = await searchCoins(searchQuery)
      setResults(data)
    } catch (error) {
      console.error('Error searching coins:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Debounced search when user types
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (query) {
        handleSearch(query)
        const searchParams = new URLSearchParams(location.search)
        searchParams.set('q', query)
        navigate(`/search?${searchParams.toString()}`, { replace: true })
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [query, navigate])

  const handleCoinClick = (coin) => {
    const event = new CustomEvent('coinSelected', {
      detail: { coin }
    })
    window.dispatchEvent(event)
    navigate(`/market/${coin.id}`)
  }

  const formatPrice = (price) => {
    if (!price) return "$0"
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8 max-w-3xl mx-auto">
        <div className="flex items-center px-4 py-3 w-full border rounded-lg bg-white/5">
          <Search className="h-5 w-5 mr-3 text-gray-500" />
          <input
            type="text"
            placeholder="Search Coins..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-base"
            autoFocus
          />
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            {query ? "No results found." : "Enter a coin name to search. You can use partial names."}
          </div>
        ) : (
          <div className="space-y-2">
            <h2 className="text-xl font-medium mb-4">Search Results</h2>
            <div className="space-y-2">
              {results.map((coin) => (
                <div 
                  key={coin.id}
                  onClick={() => handleCoinClick(coin)}
                  className="p-4 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md flex items-center cursor-pointer"
                >
                  <Avatar className="w-10 h-10 mr-4">
                    <AvatarImage src={coin.image} alt={coin.name} />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-lg">{coin.name}</span>
                      <span className="font-medium">{formatPrice(coin.current_price)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-gray-500">{coin.symbol.toUpperCase()}</span>
                      <span className={coin.price_change_percentage_24h > 0 ? "text-red-500" : "text-green-500"}>
                        {formatPercentage(coin.price_change_percentage_24h)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SearchCoin
