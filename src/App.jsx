import { Route, Routes, Navigate } from "react-router-dom";
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
      <div>
        <Navbar/>
        <Routes>
          {/* 确保根路径匹配到Home组件 */}
          <Route exact path="/" element={<Home/>}/>
          <Route path="/home" element={<Navigate to="/" replace />} />
          
          <Route path="/portfolio" element={<Portfolio/>}/>
          <Route path="/activity" element={<Activity/>}/>
          <Route path="/wallet" element={<Wallet/>}/>
          <Route path="/withdrawal" element={<Withdrawal/>}/>
          <Route path="/payment-details" element={<PaymentDetails/>}/>
          <Route path="/market/:id" element={<StockDetails />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<SearchCoin />} />
          <Route path="/auth" element={<Auth/>} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/signin" element={<Auth />} />
          <Route path="/forgot-password" element={<Auth />} />
          
          {/* 这个应该放最后，处理所有未匹配的路径 */}
          <Route path="*" element={<Notfound/>} />
        </Routes>
      </div>
    </>
  )
}

export default App
