import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Search, LogOut, User, Wallet, LayoutDashboard, ActivitySquare, Bookmark } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Sidebar from './Sidebar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { searchCoins } from '@/lib/api'
import { useState, useEffect, useRef } from 'react'

const Navbar = () => {
    const navigate = useNavigate()
    const { user, isLoggedIn, logout } = useAuth()
    const [showMenu, setShowMenu] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const menuRef = useRef(null)
    const searchRef = useRef(null)

    // 点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSearch(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // 搜索防抖
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true)
            try {
                const results = await searchCoins(searchQuery)
                setSearchResults(results)
            } catch { setSearchResults([]) }
            finally { setSearchLoading(false) }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const handleCoinClick = (coin) => {
        setShowSearch(false)
        setSearchQuery('')
        navigate(`/market/${coin.id}`)
    }

    const handleAuthClick = () => navigate('/auth')
    const handleLogout = () => { logout(); setShowMenu(false) }
    const handleMenuClick = (path) => { navigate(path); setShowMenu(false) }

    const formatPrice = (price) => {
        if (!price) return "$0"
        if (price < 1) return `$${price.toFixed(6)}`
        return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    return (
        <div className='px-2 py-3 border-b z-50 bg-background bg-opacity-0 sticky top-0 left-0
        right-0 flex justify-between items-center'>

            <div className='flex item-center gap-3'>

            <Sheet>
            <SheetTrigger>
                <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
                <Menu className="w-4 h-4 text-muted-foreground" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-72 border-r-0 flex flex-col" side="left">
                <SheetHeader>
                <SheetTitle>
                    <div className="flex justify-center items-center gap-2 pb-2">
                      <span className="font-bold text-purple-700 text-xl">Crypto</span>
                      <span className="text-xl">Trackr</span>
                    </div>
                </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto">
                  <Sidebar/>
                </div>
            </SheetContent>
            </Sheet>

            <p className='text-sm lg:text-base cursor-pointer' onClick={() => navigate('/')}>
                Crypto Trackr
            </p>

            {/* Search */}
            <div className="ml-9 relative" ref={searchRef}>
                <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md bg-white w-52 lg:w-64">
                    <Search className="w-4 h-4 text-gray-400 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search coins..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSearch(true)}
                        className="w-full outline-none text-sm bg-transparent"
                    />
                </div>

                {showSearch && searchQuery.trim() && (
                    <div className="absolute top-full mt-1 left-0 w-full min-w-64 bg-white rounded-md shadow-lg border z-50">
                        <div className="max-h-64 overflow-y-auto">
                            {searchLoading ? (
                                <div className="p-3 text-sm text-gray-400">Searching...</div>
                            ) : searchResults.length === 0 ? (
                                <div className="p-3 text-sm text-gray-400">No results found</div>
                            ) : (
                                searchResults.map(coin => (
                                    <div
                                        key={coin.id}
                                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                        onClick={() => handleCoinClick(coin)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCoinClick(coin)}
                                    >
                                        <img src={coin.image} alt="" className="w-6 h-6 rounded-full" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{coin.name}</p>
                                            <p className="text-xs text-gray-400">{coin.symbol.toUpperCase()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{formatPrice(coin.current_price)}</p>
                                            <p className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                {coin.price_change_percentage_24h?.toFixed(2)}%
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
            </div>

        {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
                <Avatar className="cursor-pointer" onClick={() => setShowMenu(!showMenu)}>
                    <AvatarFallback>
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                {showMenu && (
                    <div className="absolute right-0 mt-1 w-52 bg-white rounded-md shadow-lg z-50 border">
                        <div className="py-1">
                            {[
                              { label: 'Portfolio', path: '/portfolio', icon: <LayoutDashboard className="w-4 h-4" /> },
                              { label: 'Watchlist', path: '/watchlist', icon: <Bookmark className="w-4 h-4" /> },
                              { label: 'Activity', path: '/activity', icon: <ActivitySquare className="w-4 h-4" /> },
                              { label: 'Wallet', path: '/wallet', icon: <Wallet className="w-4 h-4" /> },
                              { label: 'Profile', path: '/profile', icon: <User className="w-4 h-4" /> },
                            ].map(item => (
                                <button
                                    key={item.path}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-3"
                                    onClick={() => handleMenuClick(item.path)}
                                >
                                    <span className="text-gray-500">{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}
                            <div className="border-t my-1" />
                            <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center gap-3" onClick={handleLogout}>
                                <LogOut className="w-4 h-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <Button variant="default" size="sm" onClick={handleAuthClick}>
                Login
            </Button>
        )}
    </div>
    )
}

export default Navbar
