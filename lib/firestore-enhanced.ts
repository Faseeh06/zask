import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Timestamp } from "firebase/firestore";
import { DocumentData, QuerySnapshot } from "firebase/firestore";

// Enhanced error handling function
const handleFirestoreError = (error: unknown, operation: string): string => {
  console.error(`❌ Firestore ${operation} error:`, error);
  
  if (error instanceof Error) {
    if (error.message.includes('permission-denied')) {
      return `Permission denied: Please check Firebase security rules. User authenticated: ${!!auth.currentUser}`;
    }
    if (error.message.includes('unauthenticated')) {
      return 'User not authenticated. Please sign in.';
    }
    return error.message;
  }
  
  return `An error occurred during ${operation}`;
};

// Check authentication before operations
const checkAuth = (): boolean => {
  const isAuth = !!auth.currentUser;
  console.log(`🔐 Auth check: ${isAuth ? 'authenticated' : 'NOT authenticated'}`, {
    user: auth.currentUser?.email,
    uid: auth.currentUser?.uid
  });
  return isAuth;
};

// Enhanced institution service with auth checks
export const institutionServiceEnhanced = {
  // Create a new institution
  create: async (data: any): Promise<{ id?: string; error?: string }> => {
    console.log('🏢 Creating institution...');
    
    if (!checkAuth()) {
      return { error: 'User not authenticated' };
    }

    try {
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...data,
        createdBy: auth.currentUser?.uid || auth.currentUser?.email || 'unknown',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Institution created successfully:', docRef.id);
      return { id: docRef.id };
    } catch (error: unknown) {
      const errorMessage = handleFirestoreError(error, 'institution creation');
      return { error: errorMessage };
    }
  },

  // Get all institutions
  getAll: async (): Promise<{ institutions: any[]; error?: string }> => {
    console.log('📖 Fetching all institutions...');
    
    if (!checkAuth()) {
      return { institutions: [], error: 'User not authenticated' };
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'institutions'));
      const institutions: any[] = [];
      
      querySnapshot.forEach((doc) => {
        institutions.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ Fetched ${institutions.length} institutions`);
      return { institutions };
    } catch (error: unknown) {
      const errorMessage = handleFirestoreError(error, 'institutions fetch');
      return { institutions: [], error: errorMessage };
    }
  },

  // Listen to real-time updates
  listen: (callback: (institutions: any[]) => void) => {
    console.log('👂 Setting up institutions listener...');
    
    if (!checkAuth()) {
      console.log('❌ Cannot set up listener: user not authenticated');
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(collection(db, 'institutions'));
    return onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const institutions: any[] = [];
        querySnapshot.forEach((doc) => {
          institutions.push({ id: doc.id, ...doc.data() });
        });
        console.log(`📡 Real-time update: ${institutions.length} institutions`);
        callback(institutions);
      },
      (error) => {
        console.error('❌ Institutions listener error:', error);
        const errorMessage = handleFirestoreError(error, 'institutions listener');
        // You might want to show this error to the user
        callback([]);
      }
    );
  }
};

// Enhanced analytics service  
export const analyticsServiceEnhanced = {
  getAnalytics: async (): Promise<{ analytics: any; error?: string }> => {
    console.log('📊 Generating analytics...');
    
    if (!checkAuth()) {
      return { analytics: {}, error: 'User not authenticated' };
    }

    try {
      // Mock analytics for now - replace with real data fetching
      const analytics = {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        totalDonations: 0,
        totalDonationAmount: 0,
        totalExpenses: 0,
        totalExpenseAmount: 0,
        netBalance: 0,
        totalInstitutions: 0,
        activeInstitutions: 0,
        totalTeamMembers: 0,
        activeTeamMembers: 0,
        taskCompletionRate: 0,
        averageTaskDuration: 0,
        monthlyDonationGrowth: 0,
        monthlyExpenseGrowth: 0,
        topDonationCategories: [],
        topExpenseCategories: [],
        recentActivity: []
      };

      console.log('✅ Analytics generated successfully');
      return { analytics };
    } catch (error: unknown) {
      const errorMessage = handleFirestoreError(error, 'analytics generation');
      return { analytics: {}, error: errorMessage };
    }
  }
};

// Test function to verify Firebase connection
export const testFirebaseConnection = async (): Promise<void> => {
  console.log('🧪 Testing Firebase connection...');
  
  console.log('Firebase Auth:', {
    currentUser: auth.currentUser,
    isAuthenticated: !!auth.currentUser
  });

  try {
    // Try to read from a simple collection
    const testCollection = collection(db, 'test');
    await getDocs(testCollection);
    console.log('✅ Firebase Firestore connection successful');
  } catch (error) {
    console.error('❌ Firebase Firestore connection failed:', error);
    handleFirestoreError(error, 'connection test');
  }
}; 