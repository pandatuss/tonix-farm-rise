import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailyCheckinRequest {
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

    const { userId } = await req.json() as DailyCheckinRequest

    console.log('Processing daily check-in for user:', userId)

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

    const today = new Date().toISOString().split('T')[0]
    
    // Check if already checked in today
    if (profile.last_check_in === today) {
      return new Response(
        JSON.stringify({ error: 'Already checked in today' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Calculate new streak
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split('T')[0]
    
    let newStreak = 1
    if (profile.last_check_in === yesterdayString) {
      // Consecutive day - increment streak
      newStreak = profile.daily_streak + 1
    } else if (profile.last_check_in && profile.last_check_in !== today) {
      // Missed days - reset streak
      newStreak = 1
    }

    // Update profile with new streak and check-in date
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        daily_streak: newStreak,
        last_check_in: today,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', userId)

    if (updateError) {
      console.error('Failed to update check-in:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to process check-in' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Daily check-in processed successfully. New streak:', newStreak)

    return new Response(
      JSON.stringify({ 
        success: true,
        newStreak,
        checkInDate: today
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Daily check-in error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})