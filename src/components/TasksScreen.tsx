import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Clock, Calendar, ExternalLink, Twitter, Users, Check } from 'lucide-react';

interface TasksScreenProps {
  onClaimDaily: () => void;
  onClaimWeekly: () => void;
  onCheckIn: () => void;
  onClaimSpecialTask: (points: number) => void;
}

export default function TasksScreen({ onClaimDaily, onClaimWeekly, onCheckIn, onClaimSpecialTask }: TasksScreenProps) {
  const [dailyClaimedToday, setDailyClaimedToday] = useState(false);
  const [weeklyClaimedThisWeek, setWeeklyClaimedThisWeek] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [specialTasksCompleted, setSpecialTasksCompleted] = useState({
    followX: false,
    joinChannel: false,
    joinGroup: false,
  });
  
  const [specialTasksOpened, setSpecialTasksOpened] = useState({
    followX: false,
    joinChannel: false,
    joinGroup: false,
  });

  // Update timer every second and check for resets
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check if it's a new day (reset daily bonuses)
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const timeUntilTomorrow = tomorrow.getTime() - now.getTime();
      
      if (timeUntilTomorrow <= 1000 && dailyClaimedToday) {
        setDailyClaimedToday(false);
      }
      
      // Check if it's a new week (reset weekly bonuses)
      const nextMonday = new Date(now);
      const daysUntilMonday = (1 + 7 - now.getUTCDay()) % 7;
      if (daysUntilMonday === 0 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
        nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
      } else {
        nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
      }
      nextMonday.setUTCHours(0, 0, 0, 0);
      const timeUntilNextWeek = nextMonday.getTime() - now.getTime();
      
      if (timeUntilNextWeek <= 1000 && weeklyClaimedThisWeek) {
        setWeeklyClaimedThisWeek(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dailyClaimedToday, weeklyClaimedThisWeek]);

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
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const timeUntilWeeklyReset = () => {
    const now = new Date();
    const nextMonday = new Date(now);
    const daysUntilMonday = (1 + 7 - now.getUTCDay()) % 7;
    if (daysUntilMonday === 0 && now.getUTCHours() === 0 && now.getUTCMinutes() === 0) {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    } else {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
    }
    nextMonday.setUTCHours(0, 0, 0, 0);
    
    const diff = nextMonday.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleSpecialTask = (taskType: 'followX' | 'joinChannel' | 'joinGroup', url: string) => {
    if (!specialTasksOpened[taskType] && !specialTasksCompleted[taskType]) {
      // First click: open link and change button to "Claim"
      window.open(url, '_blank');
      setSpecialTasksOpened(prev => ({
        ...prev,
        [taskType]: true
      }));
    } else if (specialTasksOpened[taskType] && !specialTasksCompleted[taskType]) {
      // Second click: claim reward and show checkmark
      onClaimSpecialTask(5);
      setSpecialTasksCompleted(prev => ({
        ...prev,
        [taskType]: true
      }));
    }
  };

  return (
    <div className="p-4 mt-24">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-background border">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Daily
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="special" className="flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Special
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <Card className="bg-card border border-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Daily Bonus</h3>
                  <p className="text-sm text-muted-foreground">Claim every 24 hours</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-400">5</div>
                <div className="text-sm text-muted-foreground">TONIX</div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/20 border-t border-border">
              <div className="text-center mb-3">
                <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {dailyClaimedToday ? "Next claim in:" : "Available now"}
                </div>
                <div className="text-lg font-mono text-blue-400">{timeUntilReset()}</div>
              </div>
              <Button 
                onClick={handleDailyClaim}
                disabled={dailyClaimedToday}
                className={dailyClaimedToday 
                  ? "w-full bg-gray-500 text-white cursor-not-allowed" 
                  : "w-full bg-blue-500 hover:bg-blue-600 text-white"
                }
              >
                {dailyClaimedToday ? "Claimed - Wait for Reset" : "Claim Daily Bonus"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="bg-card border border-border">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Weekly Bonus</h3>
                  <p className="text-sm text-muted-foreground">Claim every 7 days</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-400">25</div>
                <div className="text-sm text-muted-foreground">TONIX</div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/20 border-t border-border">
              <div className="text-center mb-3">
                <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {weeklyClaimedThisWeek ? "Next claim in:" : "Available now"}
                </div>
                <div className="text-lg font-mono text-purple-400">{timeUntilWeeklyReset()}</div>
              </div>
              <Button 
                onClick={handleWeeklyClaim}
                disabled={weeklyClaimedThisWeek}
                className={weeklyClaimedThisWeek 
                  ? "w-full bg-gray-500 text-white cursor-not-allowed" 
                  : "w-full bg-purple-500 hover:bg-purple-600 text-white"
                }
              >
                {weeklyClaimedThisWeek ? "Claimed - Wait for Reset" : "Claim Weekly Bonus"}
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          {/* Follow on X Task */}
          <Card className="bg-card border border-border">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-6 h-6 text-green-500 mt-1">
                    <Gift className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Follow on X</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Follow @tonixglobal on X (formerly Twitter) for the latest updates and announcements. Click to open link.
                    </p>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Twitter className="w-4 h-4" />
                      <span className="text-sm font-medium">+5 TONIX</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSpecialTask('followX', 'https://twitter.com/tonixglobal')}
                  className={
                    specialTasksCompleted.followX 
                      ? "bg-green-500 text-white ml-4 cursor-default" 
                      : specialTasksOpened.followX 
                        ? "bg-orange-500 hover:bg-orange-600 text-white ml-4"
                        : "bg-blue-500 hover:bg-blue-600 text-white ml-4"
                  }
                  disabled={specialTasksCompleted.followX}
                >
                  {specialTasksCompleted.followX ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    specialTasksOpened.followX ? 'Claim' : 'Open Link'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Join Telegram Channel Task */}
          <Card className="bg-card border border-border">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-6 h-6 text-green-500 mt-1">
                    <Gift className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Join Telegram Channel</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Join our official Telegram channel @tonixglobal for news and updates. Click to open link.
                    </p>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">+5 TONIX</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSpecialTask('joinChannel', 'https://t.me/tonixglobal')}
                  className={
                    specialTasksCompleted.joinChannel 
                      ? "bg-green-500 text-white ml-4 cursor-default" 
                      : specialTasksOpened.joinChannel 
                        ? "bg-orange-500 hover:bg-orange-600 text-white ml-4"
                        : "bg-blue-500 hover:bg-blue-600 text-white ml-4"
                  }
                  disabled={specialTasksCompleted.joinChannel}
                >
                  {specialTasksCompleted.joinChannel ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    specialTasksOpened.joinChannel ? 'Claim' : 'Open Link'
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Join Telegram Group Task */}
          <Card className="bg-card border border-border">
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-6 h-6 text-green-500 mt-1">
                    <Gift className="w-full h-full" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">Join Telegram Group</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Join our community Telegram group @tonixglobal_chat to chat with other users. Click to open link.
                    </p>
                    <div className="flex items-center gap-1 text-blue-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">+5 TONIX</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSpecialTask('joinGroup', 'https://t.me/tonixglobal_chat')}
                  className={
                    specialTasksCompleted.joinGroup 
                      ? "bg-green-500 text-white ml-4 cursor-default" 
                      : specialTasksOpened.joinGroup 
                        ? "bg-orange-500 hover:bg-orange-600 text-white ml-4"
                        : "bg-blue-500 hover:bg-blue-600 text-white ml-4"
                  }
                  disabled={specialTasksCompleted.joinGroup}
                >
                  {specialTasksCompleted.joinGroup ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    specialTasksOpened.joinGroup ? 'Claim' : 'Open Link'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}