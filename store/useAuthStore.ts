import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
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
  updateProfile: (name: string, email: string, phone: string) => Promise<void>;
  updateAvatar: (avatarUri: string) => Promise<void>;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => Promise<void>;
  removePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  clearError: () => void;
}

const mapDatabaseUserToUser = (dbUser: any): User => ({
  id: dbUser.id,
  name: dbUser.name || '',
  email: dbUser.email || '',
  phone: dbUser.phone || '',
  avatar: dbUser.avatar || '',
  defaultAddressId: dbUser.defaultAddressId || null,
  savedPaymentMethods: [],
  referralCode: dbUser.referralCode || '',
  createdAt: new Date(dbUser.created_at),
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
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }

      if (password.length < 6) {
        set({ authError: 'Password must be at least 6 characters', isLoading: false });
        return false;
      }

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        let friendlyMessage = 'Login failed. Please try again.';
        if (authError.message.includes('Invalid login credentials')) {
          friendlyMessage = 'Incorrect email or password. Please try again.';
        } else if (authError.message.includes('Email not confirmed')) {
          friendlyMessage = 'Please verify your email address.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }

      if (!authData.user) {
        set({ authError: 'Login failed. Please try again.', isLoading: false });
        return false;
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile) {
        set({ authError: 'Failed to load user profile.', isLoading: false });
        return false;
      }

      const user = mapDatabaseUserToUser(profile);

      const { data: paymentMethods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('userId', authData.user.id);

      user.savedPaymentMethods = (paymentMethods || []).map((pm: any) => ({
        id: pm.id,
        type: pm.type,
        last4: pm.last4,
        brand: pm.brand,
        isDefault: pm.isDefault,
      }));

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

      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        let friendlyMessage = 'Signup failed. Please try again.';
        if (error.message.includes('already registered')) {
          friendlyMessage = 'An account with this email already exists.';
        } else if (error.message.includes('Password')) {
          friendlyMessage = 'Password does not meet requirements.';
        }
        set({ authError: friendlyMessage, isLoading: false });
        return false;
      }

      if (!authData.user) {
        set({ authError: 'Signup failed. Please try again.', isLoading: false });
        return false;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (!profile) {
        set({ authError: 'Failed to create user profile.', isLoading: false });
        return false;
      }

      const user = mapDatabaseUserToUser(profile);
      user.savedPaymentMethods = [];

      set({ user, isAuthenticated: true, isLoading: false, authError: null });
      return true;
    } catch (error) {
      set({ authError: 'Signup failed. Please try again.', isLoading: false });
      return false;
    }
  },

  verifyOtp: async (otp: string) => {
    set({ isLoading: true, authError: null });

    try {
      if (otp.length !== 6 || !/^\d+$/.test(otp)) {
        set({ authError: 'Please enter a valid 6-digit code', isLoading: false });
        return false;
      }

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
      if (!email.includes('@')) {
        set({ authError: 'Please enter a valid email address', isLoading: false });
        return false;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'seefar://reset-password',
      });

      if (error) {
        set({ authError: 'Failed to send reset code. Please try again.', isLoading: false });
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
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false, isLoading: false, authError: null, resetEmail: null });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });

    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();

        if (profile) {
          const user = mapDatabaseUserToUser(profile);

          const { data: paymentMethods } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('userId', sessionData.session.user.id);

          user.savedPaymentMethods = (paymentMethods || []).map((pm: any) => ({
            id: pm.id,
            type: pm.type,
            last4: pm.last4,
            brand: pm.brand,
            isDefault: pm.isDefault,
          }));

          set({ user, isAuthenticated: true, isLoading: false });
          return;
        }
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  updateUser: (updates: Partial<User>) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...updates };
      set({ user: updatedUser });
    }
  },

  updateProfile: async (name: string, email: string, phone: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ name, email, phone })
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { ...user, name, email, phone };
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  },

  updateAvatar: async (avatarUri: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const fileName = `avatar_${Date.now()}.jpg`;
      const base64 = await fetch(avatarUri).then(r => r.blob());

      const { data: existing } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existing && existing.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove(existing.map(f => `${user.id}/${f.name}`));
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${user.id}/${fileName}`, base64, {
          upsert: false,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${user.id}/${fileName}`);

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar: publicUrl.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const updatedUser = { ...user, avatar: publicUrl.publicUrl };
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to update avatar:', error);
    }
  },

  addPaymentMethod: async (method: Omit<PaymentMethod, 'id' | 'isDefault'>) => {
    const { user } = get();
    if (!user) return;

    try {
      const isDefault = user.savedPaymentMethods.length === 0;

      const { data: newMethod, error } = await supabase
        .from('payment_methods')
        .insert({
          userId: user.id,
          type: method.type,
          last4: method.last4,
          brand: method.brand,
          isDefault,
        })
        .select()
        .single();

      if (error) throw error;

      const updatedMethods = [
        ...user.savedPaymentMethods,
        {
          id: newMethod.id,
          type: newMethod.type,
          last4: newMethod.last4,
          brand: newMethod.brand,
          isDefault: newMethod.isDefault,
        },
      ];

      const updatedUser = { ...user, savedPaymentMethods: updatedMethods };
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to add payment method:', error);
    }
  },

  removePaymentMethod: async (id: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const updatedMethods = user.savedPaymentMethods.filter(m => m.id !== id);

      if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
        const firstMethod = updatedMethods[0];
        await supabase
          .from('payment_methods')
          .update({ isDefault: true })
          .eq('id', firstMethod.id);

        firstMethod.isDefault = true;
      }

      const updatedUser = { ...user, savedPaymentMethods: updatedMethods };
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to remove payment method:', error);
    }
  },

  setDefaultPaymentMethod: async (id: string) => {
    const { user } = get();
    if (!user) return;

    try {
      const updatedMethods = user.savedPaymentMethods.map(m => ({
        ...m,
        isDefault: m.id === id,
      }));

      for (const method of updatedMethods) {
        await supabase
          .from('payment_methods')
          .update({ isDefault: method.isDefault })
          .eq('id', method.id);
      }

      const updatedUser = { ...user, savedPaymentMethods: updatedMethods };
      set({ user: updatedUser });
    } catch (error) {
      console.error('Failed to set default payment method:', error);
    }
  },

  clearError: () => set({ authError: null }),
}));