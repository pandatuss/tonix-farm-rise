import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTelegram } from '@/hooks/useTelegram';

interface UserProfile {
  id: string;
  telegram_id: number;
  telegram_username?: string;
  first_name?: string;
  last_name?: string;
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
  completed_at: string;
  reward_amount?: number;
}

interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  created_at: string;
}

interface UserContextType {
  profile: UserProfile | null;
  taskCompletions: TaskCompletion[];
  referrals: Referral[];
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  completeTask: (taskType: string, taskId: string, rewardAmount: number) => Promise<void>;
  createReferral: (referredTelegramId: number) => Promise<void>;
  refreshData: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  profile: null,
  taskCompletions: [],
  referrals: [],
  isLoading: true,
  updateProfile: async () => {},
  completeTask: async () => {},
  createReferral: async () => {},
  refreshData: async () => {},
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { user: telegramUser, isReady } = useTelegram();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [taskCompletions, setTaskCompletions] = useState<TaskCompletion[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Note: RLS policies are configured to use app.current_telegram_id setting
  // For now, we'll work with direct telegram_id matching in queries

  const loadUserData = async () => {
    if (!telegramUser) return;

    try {
      setIsLoading(true);

      // Load or create user profile
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      let userProfile = existingProfile;

      if (!userProfile) {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            telegram_id: telegramUser.id,
            telegram_username: telegramUser.username,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
          })
          .select()
          .single();

        if (createError) throw createError;
        userProfile = newProfile;
      }

      setProfile(userProfile);

      // Load task completions
      const { data: completions } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userProfile.id);

      setTaskCompletions(completions || []);

      // Load referrals
      const { data: userReferrals } = await supabase
        .from('referrals')
        .select('*')
        .or(`referrer_id.eq.${userProfile.id},referred_id.eq.${userProfile.id}`);

      setReferrals(userReferrals || []);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile || !telegramUser) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('telegram_id', telegramUser.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const completeTask = async (taskType: string, taskId: string, rewardAmount: number) => {
    if (!profile || !telegramUser) return;

    try {
      // Insert task completion
      const { data: completion, error: taskError } = await supabase
        .from('task_completions')
        .insert({
          user_id: profile.id,
          task_type: taskType,
          task_id: taskId,
          reward_amount: rewardAmount,
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Update user balance
      await updateProfile({
        tonix_balance: profile.tonix_balance + rewardAmount,
      });

      setTaskCompletions(prev => [...prev, completion]);
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  };

  const createReferral = async (referredTelegramId: number) => {
    if (!profile || !telegramUser) return;

    try {
      // Find referred user profile
      const { data: referredProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('telegram_id', referredTelegramId)
        .single();

      if (!referredProfile) throw new Error('Referred user not found');

      const { data: referral, error } = await supabase
        .from('referrals')
        .insert({
          referrer_id: profile.id,
          referred_id: referredProfile.id,
        })
        .select()
        .single();

      if (error) throw error;
      setReferrals(prev => [...prev, referral]);
    } catch (error) {
      console.error('Error creating referral:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isReady && telegramUser) {
      loadUserData();
    }
  }, [isReady, telegramUser]);

  return (
    <UserContext.Provider
      value={{
        profile,
        taskCompletions,
        referrals,
        isLoading,
        updateProfile,
        completeTask,
        createReferral,
        refreshData: loadUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};