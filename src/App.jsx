import { Route, Routes } from "react-router-dom";
import Activity from "./page/Activity/Activity";
import Auth from "./page/Auth/Auth";
import Home from "./page/Home/Home";
import Navbar from "./page/Navbar/Navbar";
import Notfound from "./page/Notfound/Notfound";
import PaymentDetails from "./page/Payment_Details/PaymentDetails";
import Portfolio from "./page/Portfolio/Portfolio";
import Profile from "./page/Profile/Profile";
import SearchCoin from "./page/Search/SearchCoin";
import StockDetails from "./page/Stock_Details/StockDetails";
import Wallet from "./page/Wallet/Wallet";
import Watchlist from "./page/Watchlist/Watchlist";
import Withdrawal from "./page/Withdrawal/Withdrawal";
function App(){

  return (
    <>
    {/* <Auth/> */}
   {/* {false &&  */}
   <div>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/portfolio" element={<Portfolio/>}/>
        <Route path="/activity" element={<Activity/>}/>
        <Route path="/wallet" element={<Wallet/>}/>
        <Route path="/withdrawal" element={<Withdrawal/>}/>
        <Route path="/payment-details" element={<PaymentDetails/>}/>
        <Route path="/market/:id" element={<StockDetails />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchCoin />} />
        <Route path="/*" element={<Notfound/>} />
        <Route path="/auth" element={<Auth/>} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/signin" element={<Auth />} />

      </Routes>
    </div>
    {/* } */}
  

    </>
  )
}

export default App
