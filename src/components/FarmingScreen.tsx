import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Zap, TrendingUp } from 'lucide-react';
import mascotHead from '@/assets/tonix-mascot-head.png';

interface FarmingScreenProps {
  tonixBalance: number;
  farmingRate: number;
  dailyStreak: number;
  todayEarnings: number;
  onCollect: (amount: number) => void;
  onBoost: () => void;
  onCheckIn: () => void;
}

export default function FarmingScreen({ tonixBalance, farmingRate, dailyStreak, todayEarnings, onCollect, onBoost, onCheckIn }: FarmingScreenProps) {
  const [checkedInToday, setCheckedInToday] = useState(false);

  const handleCheckIn = () => {
    if (!checkedInToday) {
      onCheckIn();
      setCheckedInToday(true);
    }
  };

  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header with Mascot */}
      <div className="text-center pt-4">
        <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center tonix-glow p-3 mb-3">
          <img src={mascotHead} alt="TONIX Mascot" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-xl font-bold text-gradient">TONIX Farm</h1>
        <p className="text-sm text-muted-foreground">@tonixuser</p>
      </div>

      {/* Balance Section */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">YOUR BALANCE</p>
        <p className="text-4xl font-bold text-gradient">{tonixBalance.toLocaleString()}</p>
        <p className="text-lg text-muted-foreground">Points</p>
        <p className="text-sm text-tonix-success">Today: +{todayEarnings}</p>
      </div>

      {/* Daily Streak Check-in */}
      <Card className="tonix-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🔥</span>
            </div>
            <div>
              <h3 className="font-semibold">Daily Streak Check-in</h3>
              <p className="text-xs text-muted-foreground">Keep your streak alive!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-orange-500/20 text-orange-500 px-2 py-1 rounded text-xs font-bold">
              {dailyStreak}
            </div>
          </div>
        </div>
        
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-1">
            🔥 Come back in {timeUntilReset()} for your next check-in
          </p>
          <p className="text-xs text-muted-foreground">
            ⏰ Next check-in in:
          </p>
          <p className="font-bold text-orange-500">{timeUntilReset()}</p>
        </div>
        
        <Button
          onClick={handleCheckIn}
          disabled={checkedInToday}
          className="w-full bg-tonix-primary hover:bg-tonix-primary/90 text-primary-foreground font-semibold disabled:opacity-50"
        >
          {checkedInToday ? '✓ Streak Maintained' : 'Check In'}
        </Button>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-tonix-surface text-center">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-blue-500 text-sm">🏠</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">LEVEL</p>
          <p className="font-bold">5</p>
        </Card>
        
        <Card className="p-4 bg-tonix-surface text-center">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-green-500 text-sm">📅</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">DAY</p>
          <p className="font-bold">{dailyStreak}</p>
        </Card>
        
        <Card className="p-4 bg-tonix-surface text-center">
          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
            <span className="text-purple-500 text-sm">💎</span>
          </div>
          <p className="text-xs text-muted-foreground mb-1">TOTAL</p>
          <p className="font-bold">{tonixBalance.toLocaleString()}</p>
        </Card>
      </div>
    </div>
  );
}