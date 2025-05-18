import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

// Firebase配置
const firebaseConfig = 
  authDomain: "cryptotrading-b288a.firebaseapp.com",
  projectId: "cryptotrading-b288a", 
  storageBucket: "cryptotrading-b288a.appspot.com",
  messagingSenderId: "374214809654",
  appId: "1:374214809654:web:ea09275771cbf677fd6097"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 注册新用户
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // 在Firestore中创建用户文档
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: userCredential.user.email,
      watchlist: []
    });
    
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Registration error:", error);
    return { user: null, error: error.message };
  }
};

// 用户登录
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error("Login error:", error);
    return { user: null, error: error.message };
  }
};

// 用户登出
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, error: null };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
};

// 获取用户的watchlist
export const getUserWatchlist = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.watchlist || [];
    }
    return [];
  } catch (error) {
    console.error("Error getting watchlist:", error);
    return [];
  }
};

// 添加货币到watchlist
export const addToWatchlist = async (userId, coinId) => {
  try {
    if (!userId) {
      console.error('Cannot add to watchlist: No userId provided');
      return false;
    }
    
    const userRef = doc(db, "users", userId);
    
    // 首先检查用户文档是否存在
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // 如果用户文档不存在，创建一个新文档
      console.log('Creating new user document for:', userId);
      await setDoc(userRef, {
        watchlist: [coinId]
      });
    } else {
      // 如果文档存在，添加到watchlist数组
      await updateDoc(userRef, {
        watchlist: arrayUnion(coinId)
      });
    }
    
    console.log('Successfully added to watchlist:', coinId);
    return true;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return false;
  }
};

// 从watchlist移除货币
export const removeFromWatchlist = async (userId, coinId) => {
  try {
    if (!userId) {
      console.error('Cannot remove from watchlist: No userId provided');
      return false;
    }
    
    const userRef = doc(db, "users", userId);
    
    // 首先检查用户文档是否存在
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User document does not exist for:', userId);
      return false;
    }
    
    // 从watchlist中移除
    await updateDoc(userRef, {
      watchlist: arrayRemove(coinId)
    });
    
    console.log('Successfully removed from watchlist:', coinId);
    return true;
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return false;
  }
};

export { auth, db };
export default app;
