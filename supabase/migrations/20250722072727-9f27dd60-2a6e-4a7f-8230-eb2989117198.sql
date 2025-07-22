-- Reset all user data: task completions, referrals, and profile stats
-- This will reset all users back to their initial state

-- Delete all task completions
DELETE FROM public.task_completions;

-- Delete all referrals  
DELETE FROM public.referrals;

-- Reset all profile data to default values
UPDATE public.profiles 
SET 
  tonix_balance = 0,
  farming_rate = 1.0,
  ready_to_collect = 0,
  daily_streak = 0,
  today_earnings = 0,
  last_check_in = NULL,
  last_collect = NULL,
  updated_at = now();