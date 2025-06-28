import { 
  collection, 
  doc, 
  setDoc,
  getDoc,
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  onSnapshot,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Timestamp } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { DocumentData, QuerySnapshot } from "firebase/firestore";

// User interface with all requested fields
export interface AppUser {
  id: string; // Firebase Auth UID
  email: string;
  name: string;
  role: 'admin' | 'project_manager' | 'team_lead' | 'developer' | 'designer' | 'analyst' | 'member';
  department?: string;
  assignedTasks: string[]; // Array of task IDs
  assignedProjects: string[]; // Array of project IDs
  permissions: {
    canCreateProjects: boolean;
    canAssignTasks: boolean;
    canManageUsers: boolean;
    canViewReports: boolean;
    canManageBudget: boolean;
  };
  profileImage?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'away' | 'busy';
  lastActive?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    notifications: {
      email: boolean;
      push: boolean;
      taskUpdates: boolean;
      projectUpdates: boolean;
    };
  };
}

// Default user permissions based on role
const getDefaultPermissions = (role: AppUser['role']) => {
  switch (role) {
    case 'admin':
      return {
        canCreateProjects: true,
        canAssignTasks: true,
        canManageUsers: true,
        canViewReports: true,
        canManageBudget: true
      };
    case 'project_manager':
      return {
        canCreateProjects: true,
        canAssignTasks: true,
        canManageUsers: false,
        canViewReports: true,
        canManageBudget: true
      };
    case 'team_lead':
      return {
        canCreateProjects: false,
        canAssignTasks: true,
        canManageUsers: false,
        canViewReports: true,
        canManageBudget: false
      };
    default:
      return {
        canCreateProjects: false,
        canAssignTasks: false,
        canManageUsers: false,
        canViewReports: false,
        canManageBudget: false
      };
  }
};

