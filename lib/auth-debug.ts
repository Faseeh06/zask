import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";

// Enhanced auth state observer with debugging
export const onAuthStateChangeWithDebug = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    console.log("🔐 Auth State Changed:", {
      isAuthenticated: !!user,
      userEmail: user?.email,
      userId: user?.uid,
      timestamp: new Date().toISOString()
    });
    
    if (user) {
      console.log("✅ User is authenticated:", {
        email: user.email,
        uid: user.uid,
        emailVerified: user.emailVerified,
        metadata: {
          creationTime: user.metadata.creationTime,
          lastSignInTime: user.metadata.lastSignInTime
        }
      });
    } else {
      console.log("❌ User is NOT authenticated");
    }
    
    callback(user);
  });
};

// Get current user with debugging
export const getCurrentUser = (): User | null => {
  const user = auth.currentUser;
  console.log("🔍 getCurrentUser called:", {
    isAuthenticated: !!user,
    userEmail: user?.email,
    userId: user?.uid
  });
  return user;
};

// Check if user is authenticated
export const isUserAuthenticated = (): boolean => {
  const user = auth.currentUser;
  const isAuth = !!user;
  console.log("🔑 isUserAuthenticated:", isAuth);
  return isAuth;
}; 