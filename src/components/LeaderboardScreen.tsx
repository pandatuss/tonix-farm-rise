import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Medal, Award, Crown } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  username: string;
  tonix: number;
  avatar?: string;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "CryptoKing", tonix: 125000 },
  { rank: 2, username: "TONMaster", tonix: 98500 },
  { rank: 3, username: "FarmPro", tonix: 87200 },
  { rank: 4, username: "CoinCollector", tonix: 76800 },
  { rank: 5, username: "DigitalFarmer", tonix: 65400 },
  { rank: 6, username: "BlockchainBoss", tonix: 58900 },
  { rank: 7, username: "TONExplorer", tonix: 52100 },
  { rank: 8, username: "CryptoMiner", tonix: 47300 },
];

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState("all-time");

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
          {/* Top 3 Podium */}
          <Card className="tonix-card p-6 mb-6">
            <div className="flex items-end justify-center space-x-4 mb-6">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Medal className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-sm">{mockLeaderboard[1].username}</p>
                <p className="text-xs text-muted-foreground">{mockLeaderboard[1].tonix.toLocaleString()} TONIX</p>
                <div className="h-16 bg-gray-400/20 rounded-t-lg mt-2 flex items-end justify-center">
                  <span className="text-lg font-bold text-gray-400 mb-2">2</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mb-2 mx-auto tonix-glow">
                  <Crown className="w-10 h-10 text-primary-foreground" />
                </div>
                <p className="font-bold">{mockLeaderboard[0].username}</p>
                <p className="text-sm text-tonix-primary font-semibold">{mockLeaderboard[0].tonix.toLocaleString()} TONIX</p>
                <div className="h-20 bg-gradient-primary rounded-t-lg mt-2 flex items-end justify-center">
                  <span className="text-xl font-bold text-primary-foreground mb-2">1</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-sm">{mockLeaderboard[2].username}</p>
                <p className="text-xs text-muted-foreground">{mockLeaderboard[2].tonix.toLocaleString()} TONIX</p>
                <div className="h-12 bg-amber-600/20 rounded-t-lg mt-2 flex items-end justify-center">
                  <span className="text-lg font-bold text-amber-600 mb-2">3</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Full Rankings */}
          <div className="space-y-3">
            {mockLeaderboard.map((entry) => (
              <Card key={entry.rank} className={`p-4 ${entry.rank <= 3 ? 'tonix-card border-2' : 'bg-tonix-surface'} ${entry.rank === 1 ? 'border-yellow-500/50' : entry.rank === 2 ? 'border-gray-400/50' : entry.rank === 3 ? 'border-amber-600/50' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge className={`w-8 h-8 rounded-full flex items-center justify-center p-0 ${getRankBadge(entry.rank)}`}>
                      {getRankIcon(entry.rank)}
                    </Badge>
                    <div>
                      <p className="font-semibold">{entry.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.tonix.toLocaleString()} TONIX
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

          {/* User's Position */}
          <Card className="tonix-card p-4 border-tonix-primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge className="w-8 h-8 rounded-full flex items-center justify-center p-0 bg-tonix-primary/20 text-tonix-primary">
                  1247
                </Badge>
                <div>
                  <p className="font-semibold text-tonix-primary">You (@username)</p>
                  <p className="text-sm text-muted-foreground">2,500 TONIX</p>
                </div>
              </div>
            </div>
          </Card>
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