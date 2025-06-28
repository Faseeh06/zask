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
import { db } from "./firebase";
import { Timestamp } from "firebase/firestore";
import { DocumentData, QuerySnapshot } from "firebase/firestore";

// Types
export interface Institution {
  id?: string;
  name: string;
  type: 'orphanage' | 'school' | 'both';
  address: string;
  city: string;
  contactPerson: string;
  phone: string;
  email: string;
  numberOfChildren: number;
  status: 'active' | 'inactive';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface TeamMember {
  id?: string;
  fullName: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'away' | 'offline';
  permissions: 'admin' | 'lead' | 'manager' | 'member';
  lastActive?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedEmail: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate?: Timestamp;
  progress?: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
  projectId: string;
}

export interface Project {
  id?: string;
  name: string;
  code: string;
  description: string;
  members: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy: string;
}

export interface Donation {
  id?: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: string;
  purpose: string;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'online';
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
  projectId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Expense {
  id?: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  category: 'office_supplies' | 'equipment' | 'travel' | 'marketing' | 'utilities' | 'software' | 'other';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  receipts?: string[]; // URLs to receipt images
  vendor?: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  projectId: string;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Report {
  id?: string;
  title: string;
  type: 'financial' | 'task_progress' | 'team_performance' | 'institution_summary' | 'donation_analytics' | 'expense_breakdown' | 'custom';
  description: string;
  generatedBy: string;
  projectId?: string;
  institutionId?: string;
  dateRange: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  data: {
    summary: Record<string, any>;
    details: any[];
    charts?: {
      type: 'bar' | 'line' | 'pie' | 'doughnut';
      data: any;
      labels: string[];
    }[];
  };
  filters?: Record<string, any>;
  status: 'generating' | 'completed' | 'failed';
  format: 'pdf' | 'excel' | 'json' | 'csv';
  fileUrl?: string;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  nextGeneration?: Timestamp;
  recipients?: string[]; // Email addresses for scheduled reports
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: string[]; // User IDs or email addresses
  recipientRoles?: ('admin' | 'lead' | 'manager' | 'member')[];
  projectId?: string;
  institutionId?: string;
  relatedEntityType?: 'task' | 'donation' | 'expense' | 'institution' | 'report';
  relatedEntityId?: string;
  isRead: boolean;
  readBy?: { userId: string; readAt: Timestamp }[];
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Timestamp;
  sendEmail: boolean;
  sendPush: boolean;
  createdBy: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  totalDonations: number;
  totalDonationAmount: number;
  totalExpenses: number;
  totalExpenseAmount: number;
  netBalance: number;
  totalInstitutions: number;
  activeInstitutions: number;
  totalTeamMembers: number;
  activeTeamMembers: number;
  taskCompletionRate: number;
  averageTaskDuration: number;
  monthlyDonationGrowth: number;
  monthlyExpenseGrowth: number;
  topDonationCategories: { category: string; amount: number; count: number }[];
  topExpenseCategories: { category: string; amount: number; count: number }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: Timestamp;
    entityId: string;
  }[];
}

// Institution CRUD Operations
export const institutionService = {
  // Create a new institution
  create: async (data: Omit<Institution, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'institutions'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all institutions
  getAll: async (): Promise<{ institutions: Institution[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'institutions'))
      const institutions: Institution[] = []
      querySnapshot.forEach((doc) => {
        institutions.push({ id: doc.id, ...doc.data() } as Institution)
      })
      return { institutions }
    } catch (error: unknown) {
      return { institutions: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update an institution
  update: async (id: string, data: Partial<Institution>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'institutions', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete an institution
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'institutions', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (institutions: Institution[]) => void) => {
    const q = query(collection(db, 'institutions'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const institutions: Institution[] = []
      querySnapshot.forEach((doc) => {
        institutions.push({ id: doc.id, ...doc.data() } as Institution)
      })
      callback(institutions)
    })
  }
}

// Team Member CRUD Operations
export const teamService = {
  // Create a new team member
  create: async (data: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'teamMembers'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all team members
  getAll: async (): Promise<{ members: TeamMember[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'teamMembers'))
      const members: TeamMember[] = []
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() } as TeamMember)
      })
      return { members }
    } catch (error: unknown) {
      return { members: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update a team member
  update: async (id: string, data: Partial<TeamMember>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'teamMembers', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete a team member
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'teamMembers', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (members: TeamMember[]) => void) => {
    const q = query(collection(db, 'teamMembers'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const members: TeamMember[] = []
      querySnapshot.forEach((doc) => {
        members.push({ id: doc.id, ...doc.data() } as TeamMember)
      })
      callback(members)
    })
  }
}

// Task CRUD Operations
export const taskService = {
  // Create a new task
  create: async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all tasks
  getAll: async (): Promise<{ tasks: Task[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tasks'))
      const tasks: Task[] = []
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task)
      })
      return { tasks }
    } catch (error: unknown) {
      return { tasks: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get tasks by project
  getByProject: async (projectId: string): Promise<{ tasks: Task[]; error?: string }> => {
    try {
      const q = query(collection(db, 'tasks'), where('projectId', '==', projectId))
      const querySnapshot = await getDocs(q)
      const tasks: Task[] = []
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task)
      })
      return { tasks }
    } catch (error: unknown) {
      return { tasks: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update a task
  update: async (id: string, data: Partial<Task>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'tasks', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete a task
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'tasks', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (tasks: Task[]) => void) => {
    const q = query(collection(db, 'tasks'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const tasks: Task[] = []
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() } as Task)
      })
      callback(tasks)
    })
  }
}

