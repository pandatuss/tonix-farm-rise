-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_id BIGINT NOT NULL UNIQUE,
  telegram_username TEXT,
  first_name TEXT,
  last_name TEXT,
  tonix_balance DECIMAL(20,3) NOT NULL DEFAULT 0,
  farming_rate DECIMAL(10,3) NOT NULL DEFAULT 10.0,
  ready_to_collect DECIMAL(20,3) NOT NULL DEFAULT 0,
  daily_streak INTEGER NOT NULL DEFAULT 0,
  today_earnings DECIMAL(20,3) NOT NULL DEFAULT 0,
  last_check_in DATE,
  last_collect TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task completions table
CREATE TABLE public.task_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL, -- 'daily', 'weekly', 'special'
  task_id TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_amount DECIMAL(20,3),
  UNIQUE(user_id, task_type, task_id)
);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT);

-- Create policies for task completions
CREATE POLICY "Users can view their own task completions" 
ON public.task_completions 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT));

CREATE POLICY "Users can insert their own task completions" 
ON public.task_completions 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT));

-- Create policies for referrals
CREATE POLICY "Users can view referrals they're involved in" 
ON public.referrals 
FOR SELECT 
USING (
  referrer_id IN (SELECT id FROM public.profiles WHERE telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT) OR
  referred_id IN (SELECT id FROM public.profiles WHERE telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT)
);

CREATE POLICY "Users can create referrals" 
ON public.referrals 
FOR INSERT 
WITH CHECK (
  referrer_id IN (SELECT id FROM public.profiles WHERE telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT) OR
  referred_id IN (SELECT id FROM public.profiles WHERE telegram_id = (current_setting('app.current_telegram_id', true))::BIGINT)
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_telegram_id ON public.profiles(telegram_id);
CREATE INDEX idx_task_completions_user_id ON public.task_completions(user_id);
CREATE INDEX idx_task_completions_type_id ON public.task_completions(task_type, task_id);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred ON public.referrals(referred_id);