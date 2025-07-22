import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegram } from './useTelegram';

// Data types
interface UserProfile {
  id: string;
  telegram_id: number;
  first_name?: string;
  last_name?: string;
  telegram_username?: string;
  tonix_balance: number;
  farming_rate: number;
  ready_to_collect: number;
  daily_streak: number;
  today_earnings: number;
  last_check_in?: string;
  last_collect?: string;
  created_at: string;
  updated_at: string;
}

interface TaskCompletion {
  id: string;
  user_id: string;
  task_type: string;
  task_id: string;
  reward_amount?: number;
  completed_at: string;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
}

interface UserStats {
  profile: UserProfile;
  taskCompletions: TaskCompletion[];
  referrals: Referral[];
  timers: {
    hasCheckedInToday: boolean;
    timeUntilReset: number;
    timeUntilWeeklyReset: number;
  };
  farming: {
    readyToCollect: number;
    maxAccumulation: number;
    farmingRate: number;
    lastCollect: string;
  };
}

// Context type
interface UserContextType {
  profile: UserProfile | null;
  taskCompletions: TaskCompletion[];
  referrals: Referral[];
  isLoading: boolean;
  stats: UserStats | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeTask: (taskType: string, taskId: string, rewardAmount: number) => Promise<void>;
  createReferral: (referralCode: string) => Promise<void>;
  collectTonix: () => Promise<{ collected: number; newBalance: number }>;
  dailyCheckin: () => Promise<{ newStreak: number }>;
  refreshData: () => Promise<void>;
}

// Create context
const UserContext = createContext<UserContextType>({
  profile: null,
  taskCompletions: [],
  referrals: [],
  isLoading: true,
  stats: null,
  updateProfile: async () => {},
  completeTask: async () => {},
  createReferral: async () => {},
  collectTonix: async () => ({ collected: 0, newBalance: 0 }),
  dailyCheckin: async () => ({ newStreak: 0 }),
  refreshData: async () => {},
});

// Hook to use the context
export const useUser = () => useContext(UserContext);

// Provider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser, isReady } = useTelegram();

  // Load user data from server
  const loadUserData = async () => {
    if (!telegramUser?.id) return;

    try {
      setIsLoading(true);
      
      // Get comprehensive user stats from server
      const { data, error } = await supabase.functions.invoke('get-user-stats', {
        body: { userId: telegramUser.id.toString() }
      });

      if (error) {
        console.error('Failed to load user stats:', error);
        
        // Try to create profile if it doesn't exist
        await createUserProfile();
        return;
      }

      const userStats = data as UserStats;
      setProfile(userStats.profile);
      setTaskCompletions(userStats.taskCompletions);
      setReferrals(userStats.referrals);
      setStats(userStats);

    } catch (error) {
      console.error('Error loading user data:', error);
      await createUserProfile();
    } finally {
      setIsLoading(false);
    }
  };

  // Create user profile if it doesn't exist
  const createUserProfile = async () => {
    if (!telegramUser?.id) return;

    try {
      const profileData = {
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name || '',
        last_name: telegramUser.last_name || '',
        telegram_username: telegramUser.username || '',
        tonix_balance: 0,
        farming_rate: 1.0,
        ready_to_collect: 0,
        daily_streak: 0,
        today_earnings: 0,
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create profile:', error);
        return;
      }

      setProfile(data);
      setTaskCompletions([]);
      setReferrals([]);
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  // Update profile (direct database update for simple changes)
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!telegramUser?.id) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('telegram_id', telegramUser.id);

      if (error) {
        console.error('Failed to update profile:', error);
        return;
      }

      // Update local state
      if (profile) {
        setProfile({ ...profile, ...updates });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Complete task using server function
  const completeTask = async (taskType: string, taskId: string, rewardAmount: number) => {
    if (!telegramUser?.id) throw new Error('User not found');

    const { data, error } = await supabase.functions.invoke('complete-task', {
      body: {
        userId: telegramUser.id.toString(),
        taskType,
        taskId,
        rewardAmount
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to complete task');
    }

    // Refresh data after task completion
    await refreshData();
    return data;
  };

  // Create referral using server function
  const createReferral = async (referralCode: string) => {
    if (!telegramUser?.id) throw new Error('User not found');

    const { data, error } = await supabase.functions.invoke('submit-referral', {
      body: {
        userId: telegramUser.id.toString(),
        referralCode
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to process referral');
    }

    // Refresh data after referral
    await refreshData();
    return data;
  };

  // Collect TONIX using server function
  const collectTonix = async () => {
    if (!telegramUser?.id) throw new Error('User not found');

    const { data, error } = await supabase.functions.invoke('collect-tonix', {
      body: {
        userId: telegramUser.id.toString()
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to collect TONIX');
    }

    // Refresh data after collection
    await refreshData();
    return data;
  };

  // Daily check-in using server function
  const dailyCheckin = async () => {
    if (!telegramUser?.id) throw new Error('User not found');

    const { data, error } = await supabase.functions.invoke('daily-checkin', {
      body: {
        userId: telegramUser.id.toString()
      }
    });

    if (error) {
      throw new Error(error.message || 'Failed to process check-in');
    }

    // Refresh data after check-in
    await refreshData();
    return data;
  };

  // Refresh all data
  const refreshData = async () => {
    await loadUserData();
  };

  // Load data when Telegram user is ready
  useEffect(() => {
    if (isReady && telegramUser?.id) {
      loadUserData();
    }
  }, [isReady, telegramUser?.id]);

  // Auto-refresh every 30 seconds for farming calculations
  useEffect(() => {
    const interval = setInterval(() => {
      if (telegramUser?.id && !isLoading) {
        // Only refresh farming data, not full reload
        supabase.functions.invoke('calculate-farming', {
          body: { userId: telegramUser.id.toString() }
        }).then(({ data, error }) => {
          if (!error && data && profile) {
            setProfile(prev => prev ? { ...prev, ready_to_collect: data.readyToCollect } : null);
          }
        });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [telegramUser?.id, isLoading, profile]);

  return (
    <UserContext.Provider value={{
      profile,
      taskCompletions,
      referrals,
      isLoading,
      stats,
      updateProfile,
      completeTask,
      createReferral,
      collectTonix,
      dailyCheckin,
      refreshData,
    }}>
      {children}
    </UserContext.Provider>
  );
};