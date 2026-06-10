import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ReloadIcon } from "@radix-ui/react-icons"
import { CopyIcon, DollarSign, DownloadIcon, ShuffleIcon, UploadIcon, WalletIcon } from "lucide-react"
import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../FirebaseConfig'
import { getUserWallet } from './walletService'
import TopupForm from "./TopupForm"
import TransferForm from "./TransferForm"
import WithdrawalForm from "./WithdrawalForm"

const Wallet = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Listen for user authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await loadWalletData(currentUser.uid);
      } else {
        setWalletData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load wallet data
  const loadWalletData = async (userId) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      const wallet = await getUserWallet(userId);
      setWalletData(wallet);
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setErrorMessage('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    if (user) {
      await loadWalletData(user.uid); 
    }
  };

  // Copy wallet ID
  const copyWalletId = () => {
    if (walletData?.walletId) {
      navigator.clipboard.writeText(walletData.walletId);
      setSuccessMessage('Wallet ID copied to clipboard');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  // Format amount
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  // Clear messages
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (!user) return <div className="flex justify-center items-center h-64">Please log in first</div>;

  return (
    <div className="flex flex-col items-center">
      {/* Success and error messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <div className="pt-10 w-full lg:w-[60%]">
        <Card>
          <CardHeader className="pb-9">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <WalletIcon size={30}></WalletIcon>
                <div>
                  <CardTitle className="text-2xl">My Wallet</CardTitle>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-500 text-sm">
                      {walletData?.walletId || '#loading...'}
                    </p>
                    <CopyIcon 
                      size={12} 
                      className="cursor-pointer hover:text-slate-300"
                      onClick={copyWalletId}
                    />
                  </div>              
                </div>
              </div>
              <div>
                <ReloadIcon 
                  className="w-6 h-6 cursor-pointer hover:text-gray-400"
                  onClick={refreshData}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign/>
              <span className="text-2xl font-semibold">
                {isLoading ? '...' : (walletData?.balance?.toFixed(2) || '0.00')}
              </span>
            </div>
            <div className="flex gap-7 mt-5">
              <Dialog>
                <DialogTrigger>
                  <div className="h-24 w-24 hover:text-gray-400 cursor-pointer 
                    flex flex-col items-center justify-center rounded-md shadow-slate-800 shadow-md">
                    <UploadIcon />
                    <span className="text-sm mt-2">Add Money</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Top Up</DialogTitle>
                  </DialogHeader>
                  <TopupForm 
                    onSuccess={refreshData}
                    onError={setErrorMessage}
                    currentBalance={walletData?.balance || 0}
                  />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <div className="h-24 w-24 hover:text-gray-400 cursor-pointer
                    flex flex-col items-center justify-center rounded-md shadow-slate-800 shadow-md">
                    <DownloadIcon />
                    <span className="text-sm mt-2">Withdrawal</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw</DialogTitle>
                  </DialogHeader>
                  <WithdrawalForm 
                    onSuccess={refreshData}
                    onError={setErrorMessage}
                    currentBalance={walletData?.balance || 0}
                  />
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>
                  <div className="h-24 w-24 hover:text-gray-400 cursor-pointer
                    flex flex-col items-center justify-center rounded-md shadow-slate-800 shadow-md">
                    <ShuffleIcon />
                    <span className="text-sm mt-2">Transfer</span>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-center text-xl">
                      Transfer to another Wallet
                    </DialogTitle>
                  </DialogHeader>
                  <TransferForm
                    onSuccess={refreshData}
                    onError={setErrorMessage}
                    currentBalance={walletData?.balance || 0}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Wallet