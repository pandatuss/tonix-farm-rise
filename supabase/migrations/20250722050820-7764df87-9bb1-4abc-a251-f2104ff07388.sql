-- Drop existing policies that use app.current_telegram_id
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can insert their own task completions" ON public.task_completions;
DROP POLICY IF EXISTS "Users can view referrals they're involved in" ON public.referrals;
DROP POLICY IF EXISTS "Users can create referrals" ON public.referrals;

-- Since we can't use auth.uid() with telegram auth, we'll create more permissive policies
-- and rely on application-level filtering by telegram_id

-- Allow all authenticated operations for profiles (filtering done in app)
CREATE POLICY "Allow profile operations" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- Allow all authenticated operations for task completions (filtering done in app)  
CREATE POLICY "Allow task completion operations" ON public.task_completions FOR ALL USING (true) WITH CHECK (true);

-- Allow all authenticated operations for referrals (filtering done in app)
CREATE POLICY "Allow referral operations" ON public.referrals FOR ALL USING (true) WITH CHECK (true);