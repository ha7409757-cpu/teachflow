/**
 * TeachFlow Authentication Context
 * Manages user sessions, role-based access, login, logout,
 * and enforces the exact Two Admin system rule.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { storageService, SEED_USERS } from '../services/storage';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithPin: (identifier: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (userData: {
    name: string;
    email?: string;
    phone: string;
    role: UserRole;
    designation: string;
    department?: string;
    pin: string;
    employeeId?: string;
    assignedClasses?: string[];
    assignedSubjects?: string[];
    bio?: string;
    experience?: string;
  }) => Promise<{ success: boolean; user?: User; error?: string }>;
  registerStaffUser: (userData: Partial<User> & { name: string; email: string; role: UserRole }) => void;
  changePin: (oldPin: string, newPin: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updatedData: Partial<User>) => void;
  allUsers: User[];
  refreshUsers: () => void;
  deleteUser: (userId: string) => void;
  approveUser: (userId: string) => void;
  canCreateAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'teachflow_current_user_id';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const language = (localStorage.getItem('teachflow_lang') || 'bn') as 'bn' | 'en';

  const refreshUsers = () => {
    const users = storageService.getUsers();
    setAllUsers(users);
  };

  useEffect(() => {
    refreshUsers();
    // Check persistent session
    const savedUserId = localStorage.getItem(AUTH_USER_KEY);
    const users = storageService.getUsers();
    
    if (savedUserId) {
      const found = users.find(u => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
      } else {
        // If saved user was deleted/invalid, reset to null
        setCurrentUser(null);
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    // No default auto-login for first visit to ensure security
    setIsLoading(false);
  }, []);

  const loginWithPin = async (identifier: string, pin: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 250));
    const users = storageService.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    const cleanPin = pin.trim();

    const user = users.find(u => 
      u.id.toLowerCase() === cleanId ||
      u.email.toLowerCase() === cleanId ||
      (u.phone && u.phone.replace(/\s+/g, '').includes(cleanId.replace(/\s+/g, ''))) ||
      u.employeeId.toLowerCase() === cleanId ||
      u.name.toLowerCase() === cleanId
    );

    if (!user) {
      setIsLoading(false);
      return { success: false, error: 'কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি। দয়া করে সঠিক আইডি বা নাম দিন।' };
    }

    if (user.status === 'PENDING') {
      setIsLoading(false);
      return { 
        success: false, 
        error: language === 'bn' 
          ? 'আপনার অ্যাকাউন্টটি অনুমোদনের অপেক্ষায় আছে। অ্যাডমিন অনুমোদন করলে আপনি লগইন করতে পারবেন।' 
          : 'Your account is pending approval. Please wait for the Admin to activate it.' 
      };
    }

    if (user.status === 'INACTIVE') {
      setIsLoading(false);
      return { success: false, error: 'এই অ্যাকাউন্টটি অ্যাডমিন কর্তৃক নিষ্ক্রিয় করা হয়েছে।' };
    }

    const correctPin = user.pin || '1234';
    if (cleanPin !== correctPin) {
      setIsLoading(false);
      return { success: false, error: 'ভুল পিন (PIN) নম্বর! দয়া করে সঠিক পিন দিন।' };
    }

    setCurrentUser(user);
    localStorage.setItem(AUTH_USER_KEY, user.id);
    setIsLoading(false);
    return { success: true };
  };

  const registerUser = async (userData: {
    name: string;
    email?: string;
    phone: string;
    role: UserRole;
    designation: string;
    department?: string;
    pin: string;
    employeeId?: string;
    assignedClasses?: string[];
    assignedSubjects?: string[];
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 300));

    // Validation
    if (!userData.name.trim()) {
      setIsLoading(false);
      return { success: false, error: 'আপনার নাম লিখুন।' };
    }

    if (!userData.pin || userData.pin.length < 4) {
      setIsLoading(false);
      return { success: false, error: 'পিন কমপক্ষে ৪ সংখ্যার হতে হবে।' };
    }

    if (userData.role === 'ADMIN' && !canCreateAdmin()) {
      setIsLoading(false);
      return { success: false, error: 'সিস্টেমে সর্বোচ্চ ২ জন অ্যাডমিন থাকতে পারবেন।' };
    }

    const prefix = userData.role === 'TEACHER' ? 'TCH' : userData.role === 'ADMIN' ? 'ADM' : 'STF';
    const randomCode = Math.floor(100 + Math.random() * 900);
    const generatedEmpId = userData.employeeId?.trim() || `EMP-${prefix}-${randomCode}`;

    const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const email = userData.email?.trim() || `${newUserId}@teachflow.local`;

    const newUser: User = {
      id: newUserId,
      name: userData.name.trim(),
      email,
      phone: userData.phone.trim(),
      role: userData.role,
      designation: userData.designation.trim() || (userData.role === 'TEACHER' ? 'সহকারী শিক্ষক' : 'কর্মকর্তা'),
      department: userData.department?.trim() || 'সাধারণ',
      employeeId: generatedEmpId,
      pin: userData.pin.trim(),
      status: 'PENDING',
      assignedClasses: userData.assignedClasses || [],
      assignedSubjects: userData.assignedSubjects || [],
      bio: userData.bio,
      experience: userData.experience,
      joiningDate: new Date().toISOString().split('T')[0],
      joinedAt: new Date().toISOString()
    };

    storageService.addUser(newUser, newUser);
    refreshUsers();
    // Do NOT auto-login as account is PENDING
    setIsLoading(false);
    return { success: true, user: newUser };
  };

  const registerStaffUser = (userData: Partial<User> & { name: string; email: string; role: UserRole }) => {
    const prefix = userData.role === 'TEACHER' ? 'TCH' : 'STF';
    const randomCode = Math.floor(100 + Math.random() * 900);
    const newUserId = `user_${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || '+880 1700-000000',
      role: userData.role,
      designation: userData.designation || 'সহকারী শিক্ষক',
      department: userData.department || 'সাধারণ',
      employeeId: userData.employeeId || `EMP-${prefix}-${randomCode}`,
      pin: userData.pin || '1234',
      status: 'ACTIVE',
      assignedClasses: userData.assignedClasses || ['Class 8'],
      assignedSubjects: userData.assignedSubjects || ['সাধারণ বিষয়'],
      joiningDate: new Date().toISOString().split('T')[0]
    };
    storageService.addUser(newUser, currentUser || newUser);
    refreshUsers();
  };

  const changePin = async (oldPin: string, newPin: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'লগইন করা নেই।' };
    if ((currentUser.pin || '1234') !== oldPin.trim()) {
      return { success: false, error: 'বর্তমান পিনটি সঠিক নয়।' };
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, error: 'নতুন পিন কমপক্ষে ৪ সংখ্যার হতে হবে।' };
    }

    const updated = { ...currentUser, pin: newPin.trim() };
    setCurrentUser(updated);
    storageService.updateUser(updated, currentUser);
    refreshUsers();
    return { success: true };
  };

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise(res => setTimeout(res, 250));
    const users = storageService.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      setIsLoading(false);
      return { success: false, error: 'No account found with this email address.' };
    }

    if (user.status === 'INACTIVE') {
      setIsLoading(false);
      return { success: false, error: 'This account has been deactivated by the Administrator.' };
    }

    setCurrentUser(user);
    localStorage.setItem(AUTH_USER_KEY, user.id);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const switchUser = (userId: string) => {
    const users = storageService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(AUTH_USER_KEY, user.id);
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedData };
    setCurrentUser(updated);
    storageService.updateUser(updated, currentUser);
    refreshUsers();
  };

  const deleteUser = (userId: string) => {
    storageService.deleteUser(userId, currentUser || undefined);
    refreshUsers();
  };

  const approveUser = (userId: string) => {
    const users = storageService.getUsers();
    const user = users.find(u => u.id === userId);
    if (user && user.status === 'PENDING') {
      const updated = { ...user, status: 'ACTIVE' as const };
      storageService.updateUser(updated, currentUser || undefined);
      refreshUsers();
    }
  };

  // Rule 34: Exactly two Admin accounts allowed in the entire system
  const canCreateAdmin = (): boolean => {
    const admins = storageService.getUsers().filter(u => u.role === 'ADMIN');
    return admins.length < 2;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || null,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        loginWithPin,
        registerUser,
        registerStaffUser,
        changePin,
        logout,
        switchUser,
        updateProfile,
        allUsers,
        refreshUsers,
        deleteUser,
        approveUser,
        canCreateAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
