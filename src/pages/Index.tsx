import { useState } from 'react';
import FarmingScreen from '@/components/FarmingScreen';
import TasksScreen from '@/components/TasksScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import InventoryScreen from '@/components/InventoryScreen';
import ReferralScreen from '@/components/ReferralScreen';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';

const Index = () => {
  const [activeTab, setActiveTab] = useState('farm');
  const { profile, updateProfile, completeTask, isLoading } = useUser();
  const { toast } = useToast();

  // Fallback values when profile is loading
  const tonixBalance = profile?.tonix_balance || 0;
  const farmingRate = profile?.farming_rate || 10.0;
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
    
    toast({
      title: "TONIX Collected!",
      description: `You collected ${amount.toFixed(3)} TONIX`,
    });
  };

  const handleBoost = () => {
    toast({
      title: "Boost Feature",
      description: "TON wallet integration coming soon!",
    });
  };

  const handleClaimDaily = async () => {
    try {
      await completeTask('daily', 'daily_bonus', 100);
      toast({
        title: "Daily Bonus Claimed!",
        description: "You received 100 TONIX",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Daily bonus already claimed today",
        variant: "destructive",
      });
    }
  };

  const handleClaimWeekly = async () => {
    try {
      await completeTask('weekly', 'weekly_bonus', 500);
      toast({
        title: "Weekly Bonus Claimed!",
        description: "You received 500 TONIX",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Weekly bonus already claimed this week",
        variant: "destructive",
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
    });
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
