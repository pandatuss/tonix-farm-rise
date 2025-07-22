import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetUserStatsRequest {
  userId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { userId } = await req.json() as GetUserStatsRequest

    console.log('Getting user stats for:', userId)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile not found:', profileError)
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get task completions
    const { data: taskCompletions, error: taskError } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', profile.id)

    if (taskError) {
      console.error('Failed to get task completions:', taskError)
    }

    // Get referrals (where this user is the referrer)
    const { data: referrals, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', profile.id)

    if (referralError) {
      console.error('Failed to get referrals:', referralError)
    }

    // Calculate farming data
    const now = new Date()
    const lastCollect = profile.last_collect ? new Date(profile.last_collect) : now
    const farmingRate = profile.farming_rate || 1.0
    
    // Calculate time difference in hours
    const timeDiffHours = (now.getTime() - lastCollect.getTime()) / (1000 * 60 * 60)
    
    // Calculate accumulated TONIX (max 2x farming rate)
    const maxAccumulation = farmingRate * 2
    const readyToCollect = Math.min(timeDiffHours * farmingRate, maxAccumulation)

    // Check daily check-in status
    const today = new Date().toISOString().split('T')[0]
    const hasCheckedInToday = profile.last_check_in === today

    // Calculate time until next reset (UTC+4 timezone)
    const utc4Now = new Date(now.getTime() + (4 * 60 * 60 * 1000))
    const tomorrow = new Date(utc4Now)
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
    tomorrow.setUTCHours(0, 0, 0, 0)
    const tomorrowLocal = new Date(tomorrow.getTime() - (4 * 60 * 60 * 1000))
    const timeUntilReset = Math.max(0, tomorrowLocal.getTime() - now.getTime())

    // Calculate time until weekly reset
    const nextMonday = new Date(utc4Now)
    const daysUntilMonday = (1 + 7 - utc4Now.getUTCDay()) % 7
    if (daysUntilMonday === 0 && utc4Now.getUTCHours() === 0 && utc4Now.getUTCMinutes() === 0) {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + 7)
    } else {
      nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday)
    }
    nextMonday.setUTCHours(0, 0, 0, 0)
    const nextMondayLocal = new Date(nextMonday.getTime() - (4 * 60 * 60 * 1000))
    const timeUntilWeeklyReset = Math.max(0, nextMondayLocal.getTime() - now.getTime())

    console.log('User stats retrieved successfully')

    return new Response(
      JSON.stringify({ 
        profile: {
          ...profile,
          readyToCollect
        },
        taskCompletions: taskCompletions || [],
        referrals: referrals || [],
        timers: {
          hasCheckedInToday,
          timeUntilReset,
          timeUntilWeeklyReset
        },
        farming: {
          readyToCollect,
          maxAccumulation,
          farmingRate,
          lastCollect: lastCollect.toISOString()
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Get user stats error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})