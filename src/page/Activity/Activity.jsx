import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useEffect, useState } from 'react';
import { auth } from '@/FirebaseConfig';
import { getTransactionHistory } from '../Wallet/walletService';

const TYPE_LABELS = {
  BUY: 'Buy', SELL: 'Sell', TOPUP: 'Top Up',
  WITHDRAWAL: 'Withdrawal', TRANSFER_IN: 'Transfer In', TRANSFER_OUT: 'Transfer Out'
};

const Activity = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(u => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchTx = async () => {
      try {
        const txs = await getTransactionHistory(user.uid, 50);
        setTransactions(txs);
      } catch (e) {
        console.error('Activity load error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [user]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return d.toLocaleString();
  };

  if (!user) return <div className="p-20 text-center text-gray-500">Please log in to view your activity</div>;
  if (loading) return <div className="p-20 text-center">Loading activity...</div>;

  return (
    <div className="p-5 lg:p-20">
      <h1 className="font-bold text-3xl pb-5">Activity</h1>
      {transactions.length === 0 ? (
        <div className="text-center p-10 border rounded-md bg-gray-50">
          <p className="text-lg">No transactions yet</p>
          <p className="text-gray-500">Your trade, deposit, and withdrawal history will appear here.</p>
        </div>
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="">Description</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx.id}>
                <TableCell className="text-sm">{formatTime(tx.createdAt)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    tx.type === 'BUY' || tx.type === 'TOPUP' || tx.type === 'TRANSFER_IN' ? 'bg-green-100 text-green-700' :
                    tx.type === 'SELL' || tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {TYPE_LABELS[tx.type] || tx.type}
                  </span>
                </TableCell>
                <TableCell>{tx.coinSymbol ? tx.coinSymbol.toUpperCase() : 'USD'}</TableCell>
                <TableCell>${(tx.usdAmount || tx.amount || 0).toLocaleString()}</TableCell>
                <TableCell className="text-sm text-gray-500">{tx.description || ''}</TableCell>
                <TableCell className="text-right">
                  <span className="text-green-600 text-sm">{tx.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default Activity
