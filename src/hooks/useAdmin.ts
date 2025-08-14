import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { userService } from '../services/adminService';
import { User } from '../types/admin';

export const useAdmin = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!authUser) {
      setUserProfile(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    loadUserProfile();
  }, [authUser, authLoading]);

  const loadUserProfile = async () => {
    if (!authUser?.email) return;

    try {
      let profile = await userService.getUserByEmail(authUser.email);
      
      // If user doesn't exist in our database, create them
      if (!profile) {
        const userId = await userService.createUser({
          email: authUser.email,
          displayName: authUser.displayName || 'Unknown User',
          photoURL: authUser.photoURL || undefined,
          role: 'student', // Default role
        });
        
        profile = {
          id: userId,
          email: authUser.email,
          displayName: authUser.displayName || 'Unknown User',
          photoURL: authUser.photoURL || undefined,
          role: 'student',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      setUserProfile(profile);
      setIsAdmin(profile.role === 'admin');
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, role: User['role']) => {
    try {
      await userService.updateUser(userId, { role });
      if (userId === userProfile?.id) {
        setUserProfile(prev => prev ? { ...prev, role } : null);
        setIsAdmin(role === 'admin');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  return {
    userProfile,
    isAdmin,
    loading: loading || authLoading,
    updateUserRole,
    refreshProfile: loadUserProfile,
  };
};