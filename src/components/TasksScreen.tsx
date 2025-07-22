import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Clock, Calendar, ExternalLink, Twitter, Users } from 'lucide-react';

interface TasksScreenProps {
  onClaimDaily: () => void;
  onClaimWeekly: () => void;
  onCheckIn: () => void;
}

export default function TasksScreen({ onClaimDaily, onClaimWeekly, onCheckIn }: TasksScreenProps) {
  const [dailyClaimedToday, setDailyClaimedToday] = useState(false);
  const [weeklyClaimedThisWeek, setWeeklyClaimedThisWeek] = useState(false);
  const [specialTasksCompleted, setSpecialTasksCompleted] = useState({
    followX: false,
    joinChannel: false,
    joinGroup: false,
  });

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

  const handleSpecialTask = (taskType: 'followX' | 'joinChannel' | 'joinGroup', url: string) => {
    window.open(url, '_blank');
    // Mark as completed after opening the link
    setSpecialTasksCompleted(prev => ({
      ...prev,
      [taskType]: true
    }));
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
                <div className="text-xl font-bold text-blue-400">500</div>
                <div className="text-sm text-muted-foreground">POINTS</div>
              </div>
            </div>
            
            {!dailyClaimedToday ? (
              <div className="p-4 bg-muted/20 border-t border-border">
                <div className="text-center mb-3">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Next claim in:</div>
                  <div className="text-lg font-mono text-blue-400">{timeUntilReset()}</div>
                </div>
                <Button 
                  onClick={handleDailyClaim}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Claim Daily Bonus
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-muted/20 border-t border-border text-center">
                <div className="text-muted-foreground">Daily Bonus Claimed</div>
              </div>
            )}
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
                <div className="text-xl font-bold text-purple-400">2500</div>
                <div className="text-sm text-muted-foreground">POINTS</div>
              </div>
            </div>
            
            {!weeklyClaimedThisWeek ? (
              <div className="p-4 bg-muted/20 border-t border-border">
                <Button 
                  onClick={handleWeeklyClaim}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  Claim Weekly Bonus
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-muted/20 border-t border-border text-center">
                <div className="text-muted-foreground">Weekly Bonus Claimed</div>
              </div>
            )}
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
                      <span className="text-sm font-medium">+1,000 points</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSpecialTask('followX', 'https://twitter.com/tonixglobal')}
                  className="bg-blue-500 hover:bg-blue-600 text-white ml-4"
                  disabled={specialTasksCompleted.followX}
                >
                  {specialTasksCompleted.followX ? 'Completed' : 'Open Link'}
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
                      <span className="text-sm font-medium">+500 points</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSpecialTask('joinChannel', 'https://t.me/tonixglobal')}
                  className="bg-blue-500 hover:bg-blue-600 text-white ml-4"
                  disabled={specialTasksCompleted.joinChannel}
                >
                  {specialTasksCompleted.joinChannel ? 'Completed' : 'Open Link'}
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
                      <span className="text-sm font-medium">+500 points</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => handleSpecialTask('joinGroup', 'https://t.me/tonixglobal_chat')}
                  className="bg-blue-500 hover:bg-blue-600 text-white ml-4"
                  disabled={specialTasksCompleted.joinGroup}
                >
                  {specialTasksCompleted.joinGroup ? 'Completed' : 'Open Link'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}