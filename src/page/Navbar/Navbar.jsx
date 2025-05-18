import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet"
// import DragHandleHorizontalIcon from   
import { Button } from "@/components/ui/button"
import { Menu, Search } from 'lucide-react'
// import { Avatar } from '@radix-ui/react-avatar'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Sidebar from './Sidebar'

const Navbar = () => {
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

            <p className='text-sm lg:text-base cursor-pointer'>
                Crypto Trackr
            </p>

            <div className="p-0 ml-9"> 
            <Button variant="outline"  className="flex items-center gap-3">
                <Search className="w-4 h-4" />
                <span>Search</span>
            </Button>
            </div>
            </div>
        <div>
        <Avatar>
            <AvatarFallback>
                X
            </AvatarFallback>
        </Avatar>
        </div>
    </div>
    )
}

export default Navbar