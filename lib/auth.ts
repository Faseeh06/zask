import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  User
} from "firebase/auth";
import { auth } from "./firebase";

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Sign up with email and password
export const signUp = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred during sign up' };
  }
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<{ user?: User; error?: string }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred during sign in' };
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<{ user?: User; error?: string }> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred during Google sign in' };
  }
};

// Sign out
export const logout = async (): Promise<{ error?: string }> => {
  try {
    await signOut(auth);
    return {};
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : 'An error occurred during logout' };
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
}; 