// Project CRUD Operations
export const projectService = {
  // Create a new project
  create: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all projects
  getAll: async (): Promise<{ projects: Project[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'))
      const projects: Project[] = []
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as Project)
      })
      return { projects }
    } catch (error: unknown) {
      return { projects: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update a project
  update: async (id: string, data: Partial<Project>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'projects', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete a project
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'projects', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (projects: Project[]) => void) => {
    const q = query(collection(db, 'projects'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const projects: Project[] = []
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as Project)
      })
      callback(projects)
    })
  }
}

// Donation service
export const donationService = {
  // Create a new donation
  create: async (data: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'donations'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all donations
  getAll: async (): Promise<{ donations: Donation[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'donations'))
      const donations: Donation[] = []
      querySnapshot.forEach((doc) => {
        donations.push({ id: doc.id, ...doc.data() } as Donation)
      })
      return { donations }
    } catch (error: unknown) {
      return { donations: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get donations by project
  getByProject: async (projectId: string): Promise<{ donations: Donation[]; error?: string }> => {
    try {
      const q = query(collection(db, 'donations'), where('projectId', '==', projectId))
      const querySnapshot = await getDocs(q)
      const donations: Donation[] = []
      querySnapshot.forEach((doc) => {
        donations.push({ id: doc.id, ...doc.data() } as Donation)
      })
      return { donations }
    } catch (error: unknown) {
      return { donations: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update a donation
  update: async (id: string, data: Partial<Donation>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'donations', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete a donation
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'donations', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (donations: Donation[]) => void) => {
    const q = query(collection(db, 'donations'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const donations: Donation[] = []
      querySnapshot.forEach((doc) => {
        donations.push({ id: doc.id, ...doc.data() } as Donation)
      })
      callback(donations)
    })
  }
}

// Expense service
export const expenseService = {
  // Create a new expense
  create: async (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all expenses
  getAll: async (): Promise<{ expenses: Expense[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'expenses'))
      const expenses: Expense[] = []
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense)
      })
      return { expenses }
    } catch (error: unknown) {
      return { expenses: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get expenses by project
  getByProject: async (projectId: string): Promise<{ expenses: Expense[]; error?: string }> => {
    try {
      const q = query(collection(db, 'expenses'), where('projectId', '==', projectId))
      const querySnapshot = await getDocs(q)
      const expenses: Expense[] = []
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense)
      })
      return { expenses }
    } catch (error: unknown) {
      return { expenses: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update an expense
  update: async (id: string, data: Partial<Expense>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'expenses', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete an expense
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'expenses', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (expenses: Expense[]) => void) => {
    const q = query(collection(db, 'expenses'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const expenses: Expense[] = []
      querySnapshot.forEach((doc) => {
        expenses.push({ id: doc.id, ...doc.data() } as Expense)
      })
      callback(expenses)
    })
  }
}

// Report service
export const reportService = {
  // Create a new report
  create: async (data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'reports'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all reports
  getAll: async (): Promise<{ reports: Report[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'reports'))
      const reports: Report[] = []
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report)
      })
      return { reports }
    } catch (error: unknown) {
      return { reports: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get reports by type
  getByType: async (type: Report['type']): Promise<{ reports: Report[]; error?: string }> => {
    try {
      const q = query(collection(db, 'reports'), where('type', '==', type))
      const querySnapshot = await getDocs(q)
      const reports: Report[] = []
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report)
      })
      return { reports }
    } catch (error: unknown) {
      return { reports: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get reports by project
  getByProject: async (projectId: string): Promise<{ reports: Report[]; error?: string }> => {
    try {
      const q = query(collection(db, 'reports'), where('projectId', '==', projectId))
      const querySnapshot = await getDocs(q)
      const reports: Report[] = []
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report)
      })
      return { reports }
    } catch (error: unknown) {
      return { reports: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update a report
  update: async (id: string, data: Partial<Report>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'reports', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete a report
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'reports', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Generate analytics report
  generateAnalytics: async (projectId?: string, dateRange?: { startDate: Timestamp; endDate: Timestamp }): Promise<{ analytics: Analytics; error?: string }> => {
    try {
      // Get all data for analytics
      const { tasks } = await taskService.getAll()
      const { donations } = await donationService.getAll()
      const { expenses } = await expenseService.getAll()
      const { institutions } = await institutionService.getAll()
      const { members } = await teamService.getAll()

      // Filter by project if specified
      const filteredTasks = projectId ? tasks.filter(t => t.projectId === projectId) : tasks
      const filteredDonations = projectId ? donations.filter(d => d.projectId === projectId) : donations
      const filteredExpenses = projectId ? expenses.filter(e => e.projectId === projectId) : expenses

      // Calculate analytics
      const totalTasks = filteredTasks.length
      const completedTasks = filteredTasks.filter(t => t.status === 'completed').length
      const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length
      const pendingTasks = filteredTasks.filter(t => t.status === 'todo').length

      const totalDonationAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0)
      const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

      const analytics: Analytics = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        totalDonations: filteredDonations.length,
        totalDonationAmount,
        totalExpenses: filteredExpenses.length,
        totalExpenseAmount,
        netBalance: totalDonationAmount - totalExpenseAmount,
        totalInstitutions: institutions.length,
        activeInstitutions: institutions.filter(i => i.status === 'active').length,
        totalTeamMembers: members.length,
        activeTeamMembers: members.filter(m => m.status === 'active').length,
        taskCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageTaskDuration: 0, // Would need task duration tracking
        monthlyDonationGrowth: 0, // Would need month-over-month calculation
        monthlyExpenseGrowth: 0, // Would need month-over-month calculation
        topDonationCategories: [],
        topExpenseCategories: filteredExpenses.reduce((acc, expense) => {
          const existing = acc.find(item => item.category === expense.category)
          if (existing) {
            existing.amount += expense.amount
            existing.count += 1
          } else {
            acc.push({ category: expense.category, amount: expense.amount, count: 1 })
          }
          return acc
        }, [] as { category: string; amount: number; count: number }[]).sort((a, b) => b.amount - a.amount),
        recentActivity: []
      }

      return { analytics }
    } catch (error: unknown) {
      return { analytics: {} as Analytics, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates
  listen: (callback: (reports: Report[]) => void) => {
    const q = query(collection(db, 'reports'))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const reports: Report[] = []
      querySnapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() } as Report)
      })
      callback(reports)
    })
  }
}

