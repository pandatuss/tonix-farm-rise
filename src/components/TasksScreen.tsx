import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, Gift, Clock } from 'lucide-react';

interface TasksScreenProps {
  onClaimDaily: () => void;
  onClaimWeekly: () => void;
  onCheckIn: () => void;
}

export default function TasksScreen({ onClaimDaily, onClaimWeekly, onCheckIn }: TasksScreenProps) {
  const [dailyStreak, setDailyStreak] = useState(7);
  const [dailyClaimedToday, setDailyClaimedToday] = useState(false);
  const [weeklyClaimedThisWeek, setWeeklyClaimedThisWeek] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);

  const handleDailyCheckIn = () => {
    if (!checkedInToday) {
      onCheckIn();
      setCheckedInToday(true);
      setDailyStreak(prev => prev + 1);
    }
  };

  const handleDailyClaim = () => {
    if (!dailyClaimedToday) {
      onClaimDaily();
      setDailyClaimedToday(true);
    }
  };

  const handleWeeklyClaim = () => {
    if (!weeklyClaimedThisWeek) {
      onClaimWeekly();
      setWeeklyClaimedThisWeek(true);
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
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="p-6 space-y-6 mt-24">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">Daily Tasks</h1>
        <p className="text-muted-foreground">Complete tasks to earn bonus TONIX</p>
      </div>

      {/* Daily Streak */}
      <Card className="tonix-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-tonix-primary" />
            <div>
              <h3 className="text-xl font-bold">Daily Check-in</h3>
              <p className="text-sm text-muted-foreground">Maintain your streak</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-tonix-primary/20 text-tonix-primary">
            {dailyStreak} days
          </Badge>
        </div>
        
        <div className="mb-4">
          <p className="text-center text-lg font-semibold text-tonix-success mb-2">
            +50 TONIX Bonus
          </p>
          <p className="text-sm text-center text-muted-foreground">
            Resets in: {timeUntilReset()}
          </p>
        </div>
        
        <Button
          onClick={handleDailyCheckIn}
          disabled={checkedInToday}
          className="w-full tonix-button bg-gradient-primary hover:opacity-90 disabled:opacity-50"
        >
          {checkedInToday ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Checked In Today
            </>
          ) : (
            <>
              <Calendar className="w-5 h-5 mr-2" />
              Check In
            </>
          )}
        </Button>
      </Card>

      {/* Daily Bonus */}
      <Card className="tonix-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Gift className="w-6 h-6 text-tonix-warning" />
            <div>
              <h3 className="text-xl font-bold">Daily Bonus</h3>
              <p className="text-sm text-muted-foreground">Free TONIX every 24 hours</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-tonix-warning/20 text-tonix-warning">
            +100 TONIX
          </Badge>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-center text-muted-foreground">
            Next claim in: {timeUntilReset()}
          </p>
        </div>
        
        <Button
          onClick={handleDailyClaim}
          disabled={dailyClaimedToday}
          variant="outline"
          className="w-full tonix-button border-tonix-warning text-tonix-warning hover:bg-tonix-warning hover:text-primary-foreground disabled:opacity-50"
        >
          {dailyClaimedToday ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Claimed Today
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 mr-2" />
              Claim Daily Bonus
            </>
          )}
        </Button>
      </Card>

      {/* Weekly Bonus */}
      <Card className="tonix-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-6 h-6 text-tonix-secondary" />
            <div>
              <h3 className="text-xl font-bold">Weekly Bonus</h3>
              <p className="text-sm text-muted-foreground">Bigger reward every 7 days</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-tonix-secondary/20 text-tonix-secondary">
            +500 TONIX
          </Badge>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-center text-muted-foreground">
            Resets every Monday at 00:00 UTC
          </p>
        </div>
        
        <Button
          onClick={handleWeeklyClaim}
          disabled={weeklyClaimedThisWeek}
          variant="outline"
          className="w-full tonix-button border-tonix-secondary text-tonix-secondary hover:bg-tonix-secondary hover:text-primary-foreground disabled:opacity-50"
        >
          {weeklyClaimedThisWeek ? (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Claimed This Week
            </>
          ) : (
            <>
              <Clock className="w-5 h-5 mr-2" />
              Claim Weekly Bonus
            </>
          )}
        </Button>
      </Card>

      {/* Special Tasks Placeholder */}
      <Card className="tonix-card p-6 border-dashed border-2 border-muted">
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">Special Tasks</h3>
          <p className="text-sm text-muted-foreground">
            More exciting challenges coming soon!
          </p>
        </div>
      </Card>
    </div>
  );
}