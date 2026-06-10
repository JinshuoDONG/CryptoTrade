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

const Withdrawal = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => { setUser(u); if (!u) setLoading(false); });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const all = await getTransactionHistory(user.uid, 50);
        setTxs(all.filter(t => t.type === 'WITHDRAWAL'));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  const fmt = (ts) => ts?.toDate ? ts.toDate().toLocaleString() : '';

  if (!user) return <div className="p-20 text-center text-gray-500">Please log in</div>;
  if (loading) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="p-5 lg:p-20">
      <h1 className="font-bold text-3xl pb-5">Withdrawal History</h1>
      {txs.length === 0 ? (
        <div className="text-center p-10 border rounded-md bg-gray-50">
          <p className="text-lg">No withdrawal history</p>
          <p className="text-gray-500">Go to Wallet to withdraw funds.</p>
        </div>
      ) : (
        <Table className="border">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {txs.map(tx => (
              <TableRow key={tx.id}>
                <TableCell>{fmt(tx.createdAt)}</TableCell>
                <TableCell>${Math.abs(tx.amount || 0).toFixed(2)}</TableCell>
                <TableCell className="text-gray-500">{tx.description || ''}</TableCell>
                <TableCell className="text-right">
                  <span className="text-yellow-600 text-sm font-medium">{tx.status}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export default Withdrawal