// Enhanced error handling
const handleUserServiceError = (error: unknown, operation: string): string => {
  console.error(`❌ User Service ${operation} error:`, error);
  
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

// Check authentication
const checkAuth = (): boolean => {
  const isAuth = !!auth.currentUser;
  console.log(`🔐 User Service Auth check: ${isAuth ? 'authenticated' : 'NOT authenticated'}`, {
    user: auth.currentUser?.email,
    uid: auth.currentUser?.uid
  });
  return isAuth;
};

export const userService = {
  // Create user profile in Firestore (called after Firebase Auth signup)
  createUserProfile: async (
    firebaseUser: FirebaseUser, 
    additionalData: {
      name: string;
      role: AppUser['role'];
      department?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('👤 Creating user profile in Firestore...');
    
    try {
      const userData: AppUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: additionalData.name,
        role: additionalData.role,
        department: additionalData.department,
        assignedTasks: [],
        assignedProjects: [],
        permissions: getDefaultPermissions(additionalData.role),
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            push: true,
            taskUpdates: true,
            projectUpdates: true
          }
        }
      };

      // Use setDoc with the user's UID as the document ID
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      
      console.log('✅ User profile created successfully:', firebaseUser.uid);
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'user profile creation');
      return { success: false, error: errorMessage };
    }
  },

  // Get user profile by ID
  getUserProfile: async (userId: string): Promise<{ user?: AppUser; error?: string }> => {
    console.log('📖 Fetching user profile...');
    
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as AppUser;
        console.log('✅ User profile fetched successfully');
        return { user: userData };
      } else {
        return { error: 'User profile not found' };
      }
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'user profile fetch');
      return { error: errorMessage };
    }
  },

  // Get current user profile
  getCurrentUserProfile: async (): Promise<{ user?: AppUser; error?: string }> => {
    if (!checkAuth()) {
      return { error: 'User not authenticated' };
    }

    return await userService.getUserProfile(auth.currentUser!.uid);
  },

  // Update user profile
  updateUserProfile: async (
    userId: string,
    updates: Partial<AppUser>
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('✏️ Updating user profile...');
    
    if (!checkAuth()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const updateData = {
        ...updates,
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(doc(db, 'users', userId), updateData);
      
      console.log('✅ User profile updated successfully');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'user profile update');
      return { success: false, error: errorMessage };
    }
  },

  // Update user status
  updateUserStatus: async (
    userId: string,
    status: AppUser['status']
  ): Promise<{ success: boolean; error?: string }> => {
    return await userService.updateUserProfile(userId, { 
      status,
      lastActive: Timestamp.now()
    });
  },

  // Assign task to user
  assignTaskToUser: async (
    userId: string,
    taskId: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('📋 Assigning task to user...');
    
    if (!checkAuth()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        assignedTasks: arrayUnion(taskId),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Task assigned to user successfully');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'task assignment');
      return { success: false, error: errorMessage };
    }
  },

  // Remove task from user
  removeTaskFromUser: async (
    userId: string,
    taskId: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('🗑️ Removing task from user...');
    
    if (!checkAuth()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        assignedTasks: arrayRemove(taskId),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Task removed from user successfully');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'task removal');
      return { success: false, error: errorMessage };
    }
  },

  // Assign project to user
  assignProjectToUser: async (
    userId: string,
    projectId: string
  ): Promise<{ success: boolean; error?: string }> => {
    console.log('📁 Assigning project to user...');
    
    if (!checkAuth()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        assignedProjects: arrayUnion(projectId),
        updatedAt: Timestamp.now()
      });
      
      console.log('✅ Project assigned to user successfully');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'project assignment');
      return { success: false, error: errorMessage };
    }
  },

  // Get all users
  getAllUsers: async (): Promise<{ users: AppUser[]; error?: string }> => {
    console.log('👥 Fetching all users...');
    
    if (!checkAuth()) {
      return { users: [], error: 'User not authenticated' };
    }

    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users: AppUser[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as AppUser);
      });
      
      console.log(`✅ Fetched ${users.length} users`);
      return { users };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'users fetch');
      return { users: [], error: errorMessage };
    }
  },

  // Get users by role
  getUsersByRole: async (role: AppUser['role']): Promise<{ users: AppUser[]; error?: string }> => {
    console.log(`👥 Fetching users with role: ${role}...`);
    
    if (!checkAuth()) {
      return { users: [], error: 'User not authenticated' };
    }

    try {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const querySnapshot = await getDocs(q);
      const users: AppUser[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as AppUser);
      });
      
      console.log(`✅ Fetched ${users.length} users with role ${role}`);
      return { users };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'users by role fetch');
      return { users: [], error: errorMessage };
    }
  },

  // Get users by department
  getUsersByDepartment: async (department: string): Promise<{ users: AppUser[]; error?: string }> => {
    console.log(`👥 Fetching users in department: ${department}...`);
    
    if (!checkAuth()) {
      return { users: [], error: 'User not authenticated' };
    }

    try {
      const q = query(collection(db, 'users'), where('department', '==', department));
      const querySnapshot = await getDocs(q);
      const users: AppUser[] = [];
      
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as AppUser);
      });
      
      console.log(`✅ Fetched ${users.length} users in department ${department}`);
      return { users };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'users by department fetch');
      return { users: [], error: errorMessage };
    }
  },

  // Listen to real-time user updates
  listenToUsers: (callback: (users: AppUser[]) => void) => {
    console.log('👂 Setting up users listener...');
    
    if (!checkAuth()) {
      console.log('❌ Cannot set up listener: user not authenticated');
      return () => {}; // Return empty unsubscribe function
    }

    const q = query(collection(db, 'users'));
    return onSnapshot(q, 
      (querySnapshot: QuerySnapshot<DocumentData>) => {
        const users: AppUser[] = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() } as AppUser);
        });
        console.log(`📡 Real-time update: ${users.length} users`);
        callback(users);
      },
      (error) => {
        console.error('❌ Users listener error:', error);
        const errorMessage = handleUserServiceError(error, 'users listener');
        callback([]);
      }
    );
  },

  // Delete user profile (admin only)
  deleteUserProfile: async (userId: string): Promise<{ success: boolean; error?: string }> => {
    console.log('🗑️ Deleting user profile...');
    
    if (!checkAuth()) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      
      console.log('✅ User profile deleted successfully');
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = handleUserServiceError(error, 'user profile deletion');
      return { success: false, error: errorMessage };
    }
  }
};

// Helper function to get user display name
export const getUserDisplayName = (user: AppUser): string => {
  return user.name || user.email || 'Unknown User';
};

// Helper function to get role display name
export const getRoleDisplayName = (role: AppUser['role']): string => {
  const roleMap: Record<AppUser['role'], string> = {
    admin: 'Administrator',
    project_manager: 'Project Manager',
    team_lead: 'Team Lead',
    developer: 'Developer',
    designer: 'Designer',
    analyst: 'Analyst',
    member: 'Team Member'
  };
  
  return roleMap[role] || role;
}; 