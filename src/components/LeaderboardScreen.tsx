import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

import { useTelegram } from '@/hooks/useTelegram';
import { useUser } from '@/hooks/useUser';

interface LeaderboardEntry {
  rank: number;
  username: string;
  first_name: string;
  totalTonix: number;
  telegramId: number;
  photoUrl?: string;
}

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState("all-time");
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: telegramUser } = useTelegram();
  const { profile } = useUser();

  // Fetch leaderboard data - placeholder for server-side implementation
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setIsLoading(true);
        // TODO: Create leaderboard server function for better performance
        // For now, showing placeholder data
        setLeaderboardData([]);
        setUserRank(null);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [telegramUser?.id]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      const colors = {
        1: "bg-yellow-500/20 text-yellow-500",
        2: "bg-gray-400/20 text-gray-400", 
        3: "bg-amber-600/20 text-amber-600"
      };
      return colors[rank as keyof typeof colors];
    }
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="p-6 space-y-6 mt-24">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Compete with farmers worldwide</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-tonix-surface">
          <TabsTrigger value="all-time" className="data-[state=active]:bg-tonix-primary data-[state=active]:text-primary-foreground">
            All Time
          </TabsTrigger>
          <TabsTrigger value="this-week" className="data-[state=active]:bg-tonix-primary data-[state=active]:text-primary-foreground">
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-time" className="space-y-4 mt-6">
          {isLoading ? (
            <Card className="tonix-card p-6 text-center">
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </Card>
          ) : leaderboardData.length === 0 ? (
            <Card className="tonix-card p-6 text-center">
              <p className="text-muted-foreground">No leaderboard data available</p>
            </Card>
          ) : (
            <>
              {/* Top 3 Podium */}
              {leaderboardData.length >= 3 && (
                <Card className="tonix-card p-6 mb-6">
                  <div className="flex items-end justify-center space-x-4 mb-6">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto overflow-hidden">
                        {leaderboardData[1].photoUrl ? (
                          <img 
                            src={leaderboardData[1].photoUrl} 
                            alt={leaderboardData[1].first_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Medal className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <p className="font-semibold text-sm">{leaderboardData[1].username}</p>
                      <p className="text-xs text-muted-foreground">{leaderboardData[1].totalTonix.toLocaleString()} TONIX</p>
                      <div className="h-16 bg-gray-400/20 rounded-t-lg mt-2 flex items-end justify-center">
                        <span className="text-lg font-bold text-gray-400 mb-2">2</span>
                      </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-2 mx-auto tonix-glow overflow-hidden">
                        {leaderboardData[0].photoUrl ? (
                          <img 
                            src={leaderboardData[0].photoUrl} 
                            alt={leaderboardData[0].first_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Crown className="w-10 h-10 text-primary-foreground" />
                        )}
                      </div>
                      <p className="font-bold">{leaderboardData[0].username}</p>
                      <p className="text-sm text-tonix-primary font-semibold">{leaderboardData[0].totalTonix.toLocaleString()} TONIX</p>
                      <div className="h-20 bg-gradient-primary rounded-t-lg mt-2 flex items-end justify-center">
                        <span className="text-xl font-bold text-primary-foreground mb-2">1</span>
                      </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-2 mx-auto overflow-hidden">
                        {leaderboardData[2].photoUrl ? (
                          <img 
                            src={leaderboardData[2].photoUrl} 
                            alt={leaderboardData[2].first_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Award className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <p className="font-semibold text-sm">{leaderboardData[2].username}</p>
                      <p className="text-xs text-muted-foreground">{leaderboardData[2].totalTonix.toLocaleString()} TONIX</p>
                      <div className="h-12 bg-amber-600/20 rounded-t-lg mt-2 flex items-end justify-center">
                        <span className="text-lg font-bold text-amber-600 mb-2">3</span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Full Rankings */}
              <div className="space-y-3">
                {leaderboardData.map((entry) => (
                  <Card key={entry.rank} className={`p-4 ${entry.rank <= 3 ? 'tonix-card border-2' : 'bg-tonix-surface'} ${entry.rank === 1 ? 'border-yellow-500/50' : entry.rank === 2 ? 'border-gray-400/50' : entry.rank === 3 ? 'border-amber-600/50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Badge className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${getRankBadge(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </Badge>
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-tonix-surface flex items-center justify-center">
                          {entry.photoUrl ? (
                            <img 
                              src={entry.photoUrl} 
                              alt={entry.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-bold">{entry.first_name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.totalTonix.toLocaleString()} TONIX
                          </p>
                        </div>
                      </div>
                      {entry.rank <= 3 && (
                        <Trophy className="w-5 h-5 text-tonix-primary" />
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}

          {/* User's Position */}
          {telegramUser && profile && (
            <Card className="tonix-card p-4 border-tonix-primary">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge className="w-8 h-8 rounded-full flex items-center justify-center p-0 bg-tonix-primary/20 text-tonix-primary">
                    {userRank || '?'}
                  </Badge>
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-tonix-surface flex items-center justify-center">
                    {telegramUser.photo_url ? (
                      <img 
                        src={telegramUser.photo_url} 
                        alt={telegramUser.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-bold">{telegramUser.first_name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-tonix-primary">You (@{telegramUser.username || telegramUser.first_name})</p>
                    <p className="text-sm text-muted-foreground">{profile.tonix_balance.toLocaleString()} TONIX</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="this-week" className="space-y-4 mt-6">
          <Card className="tonix-card p-6 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">Weekly Reset</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Rankings reset every Monday at 00:00 UTC
            </p>
            <p className="text-xs text-muted-foreground">
              Next reset in: 2 days 14 hours
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}