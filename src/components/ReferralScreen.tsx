import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, Copy, Share, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegram } from '@/hooks/useTelegram';
import { useUser } from '@/hooks/useUser';

export default function ReferralScreen() {
  const [referralCode, setReferralCode] = useState('');
  const [hasSubmittedReferral, setHasSubmittedReferral] = useState(false);
  const { toast } = useToast();
  const { user: telegramUser } = useTelegram();
  const { profile, referrals, createReferral, updateProfile } = useUser();
  
  // Use Telegram ID as referral code
  const userReferralCode = telegramUser?.id?.toString() || 'Loading...';
  
  // Calculate referral stats from actual data
  const referralStats = {
    totalReferred: referrals.length,
    totalEarned: referrals.length * 5 // 5 TONIX per referral + commission earnings
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
      duration: 2000
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join TONIX Farm',
        text: `Join me on TONIX Farm and earn TONIX together! Use my referral code: ${userReferralCode}`,
        url: `https://t.me/tonixglobalbot?start=${userReferralCode}`
      });
    } else {
      navigator.clipboard.writeText(`https://t.me/tonixglobalbot?start=${userReferralCode}`);
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
        duration: 2000
      });
    }
  };

  const handleSubmitCode = async () => {
    if (referralCode.trim() && telegramUser?.id) {
      try {
        // Check if it's a valid Telegram ID and not their own
        const referredTelegramId = parseInt(referralCode.trim());
        
        if (isNaN(referredTelegramId)) {
          toast({
            title: "Invalid Code",
            description: "Please enter a valid referral code",
            variant: "destructive",
            className: "mt-[96px]",
            duration: 2000
          });
          return;
        }
        
        if (referredTelegramId === telegramUser.id) {
          toast({
            title: "Invalid Code",
            description: "You cannot refer yourself",
            variant: "destructive",
            className: "mt-[96px]",
            duration: 2000
          });
          return;
        }
        
        // Create referral and award bonuses
        await createReferral(referredTelegramId);
        
        // Award 5 TONIX bonus to the user
        const currentBalance = profile?.tonix_balance || 0;
        await updateProfile({
          tonix_balance: currentBalance + 5
        });
        
        toast({
          title: "🎉 Referral Success!",
          description: "You both received 5 TONIX bonus!",
          className: "mt-[96px]",
          duration: 2000
        });
        
        setReferralCode('');
        setHasSubmittedReferral(true);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to process referral code",
          variant: "destructive",
          className: "mt-[96px]",
          duration: 2000
        });
      }
    }
  };

  return (
    <div className="p-6 space-y-6 mt-24">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gradient mb-2">Invite Friends</h1>
        <p className="text-muted-foreground">Earn 5 TONIX per friend + 10% commission forever</p>
      </div>

      {/* Referral Stats */}
      <Card className="tonix-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="w-6 h-6 text-tonix-primary" />
          <h3 className="text-xl font-bold">Your Referral Stats</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-tonix-surface rounded-lg">
            <p className="text-2xl font-bold text-tonix-primary">{referralStats.totalReferred}</p>
            <p className="text-sm text-muted-foreground">Friends Referred</p>
          </div>
          <div className="text-center p-4 bg-tonix-surface rounded-lg">
            <p className="text-2xl font-bold text-tonix-success">{referralStats.totalEarned.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">TONIX Earned</p>
          </div>
        </div>
      </Card>

      {/* Your Referral Code */}
      <Card className="tonix-card p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Gift className="w-6 h-6 text-tonix-secondary" />
          <h3 className="text-xl font-bold">Your Referral Code</h3>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-tonix-surface rounded-lg border-2 border-dashed border-tonix-primary/50">
            <p className="text-center font-mono text-lg font-bold text-tonix-primary">
              {userReferralCode}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCopyCode}
              variant="outline"
              className="tonix-button border-tonix-primary text-tonix-primary hover:bg-tonix-primary hover:text-primary-foreground"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </Button>
            
            <Button
              onClick={handleShare}
              className="tonix-button bg-gradient-primary hover:opacity-90"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          </div>
        </div>
      </Card>

      {/* Enter Referral Code - Only show if user hasn't submitted a referral yet */}
      {!hasSubmittedReferral && (
        <Card className="tonix-card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-6 h-6 text-tonix-warning" />
            <h3 className="text-xl font-bold">Enter Friend's Code</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter a friend's referral code to get a one-time bonus for both of you!
            </p>
            
            <div className="flex space-x-2">
              <Input
                placeholder="Enter referral code..."
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-tonix-surface border-tonix-primary/30 focus:border-tonix-primary"
              />
              <Button
                onClick={handleSubmitCode}
                disabled={!referralCode.trim()}
                className="tonix-button bg-gradient-primary hover:opacity-90 disabled:opacity-50"
              >
                Submit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* How It Works */}
      <Card className="p-6 bg-tonix-surface border-dashed border-2 border-muted">
        <h4 className="font-semibold mb-3">How Referrals Work</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">1</Badge>
            <p>Share your Telegram ID as referral code with friends</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">2</Badge>
            <p>Both you and your friend get 5 TONIX bonus when they join</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0 text-xs">3</Badge>
            <p>You earn 10% commission on all TONIX they farm, forever!</p>
          </div>
        </div>
      </Card>
    </div>
  );
}