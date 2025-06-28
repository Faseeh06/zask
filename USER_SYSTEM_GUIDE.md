# User Collection System Guide

## Overview
The application now has a comprehensive user management system that creates a Firestore collection for each person who signs up. This system stores detailed user information including roles, departments, assigned tasks, and more.

## How It Works

### 1. User Signup Process
When a user signs up:

**Email/Password Signup:**
1. User fills out the signup form with name, email, password, role, and department
2. Firebase Authentication creates the user account
3. A user profile is automatically created in the Firestore `users` collection
4. The profile includes all the requested fields: id, email, name, role, department, assigned tasks, etc.

**Google OAuth Signup:**
1. User clicks "Sign up with Google"
2. Google authentication completes
3. A profile completion modal appears asking for role and department
4. User selects their role and optionally enters department
5. User profile is created in Firestore with complete information

### 2. User Login Process
**Email/Password Login:**
- Standard login with existing credentials

**Google OAuth Login:**
1. User clicks "Continue with Google"
2. Google authentication completes
3. System checks if user profile exists in Firestore
4. If profile exists: User is logged in immediately
5. If profile doesn't exist: Profile completion modal appears to collect role/department
6. Complete profile is created and user is logged in

### 3. User Profile Structure
Each user document contains:
- **id**: Firebase Auth UID
- **email**: User's email address
- **name**: Full name
- **role**: One of: admin, project_manager, team_lead, developer, designer, analyst, member
- **department**: Optional department name
- **assignedTasks**: Array of task IDs
- **assignedProjects**: Array of project IDs
- **permissions**: Object with role-based permissions
- **status**: active, inactive, away, busy
- **profileImage**: Optional profile picture URL
- **phone**: Optional phone number
- **createdAt**: Account creation timestamp
- **updatedAt**: Last profile update timestamp
- **lastActive**: Last activity timestamp
- **preferences**: User preferences (theme, notifications)

### 4. Role-Based Permissions
Roles automatically get appropriate permissions:
- **Admin**: Full access to everything
- **Project Manager**: Can create projects, assign tasks, view reports, manage budget
- **Team Lead**: Can assign tasks, view reports
- **Developer/Designer/Analyst/Member**: Basic access based on role

### 5. Where to View Users
- Navigate to the dashboard and click on the "Users" tab
- You'll see all registered users with their:
  - Profile information
  - Current status (active, away, busy, inactive)
  - Assigned tasks and projects count
  - Role and permissions
  - Department information
  - Last active timestamp

## Features

### Automatic User Creation
- Users are created automatically when someone signs up
- No manual user management needed
- Works with both email/password and Google OAuth signup

### Real-time Updates
- User status changes are reflected in real-time
- Live updates when users are added or modified

### Status Management
- Admins can update user status (active, away, busy, inactive)
- Status is shown with visual indicators

### Task & Project Assignment
- Track how many tasks and projects are assigned to each user
- Easy to see workload distribution

### Permission System
- Role-based permissions automatically applied
- Visual indicators show what each user can do

## Technical Implementation

### Files Created/Modified
1. **lib/user-service.ts** - Complete user management service
2. **components/ProfileCompletionModal.tsx** - Modal for Google OAuth users to complete profile
3. **app/auth/signup/page.tsx** - Updated signup with role/department selection + profile completion modal
4. **app/auth/login/page.tsx** - Updated login to handle incomplete Google OAuth profiles
5. **app/dashboard/page.tsx** - Updated users section to show new user profiles
6. **firestore-users-rules.txt** - Security rules for users collection

### Key Functions
- `userService.createUserProfile()` - Creates user profile after signup
- `userService.getAllUsers()` - Retrieves all users
- `userService.updateUserStatus()` - Updates user status
- `userService.assignTaskToUser()` - Assigns tasks to users
- `userService.listenToUsers()` - Real-time user updates

## Security
- Users can only edit their own profiles
- Only admins can delete user accounts
- All operations require authentication
- Proper Firestore security rules in place

## Next Steps
1. Deploy the updated Firestore security rules
2. Test the signup process
3. Verify users appear in the dashboard Users tab
4. Assign tasks and projects to users as needed

The system is now ready to track your team members with all the requested fields and functionality! 