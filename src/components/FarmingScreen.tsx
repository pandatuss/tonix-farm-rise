import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Zap, TrendingUp } from 'lucide-react';
import mascotHead from '@/assets/tonix-mascot-head.png';
import { useTelegram } from '@/hooks/useTelegram';
interface FarmingScreenProps {
  tonixBalance: number;
  farmingRate: number;
  dailyStreak: number;
  todayEarnings: number;
  onCollect: (amount: number) => void;
  onBoost: () => void;
  onCheckIn: () => void;
}
export default function FarmingScreen({
  tonixBalance,
  farmingRate,
  dailyStreak,
  todayEarnings,
  onCollect,
  onBoost,
  onCheckIn
}: FarmingScreenProps) {
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [accumulatedTonix, setAccumulatedTonix] = useState(0);
  const [progress, setProgress] = useState(0);
  const {
    user
  } = useTelegram();
  useEffect(() => {
    const interval = setInterval(() => {
      const increment = farmingRate / 3600; // Per second rate
      setAccumulatedTonix(prev => prev + increment);
      setProgress(prev => (prev + 1) % 100);
    }, 1000);
    return () => clearInterval(interval);
  }, [farmingRate]);
  const handleCheckIn = () => {
    if (!checkedInToday) {
      onCheckIn();
      setCheckedInToday(true);
    }
  };
  const handleCollect = () => {
    if (accumulatedTonix > 0) {
      onCollect(accumulatedTonix);
      setAccumulatedTonix(0);
      setProgress(0);
    }
  };
  const timeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor(diff % (1000 * 60) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  return <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header with Mascot */}
      <div className="text-center pt-4">
        <div className="w-20 h-20 mx-auto bg-gradient-primary rounded-full flex items-center justify-center tonix-glow p-1 mb-3 overflow-hidden">
          {user?.photo_url ? <img src={user.photo_url} alt={`${user.first_name}'s Profile`} className="w-full h-full object-cover rounded-full" /> : <img src={mascotHead} alt="TONIX Mascot" className="w-full h-full object-contain p-2" />}
        </div>
        <h1 className="text-xl font-bold text-gradient">TONIX Farm</h1>
        <p className="text-sm text-muted-foreground">
          @{user?.username || user?.first_name || 'tonixuser'}
        </p>
      </div>

      {/* Balance Section */}
      <div className="bg-gray-900 rounded-xl p-8 text-center space-y-3 border border-gray-800">
        <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">YOUR BALANCE</p>
        <p className="text-5xl font-bold text-blue-400">{tonixBalance.toLocaleString()}</p>
        <p className="text-gray-400 text-lg">TONIX</p>
        <p className="text-green-400 text-sm font-medium">Today: +{todayEarnings}</p>
      </div>

      {/* Farming Section */}
      <Card className="tonix-card p-6 text-center">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">FARMING RATE</p>
          <p className="text-xl font-bold text-tonix-primary">{farmingRate.toFixed(3)} TONIX/H</p>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">READY TO COLLECT</p>
          <p className="text-2xl font-bold text-gradient mb-2">{accumulatedTonix.toFixed(3)} TONIX</p>
          <Progress value={progress} className="h-2 mb-4" />
        </div>
        
        <div className="space-y-3">
          <Button onClick={handleCollect} className="w-full tonix-button bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold py-3" disabled={accumulatedTonix < 0.001}>
            <Coins className="w-5 h-5 mr-2" />
            Collect TONIX
          </Button>
          
          <Button onClick={onBoost} variant="outline" className="w-full tonix-button border-tonix-primary text-tonix-primary hover:bg-tonix-primary hover:text-primary-foreground">
            <Zap className="w-5 h-5 mr-2" />
            Boost Rate
          </Button>
        </div>
      </Card>
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-6 relative overflow-hidden">
        {/* Header with flame icon and streak count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <img src="/lovable-uploads/8657a57d-1f6d-4c60-9e97-e85c55e87b4d.png" alt="Fire" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Daily Streak Check-in</h3>
              <p className="text-gray-400 text-sm">Keep your streak alive!</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-orange-400 text-2xl font-bold">
              {dailyStreak}
            </div>
            <p className="text-gray-400 text-xs uppercase tracking-wide">day streak</p>
          </div>
        </div>
        
        {/* Countdown section */}
        <div className="text-center mb-6 py-4 bg-black/20 rounded-lg">
          <p className="text-pink-400 text-sm mb-3 flex items-center justify-center">
            <span className="mr-2">⏰</span>
            Come back in {timeUntilReset()} for your next check-in.
          </p>
          <div className="mt-3">
            <p className="text-gray-400 text-xs mb-2 uppercase tracking-wide">Next check-in in:</p>
            <p className="text-orange-500 text-xl font-mono font-bold">{timeUntilReset()}</p>
          </div>
        </div>
        
        {/* Check-in button or status */}
        {!checkedInToday ? <Button onClick={handleCheckIn} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg">
            Check In Now
          </Button> : <div className="w-full bg-green-600/20 border border-green-500/30 text-green-400 py-3 rounded-lg text-center font-semibold">
            <span className="mr-2">✓</span>
            Streak Maintained Today
          </div>}
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
    </div>;
}