// Notification service
export const notificationService = {
  // Create a new notification
  create: async (data: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ id?: string; error?: string }> => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return { id: docRef.id }
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get all notifications
  getAll: async (): Promise<{ notifications: Notification[]; error?: string }> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'notifications'))
      const notifications: Notification[] = []
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification)
      })
      return { notifications }
    } catch (error: unknown) {
      return { notifications: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get notifications for user
  getForUser: async (userEmail: string): Promise<{ notifications: Notification[]; error?: string }> => {
    try {
      const q = query(collection(db, 'notifications'), where('recipients', 'array-contains', userEmail))
      const querySnapshot = await getDocs(q)
      const notifications: Notification[] = []
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification)
      })
      return { notifications }
    } catch (error: unknown) {
      return { notifications: [], error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Mark notification as read
  markAsRead: async (id: string, userId: string): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        isRead: true,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Update a notification
  update: async (id: string, data: Partial<Notification>): Promise<{ error?: string }> => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        ...data,
        updatedAt: Timestamp.now()
      })
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Delete a notification
  delete: async (id: string): Promise<{ error?: string }> => {
    try {
      await deleteDoc(doc(db, 'notifications', id))
      return {}
    } catch (error: unknown) {
      return { error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Listen to real-time updates for user
  listenForUser: (userEmail: string, callback: (notifications: Notification[]) => void) => {
    const q = query(collection(db, 'notifications'), where('recipients', 'array-contains', userEmail))
    return onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
      const notifications: Notification[] = []
      querySnapshot.forEach((doc) => {
        notifications.push({ id: doc.id, ...doc.data() } as Notification)
      })
      callback(notifications)
    })
  }
}

