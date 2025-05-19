import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCoinDetails } from './api';
import { auth, logoutUser, getUserWatchlist, addToWatchlist, removeFromWatchlist } from '@/FirebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bookmarkedCoins, setBookmarkedCoins] = useState([]);
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 监听Firebase身份验证状态变化
  useEffect(() => {
    if (initialized) return;
    
    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!isMounted) return;
      
      if (firebaseUser) {
        // 从Firebase用户转换为应用用户
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0]
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // 获取用户的watchlist
        loadUserWatchlist(userData.uid);
      } else {
        setUser(null);
        localStorage.removeItem('user');
        // 清空watchlist
        setBookmarkedCoins([]);
      }
      
      setAuthLoading(false);
      setInitialized(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [initialized]);

  // 从Firebase获取用户watchlist
  const loadUserWatchlist = async (userId) => {
    try {
      const watchlist = await getUserWatchlist(userId);
      setBookmarkedCoins(watchlist);
      // 同时更新localStorage，确保离线可用
      localStorage.setItem('bookmarkedCoins', JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error loading user watchlist:', error);
      
      // 回退到localStorage
      const storedBookmarks = localStorage.getItem('bookmarkedCoins');
      if (storedBookmarks) {
        setBookmarkedCoins(JSON.parse(storedBookmarks));
      }
    } finally {
      setLoading(false);
    }
  };

  // 登录方法 - 使用useCallback防止不必要的重新渲染
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 登录时加载用户watchlist
    if (userData && userData.uid) {
      loadUserWatchlist(userData.uid);
    }
  }, []);

  // 登出方法 - 使用useCallback防止不必要的重新渲染
  const logout = useCallback(async () => {
    try {
      await logoutUser();
      setUser(null);
      setBookmarkedCoins([]);
      localStorage.removeItem('user');
      localStorage.removeItem('bookmarkedCoins');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // 添加收藏 - 使用useCallback防止不必要的重新渲染
  const addBookmark = useCallback(async (coinId) => {
    if (!user) {
      console.error('Cannot add bookmark: User not logged in');
      return false;
    }
    
    // 如果已经收藏，不重复添加
    if (bookmarkedCoins.includes(coinId)) return true;
    
    try {
      console.log('Adding to watchlist:', coinId, 'for user:', user.uid);
      
      // 先更新本地状态，提供即时反馈
      const updatedBookmarks = [...bookmarkedCoins, coinId];
      setBookmarkedCoins(updatedBookmarks);
      // 同时更新localStorage，确保离线可用
      localStorage.setItem('bookmarkedCoins', JSON.stringify(updatedBookmarks));
      
      // 添加到Firebase（异步操作）
      const success = await addToWatchlist(user.uid, coinId);
      
      if (!success) {
        console.error('Failed to add to Firebase watchlist, but local state is updated');
      }
      
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      // 出错时回滚本地状态
      setBookmarkedCoins(bookmarkedCoins);
      localStorage.setItem('bookmarkedCoins', JSON.stringify(bookmarkedCoins));
      return false;
    }
  }, [user, bookmarkedCoins]);

  // 删除收藏 - 使用useCallback防止不必要的重新渲染
  const removeBookmark = useCallback(async (coinId) => {
    if (!user) {
      console.error('Cannot remove bookmark: User not logged in');
      return false;
    }
    
    try {
      console.log('Removing from watchlist:', coinId, 'for user:', user.uid);
      
      // 先更新本地状态，提供即时反馈
      const updatedBookmarks = bookmarkedCoins.filter(id => id !== coinId);
      setBookmarkedCoins(updatedBookmarks);
      // 同时更新localStorage，确保离线可用
      localStorage.setItem('bookmarkedCoins', JSON.stringify(updatedBookmarks));
      
      // 从Firebase中移除（异步操作）
      const success = await removeFromWatchlist(user.uid, coinId);
      
      if (!success) {
        console.error('Failed to remove from Firebase watchlist, but local state is updated');
      }
      
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      // 出错时回滚本地状态
      setBookmarkedCoins(bookmarkedCoins);
      localStorage.setItem('bookmarkedCoins', JSON.stringify(bookmarkedCoins));
      return false;
    }
  }, [user, bookmarkedCoins]);

  // 检查币种是否已收藏 - 使用useCallback防止不必要的重新渲染
  const isBookmarked = useCallback((coinId) => {
    return bookmarkedCoins.includes(coinId);
  }, [bookmarkedCoins]);
  
  // 获取收藏列表的详细数据 - 使用useCallback防止不必要的重新渲染
  const loadWatchlistData = useCallback(async () => {
    if (bookmarkedCoins.length === 0) {
      setWatchlistData([]);
      return;
    }
    
    setLoading(true);
    try {
      const promises = bookmarkedCoins.map(coinId => getCoinDetails(coinId));
      const results = await Promise.all(promises);
      
      // 格式化数据用于Watchlist显示
      const formattedData = results.map(coin => ({
        id: coin.id,
        name: coin.name,
        symbol: coin.symbol?.toUpperCase(),
        image: coin.image?.large,
        current_price: coin.market_data?.current_price?.usd,
        market_cap: coin.market_data?.market_cap?.usd,
        total_volume: coin.market_data?.total_volume?.usd,
        price_change_percentage_24h: coin.market_data?.price_change_percentage_24h
      }));
      
      setWatchlistData(formattedData);
    } catch (error) {
      console.error('Error loading watchlist data:', error);
    } finally {
      setLoading(false);
    }
  }, [bookmarkedCoins]);

  // 只有当bookmarkedCoins变化时才加载watchlist数据
  useEffect(() => {
    if (user && bookmarkedCoins.length > 0) {
      loadWatchlistData();
    }
  }, [bookmarkedCoins, user, loadWatchlistData]);
  
  const value = {
    user,
    login,
    logout,
    isLoggedIn: !!user,
    addBookmark,
    removeBookmark,
    isBookmarked,
    watchlistData,
    loading,
    authLoading,
    loadWatchlistData
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
} 