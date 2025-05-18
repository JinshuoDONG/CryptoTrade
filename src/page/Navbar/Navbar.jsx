import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
// import DragHandleHorizontalIcon from   
import { Button } from "@/components/ui/button"
import { Menu, Search, LogOut } from 'lucide-react'
// import { Avatar } from '@radix-ui/react-avatar'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Sidebar from './Sidebar'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { useState, useEffect, useRef } from 'react'

const Navbar = () => {
    const navigate = useNavigate()
    const { user, isLoggedIn, logout } = useAuth()
    const [showMenu, setShowMenu] = useState(false)
    const menuRef = useRef(null)

    // 处理点击外部关闭菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const handleSearchClick = () => {
        navigate('/search')
    }

    const handleAuthClick = () => {
        navigate('/auth')
    }

    const handleLogout = () => {
        logout()
        setShowMenu(false)
    }

    const handleWatchlistClick = () => {
        navigate('/watchlist')
        setShowMenu(false)
    }

    return (
        <div className='px-2 py-3 border-b z-50 bg-background bg-opacity-0 sticky top-0 left-0 
        right-0 flex justify-between items-center'>

            <div className='flex item-center gap-3'>
              
            <Sheet>
            <SheetTrigger>
                <Button variant="ghost" size ="icon" className="rounded-full h-11 w-11">
                <Menu className="w-4 h-4 text-muted-foreground" />
                </Button>
            </SheetTrigger>
            <SheetContent  className="w-72 border-r-0 flex flex-col justify-center"
             side="left">
                <SheetHeader>
                <SheetTitle>
                    <div className="text-3xl flex justify-center items-center gap-1">
                    <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png"/>//替换
                    </Avatar>
                    </div>
                    <div>
                        <span className="font-bold text-purple-700">Crypto</span>
                        <span>Trackr</span>
                    </div>

                </SheetTitle>

                </SheetHeader>

                <Sidebar/>

            </SheetContent>
            </Sheet>

            <p className='text-sm lg:text-base cursor-pointer' onClick={() => navigate('/')}>
                Crypto Trackr
            </p>

            <div className="p-0 ml-9"> 
            <Button variant="outline" className="flex items-center gap-3" onClick={handleSearchClick}>
                <Search className="w-4 h-4" />
                <span>Search</span>
            </Button>
            </div>
            </div>
        
        {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
                <Avatar 
                    className="cursor-pointer" 
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                </Avatar>
                
                {showMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50">
                        <div className="py-1">
                            <button 
                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                                onClick={handleWatchlistClick}
                            >
                                My Watchlist
                            </button>
                            <button 
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 flex items-center"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
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