// Analytics service
export const analyticsService = {
  // Get comprehensive analytics
  getAnalytics: async (projectId?: string): Promise<{ analytics: Analytics; error?: string }> => {
    return await reportService.generateAnalytics(projectId)
  },

  // Get task analytics
  getTaskAnalytics: async (projectId?: string): Promise<{ taskStats: any; error?: string }> => {
    try {
      const { tasks } = await taskService.getAll()
      const filteredTasks = projectId ? tasks.filter(t => t.projectId === projectId) : tasks

      const taskStats = {
        total: filteredTasks.length,
        byStatus: {
          todo: filteredTasks.filter(t => t.status === 'todo').length,
          inProgress: filteredTasks.filter(t => t.status === 'in-progress').length,
          completed: filteredTasks.filter(t => t.status === 'completed').length
        },
        byPriority: {
          high: filteredTasks.filter(t => t.priority === 'high').length,
          medium: filteredTasks.filter(t => t.priority === 'medium').length,
          low: filteredTasks.filter(t => t.priority === 'low').length
        },
        completionRate: filteredTasks.length > 0 ? 
          (filteredTasks.filter(t => t.status === 'completed').length / filteredTasks.length) * 100 : 0
      }

      return { taskStats }
    } catch (error: unknown) {
      return { taskStats: {}, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  },

  // Get financial analytics
  getFinancialAnalytics: async (projectId?: string): Promise<{ financialStats: any; error?: string }> => {
    try {
      const { donations } = await donationService.getAll()
      const { expenses } = await expenseService.getAll()
      
      const filteredDonations = projectId ? donations.filter(d => d.projectId === projectId) : donations
      const filteredExpenses = projectId ? expenses.filter(e => e.projectId === projectId) : expenses

      const totalDonations = filteredDonations.reduce((sum, d) => sum + d.amount, 0)
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0)

      const financialStats = {
        donations: {
          total: filteredDonations.length,
          amount: totalDonations,
          byStatus: {
            pending: filteredDonations.filter(d => d.status === 'pending').length,
            completed: filteredDonations.filter(d => d.status === 'completed').length,
            failed: filteredDonations.filter(d => d.status === 'failed').length
          }
        },
        expenses: {
          total: filteredExpenses.length,
          amount: totalExpenses,
          byCategory: filteredExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount
            return acc
          }, {} as Record<string, number>)
        },
        netBalance: totalDonations - totalExpenses,
        monthlyTrend: [] // Would need date-based analysis
      }

      return { financialStats }
    } catch (error: unknown) {
      return { financialStats: {}, error: error instanceof Error ? error.message : 'An error occurred' }
    }
  }
} 