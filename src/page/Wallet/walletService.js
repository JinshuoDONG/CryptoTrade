import { db, auth } from '../../FirebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

// Get user wallet information
export const getUserWallet = async (userId) => {
  try {
    const walletRef = doc(db, 'wallets', userId);
    // 强制从服务器读取最新数据（绕过 IndexedDB 缓存）
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      return walletSnap.data();
    } else {
      // If wallet does not exist, create a new one
      const newWallet = {
        userId: userId,
        balance: 0,
        walletId: generateWalletId(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      await setDoc(walletRef, newWallet);
      return newWallet;
    }
  } catch (error) {
    console.error('Failed to get wallet data:', error);
    throw new Error('Failed to get wallet data');
  }
};

// Top-up function
export const addMoney = async (userId, amount, paymentMethod) => {
  try {
    if (amount <= 0) {
      throw new Error('Top-up amount must be greater than 0');
    }

    // Simulate payment processing (in a real application, a real payment API should be called)
    const paymentResult = await processPayment(amount, paymentMethod);
    if (!paymentResult.success) {
      throw new Error('Payment failed');
    }

    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    
    if (!walletSnap.exists()) {
      throw new Error('Wallet does not exist');
    }

    const currentBalance = walletSnap.data().balance || 0;
    const newBalance = currentBalance + parseFloat(amount);

    // Update wallet balance
    await updateDoc(walletRef, {
      balance: newBalance,
      updatedAt: serverTimestamp()
    });

    // Record transaction history
    await addTransaction(userId, {
      type: 'TOPUP',
      amount: parseFloat(amount),
      paymentMethod,
      status: 'COMPLETED',
      description: 'Wallet top-up',
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Top-up failed:', error);
    throw error;
  }
};

// Withdrawal function
export const withdrawMoney = async (userId, amount) => {
  try {
    if (amount <= 0) {
      throw new Error('Withdrawal amount must be greater than 0');
    }

    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    
    if (!walletSnap.exists()) {
      throw new Error('Wallet does not exist');
    }

    const currentBalance = walletSnap.data().balance || 0;
    
    if (currentBalance < amount) {
      throw new Error('Insufficient balance');
    }

    const newBalance = currentBalance - parseFloat(amount);

    // Update wallet balance
    await updateDoc(walletRef, {
      balance: newBalance,
      updatedAt: serverTimestamp()
    });

    // Record transaction history
    await addTransaction(userId, {
      type: 'WITHDRAWAL',
      amount: -parseFloat(amount),
      status: 'PENDING',
      description: 'Wallet withdrawal',
      balanceAfter: newBalance
    });

    return { success: true, newBalance };
  } catch (error) {
    console.error('Withdrawal failed:', error);
    throw error;
  }
};

// Transfer to another wallet
export const transferMoney = async (fromUserId, amount, targetWalletId) => {
  try {
    if (amount <= 0) throw new Error('Transfer amount must be greater than 0');
    if (!targetWalletId) throw new Error('Target wallet ID is required');

    // Step 1: Find target wallet FIRST (before touching sender's money)
    const walletsRef = collection(db, 'wallets');
    const q = query(walletsRef, where('walletId', '==', targetWalletId));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) throw new Error('Target wallet not found');
    const targetDoc = querySnapshot.docs[0];
    if (targetDoc.id === fromUserId) throw new Error('Cannot transfer to yourself');

    // Step 2: Check sender's balance
    const fromWalletRef = doc(db, 'wallets', fromUserId);
    const fromWalletSnap = await getDoc(fromWalletRef);
    if (!fromWalletSnap.exists()) throw new Error('Your wallet does not exist');
    const currentBalance = fromWalletSnap.data().balance || 0;
    if (currentBalance < amount) throw new Error('Insufficient balance');

    // Step 3: Deduct from sender
    const newSenderBalance = currentBalance - parseFloat(amount);
    await updateDoc(fromWalletRef, {
      balance: newSenderBalance,
      updatedAt: serverTimestamp()
    });

    // Step 4: Credit target
    const targetBalance = targetDoc.data().balance || 0;
    const newTargetBalance = targetBalance + parseFloat(amount);
    await updateDoc(doc(db, 'wallets', targetDoc.id), {
      balance: newTargetBalance,
      updatedAt: serverTimestamp()
    });

    // Step 5: Record transactions
    await addTransaction(fromUserId, {
      type: 'TRANSFER_OUT',
      amount: -parseFloat(amount),
      status: 'COMPLETED',
      description: `Transfer to ${targetWalletId}`,
      balanceAfter: newSenderBalance
    });
    await addTransaction(targetDoc.id, {
      type: 'TRANSFER_IN',
      amount: parseFloat(amount),
      status: 'COMPLETED',
      description: `Transfer from wallet ${fromWalletSnap.data().walletId}`,
      balanceAfter: newTargetBalance
    });

    return { success: true, newBalance: newSenderBalance };
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
};

// Buy crypto at market price
export const buyCrypto = async (userId, coinSymbol, usdAmount, coinPrice) => {
  try {
    if (usdAmount <= 0) throw new Error('Buy amount must be greater than 0');

    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    if (!walletSnap.exists()) throw new Error('Wallet does not exist');

    const currentBalance = walletSnap.data().balance || 0;
    if (currentBalance < usdAmount) throw new Error('Insufficient balance');

    const coinAmount = usdAmount / coinPrice;
    const newBalance = currentBalance - usdAmount;

    // Update wallet
    await updateDoc(walletRef, { balance: newBalance, updatedAt: serverTimestamp() });

    // Update portfolio
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);
    const holdings = portfolioSnap.exists() ? (portfolioSnap.data().holdings || {}) : {};
    const existing = holdings[coinSymbol] || { amount: 0, avgPrice: 0 };
    const totalAmount = existing.amount + coinAmount;
    const newAvgPrice = ((existing.amount * existing.avgPrice) + usdAmount) / totalAmount;
    holdings[coinSymbol] = { amount: totalAmount, avgPrice: newAvgPrice };
    await setDoc(portfolioRef, { holdings, updatedAt: serverTimestamp() }, { merge: true });

    // Record transaction
    await addTransaction(userId, {
      type: 'BUY',
      coinSymbol,
      coinAmount,
      usdAmount,
      price: coinPrice,
      status: 'COMPLETED',
      description: `Bought ${coinAmount.toFixed(6)} ${coinSymbol.toUpperCase()} at $${coinPrice}`,
      balanceAfter: newBalance
    });

    return { success: true, newBalance, coinAmount };
  } catch (error) {
    console.error('Buy failed:', error);
    throw error;
  }
};

// Sell crypto at market price
export const sellCrypto = async (userId, coinSymbol, coinAmount, coinPrice) => {
  try {
    if (coinAmount <= 0) throw new Error('Sell amount must be greater than 0');

    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);
    if (!portfolioSnap.exists()) throw new Error('No holdings found');

    const holdings = portfolioSnap.data().holdings || {};
    const holding = holdings[coinSymbol];
    if (!holding || holding.amount < coinAmount) throw new Error(`Insufficient ${coinSymbol.toUpperCase()} balance`);

    const usdAmount = coinAmount * coinPrice;
    const newCoinAmount = holding.amount - coinAmount;

    if (newCoinAmount <= 0.00000001) {
      delete holdings[coinSymbol];
    } else {
      holdings[coinSymbol] = { amount: newCoinAmount, avgPrice: holding.avgPrice };
    }

    await setDoc(portfolioRef, { holdings, updatedAt: serverTimestamp() }, { merge: true });

    // Update wallet
    const walletRef = doc(db, 'wallets', userId);
    const walletSnap = await getDoc(walletRef);
    const currentBalance = walletSnap.data().balance || 0;
    const newBalance = currentBalance + usdAmount;
    await updateDoc(walletRef, { balance: newBalance, updatedAt: serverTimestamp() });

    // Record transaction
    await addTransaction(userId, {
      type: 'SELL',
      coinSymbol,
      coinAmount,
      usdAmount,
      price: coinPrice,
      status: 'COMPLETED',
      description: `Sold ${coinAmount.toFixed(6)} ${coinSymbol.toUpperCase()} at $${coinPrice}`,
      balanceAfter: newBalance
    });

    return { success: true, newBalance, usdAmount };
  } catch (error) {
    console.error('Sell failed:', error);
    throw error;
  }
};

// Get user portfolio
export const getPortfolio = async (userId) => {
  try {
    const portfolioRef = doc(db, 'portfolios', userId);
    const portfolioSnap = await getDoc(portfolioRef);
    if (portfolioSnap.exists()) {
      return portfolioSnap.data().holdings || {};
    }
    return {};
  } catch (error) {
    console.error('Failed to get portfolio:', error);
    return {};
  }
};

// Get transaction history
export const getTransactionHistory = async (userId, limit = 20) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('userId', '==', userId));

    const querySnapshot = await getDocs(q);
    const transactions = [];

    querySnapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // 客户端按时间降序排序（避免需要 Firestore 复合索引）
    transactions.sort((a, b) => {
      const ta = a.createdAt?.toDate?.() || a.createdAt || 0;
      const tb = b.createdAt?.toDate?.() || b.createdAt || 0;
      return tb - ta;
    });

    return transactions.slice(0, limit);
  } catch (error) {
    console.error('Failed to get transaction history:', error);
    return [];
  }
};

// Add transaction record
const addTransaction = async (userId, transactionData) => {
  try {
    const transactionsRef = collection(db, 'transactions');
    await addDoc(transactionsRef, {
      userId,
      ...transactionData,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Failed to add transaction record:', error);
  }
};

// Generate wallet ID
const generateWalletId = () => {
  return '#' + Math.random().toString(36).substr(2, 9);
};

// Simulate payment processing
const processPayment = async (amount, paymentMethod) => {
  // This should integrate with a real payment gateway (e.g., Stripe, Razorpay)
  // For now, we simulate a successful payment
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      resolve({ 
        success, 
        transactionId: success ? 'txn_' + Date.now() : null,
        error: success ? null : 'Payment processing failed'
      });
    }, 1000);
  });
};