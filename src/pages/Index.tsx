import { useState } from 'react';
import FarmingScreen from '@/components/FarmingScreen';
import TasksScreen from '@/components/TasksScreen';
import LeaderboardScreen from '@/components/LeaderboardScreen';
import InventoryScreen from '@/components/InventoryScreen';
import ReferralScreen from '@/components/ReferralScreen';
import Navigation from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('farm');
  const [tonixBalance, setTonixBalance] = useState(2600);
  const [farmingRate, setFarmingRate] = useState(10.0);
  const [dailyStreak, setDailyStreak] = useState(7);
  const [todayEarnings, setTodayEarnings] = useState(32);
  const { toast } = useToast();

  const handleCollect = (amount: number) => {
    setTonixBalance(prev => prev + amount);
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

  const handleClaimDaily = () => {
    setTonixBalance(prev => prev + 100);
    toast({
      title: "Daily Bonus Claimed!",
      description: "You received 100 TONIX",
    });
  };

  const handleClaimWeekly = () => {
    setTonixBalance(prev => prev + 500);
    toast({
      title: "Weekly Bonus Claimed!",
      description: "You received 500 TONIX",
    });
  };

  const handleCheckIn = () => {
    setDailyStreak(prev => prev + 1);
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
