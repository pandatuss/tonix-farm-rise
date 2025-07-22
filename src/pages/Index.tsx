import { useState } from 'react';
import FarmingScreen from '@/components/FarmingScreen';
import TasksScreen from '@/components/TasksScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import InventoryScreen from '@/components/InventoryScreen';
import ReferralScreen from '@/components/ReferralScreen';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [activeTab, setActiveTab] = useState('farm');
  const { profile, updateProfile, completeTask, isLoading } = useUser();
  const { toast } = useToast();

  // Fallback values when profile is loading
  const tonixBalance = profile?.tonix_balance || 0;
  const farmingRate = profile?.farming_rate || 1.0;
  const dailyStreak = profile?.daily_streak || 0;
  const todayEarnings = profile?.today_earnings || 0;
  const readyToCollect = profile?.ready_to_collect || 0;

  const handleCollect = async (amount: number) => {
    if (!profile) return;
    
    await updateProfile({
      tonix_balance: profile.tonix_balance + amount,
      ready_to_collect: Math.max(0, profile.ready_to_collect - amount),
      last_collect: new Date().toISOString(),
    });
    
    // Process referral commission
    try {
      await supabase.functions.invoke('process-referral-commission', {
        body: { 
          userId: profile.id, 
          collectedAmount: amount 
        }
      });
    } catch (error) {
      console.log('Commission processing failed:', error);
    }
  };

  const handleBoost = () => {
    toast({
      title: "Boost Feature",
      description: "TON wallet integration coming soon!",
      duration: 2000
    });
  };

  const handleClaimDaily = async () => {
    try {
      await completeTask('daily', 'daily_bonus', 5);
      toast({
        title: "Daily Bonus Claimed!",
        description: "You received 5 TONIX",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Daily bonus already claimed today",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleClaimWeekly = async () => {
    try {
      await completeTask('weekly', 'weekly_bonus', 25);
      toast({
        title: "Weekly Bonus Claimed!",
        description: "You received 25 TONIX",
        duration: 2000
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Weekly bonus already claimed this week",
        variant: "destructive",
        duration: 2000
      });
    }
  };

  const handleCheckIn = async () => {
    if (!profile) return;
    
    const today = new Date().toISOString().split('T')[0];
    const newStreak = profile.last_check_in === today ? profile.daily_streak : profile.daily_streak + 1;
    
    await updateProfile({
      daily_streak: newStreak,
      last_check_in: today,
    });
    
    toast({
      title: "Check-in Successful!",
      description: "Daily streak maintained!",
      className: "mt-16",
      duration: 2000
    });
  };

  const handleClaimSpecialTask = async (points: number) => {
    try {
      await completeTask('special', 'special_task', points);
      toast({
        title: "Task Completed!",
        description: `You received ${points} TONIX`,
        duration: 2000
      });
    } catch (error) {
      // Silently handle errors - don't show error message to user
      console.log("Task completion failed:", error);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'farm':
        return (
          <FarmingScreen
            tonixBalance={tonixBalance}
            farmingRate={farmingRate}
            dailyStreak={dailyStreak}
            todayEarnings={todayEarnings}
            onCollect={handleCollect}
            onBoost={handleBoost}
            onCheckIn={handleCheckIn}
          />
        );
      case 'tasks':
        return (
        <TasksScreen 
          onClaimDaily={handleClaimDaily} 
          onClaimWeekly={handleClaimWeekly} 
          onCheckIn={handleCheckIn} 
          onClaimSpecialTask={handleClaimSpecialTask}
        />
        );
      case 'leaderboard':
        return <LeaderboardScreen />;
      case 'inventory':
        return <InventoryScreen />;
      case 'referral':
        return <ReferralScreen />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {renderScreen()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
