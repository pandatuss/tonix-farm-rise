import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Coins, Zap, TrendingUp } from 'lucide-react';
import mascotHead from '@/assets/tonix-mascot-head.png';

interface FarmingScreenProps {
  tonixBalance: number;
  farmingRate: number;
  onCollect: (amount: number) => void;
  onBoost: () => void;
}

export default function FarmingScreen({ tonixBalance, farmingRate, onCollect, onBoost }: FarmingScreenProps) {
  const [accumulatedTonix, setAccumulatedTonix] = useState(0);
  const [progress, setProgress] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(250);

  useEffect(() => {
    const interval = setInterval(() => {
      const increment = farmingRate / 3600; // Per second rate
      setAccumulatedTonix(prev => prev + increment);
      setProgress(prev => (prev + 1) % 100);
    }, 1000);

    return () => clearInterval(interval);
  }, [farmingRate]);

  const handleCollect = () => {
    if (accumulatedTonix > 0) {
      onCollect(accumulatedTonix);
      setAccumulatedTonix(0);
      setProgress(0);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* User Profile Section */}
      <div className="tonix-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gradient">@username</h2>
            <p className="text-muted-foreground">Level 5</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Connected Wallet</p>
            <p className="font-mono text-xs text-tonix-primary">UQ...7Kj2</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-tonix-surface rounded-lg">
            <p className="text-3xl font-bold text-gradient">{tonixBalance.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Total TONIX</p>
          </div>
          <div className="text-center p-4 bg-tonix-surface rounded-lg">
            <p className="text-lg font-semibold text-tonix-success">+{todayEarnings}</p>
            <p className="text-sm text-muted-foreground">Today's Earnings</p>
          </div>
        </div>
      </div>

      {/* Farming Section */}
      <div className="tonix-card p-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-50"></div>
        <div className="relative z-10">
          <div className="farming-pulse mb-6">
            <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center tonix-glow p-4">
              <img src={mascotHead} alt="TONIX Mascot" className="w-full h-full object-contain" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-gradient mb-2">TONIX Farm</h3>
          <p className="text-lg font-semibold text-tonix-primary mb-1">{farmingRate.toFixed(3)} TONIX/H</p>
          <p className="text-sm text-muted-foreground mb-6">Current Farming Rate</p>
          
          <div className="mb-6">
            <p className="text-lg font-semibold mb-2">
              {accumulatedTonix.toFixed(3)} TONIX Ready
            </p>
            <Progress value={progress} className="h-3 mb-4" />
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleCollect} 
              className="w-full tonix-button bg-gradient-primary hover:opacity-90 text-primary-foreground font-bold text-lg py-4"
              disabled={accumulatedTonix < 0.001}
            >
              <Coins className="w-5 h-5 mr-2" />
              Collect TONIX
            </Button>
            
            <Button 
              onClick={onBoost}
              variant="outline"
              className="w-full tonix-button border-tonix-primary text-tonix-primary hover:bg-tonix-primary hover:text-primary-foreground"
            >
              <Zap className="w-5 h-5 mr-2" />
              Boost Farming Rate
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-tonix-surface border-tonix-primary/20">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-tonix-success" />
            <div>
              <p className="text-sm text-muted-foreground">Daily Streak</p>
              <p className="font-bold text-tonix-success">7 days</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-tonix-surface border-tonix-primary/20">
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-tonix-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Rank</p>
              <p className="font-bold text-tonix-warning">#1,247</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}