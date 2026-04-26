import { create } from 'zustand';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { User, PaymentMethod } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  resetEmail: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  verifyOtp: (otp: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (otp: string, newPassword: string, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (name: string, email: string, phone: string) => void;
  updateAvatar: (avatarUri: string) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => void;
  removePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  clearError: () => void;
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: Crypto.randomUUID(),
    type: 'card',
    last4: '4242',
    brand: 'Visa',
    isDefault: true,
  },
  {
    id: Crypto.randomUUID(),
    type: 'apple_pay',
    isDefault: false,
  },
];

const createMockUser = (name: string, email: string, phone: string): User => ({
  id: Crypto.randomUUID(),
  name,
  email,
  phone,
  avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=200`,
  defaultAddressId: null,
  savedPaymentMethods: mockPaymentMethods,
  referralCode: `FROST${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
  createdAt: new Date(),
});

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  resetEmail: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }
      
      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }

      const user = createMockUser('Alex Johnson', email, '+1 555-123-4567');
      
      await SecureStore.setItemAsync('auth_token', Crypto.randomUUID());
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      
      set({ user, isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Login failed. Please try again.', isLoading: false });
      return false;
    }
  },

  signup: async (name: string, email: string, phone: string, password: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (name.length < 2) {
        set({ authError: 'Please enter your full name', isLoading: false });
        return false;
      }
      
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }
      
      if (phone.length < 10) {
        set({ authError: 'Please enter a valid phone number', isLoading: false });
        return false;
      }
      
      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }

      const user = createMockUser(name, email, phone);
      
      await SecureStore.setItemAsync('auth_token', Crypto.randomUUID());
      await SecureStore.setItemAsync('user_data', JSON.stringify(user));
      await SecureStore.setItemAsync('pending_otp', 'true');
      
      set({ user, isAuthenticated: false, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  verifyOtp: async (otp: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        set({ authError: 'Please enter a valid 6-digit code', isLoading: false });
        return false;
      }
      
      await SecureStore.deleteItemAsync('pending_otp');
      
      set({ isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Verification failed. Please try again.', isLoading: false });
      return false;
    }
  },

  forgotPassword: async (email: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }
      
      set({ resetEmail: email, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Failed to send reset code. Please try again.', isLoading: false });
      return false;
    }
  },

  resetPassword: async (otp: string, newPassword: string, confirmPassword: string) => {
    set({ isLoading: true, authError: null });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        set({ authError: 'Invalid verification code', isLoading: false });
        return false;
      }
      
      if (newPassword.length < 6) {
        set({ authError: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }
      
      if (newPassword !== confirmPassword) {
        set({ authError: 'Passwords do not match', isLoading: false });
        return false;
      }
      
      set({ resetEmail: null, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Failed to reset password. Please try again.', isLoading: false });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      await SecureStore.deleteItemAsync('pending_otp');
      
      set({ user: null, isAuthenticated: false, isLoading: false, authError: null, resetEmail: null });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      const pendingOtp = await SecureStore.getItemAsync('pending_otp');
      
      if (token && userData && !pendingOtp) {
        const user = JSON.parse(userData);
        user.createdAt = new Date(user.createdAt);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
    }
  },

  updateProfile: (name: string, email: string, phone: string) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, name, email, phone };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
    }
  },

  updateAvatar: (avatarUri: string) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, avatar: avatarUri };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
    }
  },

  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
    const { user } = get();
    if (user) {
      const newMethod: PaymentMethod = {
        ...method,
        id: Crypto.randomUUID(),
        isDefault: user.savedPaymentMethods.length === 0,
      };
      const updatedUser = {
        ...user,
        savedPaymentMethods: [...user.savedPaymentMethods, newMethod],
      };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
    }
  },

  removePaymentMethod: (id: string) => {
    const { user } = get();
    if (user) {
      const updatedMethods = user.savedPaymentMethods.filter(m => m.id !== id);
      if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
        updatedMethods[0].isDefault = true;
      }
      const updatedUser = {
        ...user,
        savedPaymentMethods: updatedMethods,
      };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
    }
  },

  setDefaultPaymentMethod: (id: string) => {
    const { user } = get();
    if (user) {
      const updatedMethods = user.savedPaymentMethods.map(m => ({
        ...m,
        isDefault: m.id === id,
      }));
      const updatedUser = {
        ...user,
        savedPaymentMethods: updatedMethods,
      };
      set({ user: updatedUser });
      SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
    }
  },

  clearError: () => set({ authError: null }),
}));