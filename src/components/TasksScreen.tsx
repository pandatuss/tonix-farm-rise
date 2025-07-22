import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Clock, Calendar, ExternalLink, Twitter, Users, Check } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
interface TasksScreenProps {
  onClaimDaily: () => void;
  onClaimWeekly: () => void;
  onCheckIn: () => void;
  onClaimSpecialTask: (points: number) => void;
}
export default function TasksScreen({
  onClaimDaily,
  onClaimWeekly,
  onCheckIn,
  onClaimSpecialTask
}: TasksScreenProps) {
  const {
    taskCompletions,
    completeTask
  } = useUser();
  const {
    toast
  } = useToast();
  const [dailyClaimedToday, setDailyClaimedToday] = useState(false);
  const [weeklyClaimedThisWeek, setWeeklyClaimedThisWeek] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDailyTimer, setShowDailyTimer] = useState(false);
  const [showWeeklyTimer, setShowWeeklyTimer] = useState(false);
  const [specialTasksOpened, setSpecialTasksOpened] = useState({
    followX: false,
    joinChannel: false,
    joinGroup: false
  });

  // Check if tasks are completed from database
  const isTaskCompleted = (taskType: string, taskId: string) => {
    return taskCompletions.some(completion => completion.task_type === taskType && completion.task_id === taskId);
  };

  // Helper functions to check specific task completions
  const isDailyBonusCompletedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return taskCompletions.some(completion => completion.task_type === 'daily' && completion.task_id === 'daily_bonus' && completion.completed_at.startsWith(today));
  };
  const isWeeklyBonusCompletedThisWeek = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return taskCompletions.some(completion => completion.task_type === 'weekly' && completion.task_id === 'weekly_bonus' && new Date(completion.completed_at) >= startOfWeek);
  };

  // Update states based on database data
  useEffect(() => {
    setDailyClaimedToday(isDailyBonusCompletedToday());
    setWeeklyClaimedThisWeek(isWeeklyBonusCompletedThisWeek());
    setShowDailyTimer(isDailyBonusCompletedToday());
    setShowWeeklyTimer(isWeeklyBonusCompletedThisWeek());
  }, [taskCompletions]);
  const timeUntilReset = () => {
    const now = new Date();
    // Convert to UTC+4 timezone
    const utc4Now = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const tomorrow = new Date(utc4Now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);

    // Convert back to local time for calculation
    const tomorrowLocal = new Date(tomorrow.getTime() - 4 * 60 * 60 * 1000);
    const diff = tomorrowLocal.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor(diff % (1000 * 60) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  const timeUntilWeeklyReset = () => {
    const now = new Date();
    // Convert to UTC+4 timezone for weekly reset
    const utc4Now = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const nextMonday = new Date(utc4Now);
    const daysUntilMonday = (1 + 7 - utc4Now.getUTCDay()) % 7;
    if (daysUntilMonday === 0 && utc4Now.getUTCHours() === 0 && utc4Now.getUTCMinutes() === 0) {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
    } else {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
    }
    nextMonday.setUTCHours(0, 0, 0, 0);

    // Convert back to local time for calculation
    const nextMondayLocal = new Date(nextMonday.getTime() - 4 * 60 * 60 * 1000);
    const diff = nextMondayLocal.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    const minutes = Math.floor(diff % (1000 * 60 * 60) / (1000 * 60));
    const seconds = Math.floor(diff % (1000 * 60) / 1000);
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    }
    return `${hours}h ${minutes}m ${seconds}s`;
  };
  const handleDailyClaim = async () => {
    if (!dailyClaimedToday) {
      try {
        await completeTask('daily', 'daily_bonus', 5);
        // Don't call onClaimDaily to avoid toast
        setDailyClaimedToday(true);
        setShowDailyTimer(true);
      } catch (error: any) {
        console.log("Daily bonus claim failed:", error);
        // If already claimed, update UI state to reflect this
        if (error.message?.includes('already completed today')) {
          setDailyClaimedToday(true);
          setShowDailyTimer(true);
        }
      }
    }
  };
  const handleWeeklyClaim = async () => {
    if (!weeklyClaimedThisWeek) {
      try {
        await completeTask('weekly', 'weekly_bonus', 25);
        // Don't call onClaimWeekly to avoid toast
        setWeeklyClaimedThisWeek(true);
        setShowWeeklyTimer(true);
      } catch (error: any) {
        console.log("Weekly bonus claim failed:", error);
        // If already claimed, update UI state to reflect this
        if (error.message?.includes('already completed this week')) {
          setWeeklyClaimedThisWeek(true);
          setShowWeeklyTimer(true);
        }
      }
    }
  };

  // Update timer every second and check for automatic resets based on UTC+4
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Check if it's time to reset daily bonus (UTC+4 timezone)
      const utc4Now = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      const tomorrow = new Date(utc4Now);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
      tomorrow.setUTCHours(0, 0, 0, 0);
      const tomorrowLocal = new Date(tomorrow.getTime() - 4 * 60 * 60 * 1000);
      const timeUntilTomorrow = tomorrowLocal.getTime() - now.getTime();
      if (timeUntilTomorrow <= 1000 && dailyClaimedToday) {
        setDailyClaimedToday(false);
        setShowDailyTimer(false);
      }

      // Check if it's time to reset weekly bonus (UTC+4 timezone)
      const nextMonday = new Date(utc4Now);
      const daysUntilMonday = (1 + 7 - utc4Now.getUTCDay()) % 7;
      if (daysUntilMonday === 0 && utc4Now.getUTCHours() === 0 && utc4Now.getUTCMinutes() === 0) {
        nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
      } else {
        nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
      }
      nextMonday.setUTCHours(0, 0, 0, 0);
      const nextMondayLocal = new Date(nextMonday.getTime() - 4 * 60 * 60 * 1000);
      const timeUntilNextWeek = nextMondayLocal.getTime() - now.getTime();
      if (timeUntilNextWeek <= 1000 && weeklyClaimedThisWeek) {
        setWeeklyClaimedThisWeek(false);
        setShowWeeklyTimer(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [dailyClaimedToday, weeklyClaimedThisWeek]);
  const handleSpecialTask = async (taskType: 'followX' | 'joinChannel' | 'joinGroup', url: string) => {
    const taskId = taskType === 'followX' ? 'follow_x' : taskType === 'joinChannel' ? 'join_channel' : 'join_group';
    const isCompleted = isTaskCompleted('special', taskId);
    if (!specialTasksOpened[taskType] && !isCompleted) {
      // First click: open link and change button to "Claim"
      window.open(url, '_blank');
      setSpecialTasksOpened(prev => ({
        ...prev,
        [taskType]: true
      }));
    } else if (specialTasksOpened[taskType] && !isCompleted) {
      // Second click: claim reward and show success notification
      try {
        await completeTask('special', taskId, 5);
        // Don't call onClaimSpecialTask to avoid duplicate toast

        toast({
          title: "Task Completed!",
          description: "+5 TONIX earned successfully",
          className: "mt-16",
          duration: 2000
        });
      } catch (error: any) {
        console.log("Task completion failed:", error);
      }
    }
  };
  return <div className="p-4 mt-24 h-[calc(100vh-6rem)] overflow-y-hidden">{/* Fixed height minus top margin, no vertical scroll */}
      <Tabs defaultValue="daily" className="w-full h-full flex flex-col">{/* Use full height and flex layout */}
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
                  <p className="text-sm text-muted-foreground">Claim everyday UTC+4</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-400">5</div>
                <div className="text-sm text-muted-foreground">TONIX</div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/20 border-t border-border">
              {showDailyTimer && <div className="text-center mb-3">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Next claim in:</div>
                  <div className="text-lg font-mono text-blue-400">{timeUntilReset()}</div>
                </div>}
              <Button onClick={handleDailyClaim} disabled={dailyClaimedToday} className={dailyClaimedToday ? "w-full bg-gray-500 text-white cursor-not-allowed" : "w-full bg-blue-500 hover:bg-blue-600 text-white"}>
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
                  <p className="text-sm text-muted-foreground">Claim every Monday </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-400">25</div>
                <div className="text-sm text-muted-foreground">TONIX</div>
              </div>
            </div>
            
            <div className="p-4 bg-muted/20 border-t border-border">
              {showWeeklyTimer && <div className="text-center mb-3">
                  <Clock className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Next claim in:</div>
                  <div className="text-lg font-mono text-purple-400">{timeUntilWeeklyReset()}</div>
                </div>}
              <Button onClick={handleWeeklyClaim} disabled={weeklyClaimedThisWeek} className={weeklyClaimedThisWeek ? "w-full bg-gray-500 text-white cursor-not-allowed" : "w-full bg-purple-500 hover:bg-purple-600 text-white"}>
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
                <Button onClick={() => handleSpecialTask('followX', 'https://twitter.com/tonixglobal')} className={isTaskCompleted('special', 'follow_x') ? "bg-green-500 text-white ml-4 cursor-default" : specialTasksOpened.followX ? "bg-orange-500 hover:bg-orange-600 text-white ml-4" : "bg-blue-500 hover:bg-blue-600 text-white ml-4"} disabled={isTaskCompleted('special', 'follow_x')}>
                  {isTaskCompleted('special', 'follow_x') ? <Check className="w-4 h-4" /> : specialTasksOpened.followX ? 'Claim' : 'Open Link'}
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
                <Button onClick={() => handleSpecialTask('joinChannel', 'https://t.me/tonixglobal')} className={isTaskCompleted('special', 'join_channel') ? "bg-green-500 text-white ml-4 cursor-default" : specialTasksOpened.joinChannel ? "bg-orange-500 hover:bg-orange-600 text-white ml-4" : "bg-blue-500 hover:bg-blue-600 text-white ml-4"} disabled={isTaskCompleted('special', 'join_channel')}>
                  {isTaskCompleted('special', 'join_channel') ? <Check className="w-4 h-4" /> : specialTasksOpened.joinChannel ? 'Claim' : 'Open Link'}
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
                <Button onClick={() => handleSpecialTask('joinGroup', 'https://t.me/tonixglobal_chat')} className={isTaskCompleted('special', 'join_group') ? "bg-green-500 text-white ml-4 cursor-default" : specialTasksOpened.joinGroup ? "bg-orange-500 hover:bg-orange-600 text-white ml-4" : "bg-blue-500 hover:bg-blue-600 text-white ml-4"} disabled={isTaskCompleted('special', 'join_group')}>
                  {isTaskCompleted('special', 'join_group') ? <Check className="w-4 h-4" /> : specialTasksOpened.joinGroup ? 'Claim' : 'Open Link'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
}