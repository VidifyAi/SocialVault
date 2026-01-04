'use client';

import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';
import { usersApi } from '@/lib/api';

interface User {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  trustScore: number;
  kycStatus: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): AuthState {
  const { user: clerkUser, isLoaded: isClerkLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!isSignedIn || !clerkUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await usersApi.getProfile();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // If we can't get the backend user, create a minimal user object from Clerk data
      setUser({
        id: clerkUser.id,
        clerkId: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        username: clerkUser.username || clerkUser.id,
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        avatarUrl: clerkUser.imageUrl,
        role: 'user',
        trustScore: 0,
        kycStatus: 'pending',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    if (isClerkLoaded) {
      fetchUser();
    }
  }, [isClerkLoaded, fetchUser]);

  const logout = useCallback(async () => {
    await signOut();
    setUser(null);
  }, [signOut]);

  const refreshUser = useCallback(async () => {
    setIsLoading(true);
    await fetchUser();
  }, [fetchUser]);

  return {
    user,
    isAuthenticated: isSignedIn ?? false,
    isLoading: !isClerkLoaded || isLoading,
    setUser,
    logout,
    refreshUser,
  };
}
