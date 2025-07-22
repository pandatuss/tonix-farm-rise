import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubmitReferralRequest {
  userId: string;
  referralCode: string;
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

    const { userId, referralCode } = await req.json() as SubmitReferralRequest

    console.log('Processing referral for user:', userId, 'Referral code:', referralCode)

    // Validate referral code (should be a Telegram ID)
    const referredTelegramId = parseInt(referralCode.trim())
    
    if (isNaN(referredTelegramId)) {
      return new Response(
        JSON.stringify({ error: 'Invalid referral code' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user is trying to refer themselves
    if (referredTelegramId === parseInt(userId)) {
      return new Response(
        JSON.stringify({ error: 'Cannot refer yourself' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user profile
    const { data: userProfile, error: userProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', userId)
      .single()

    if (userProfileError || !userProfile) {
      console.error('User profile not found:', userProfileError)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get referrer profile
    const { data: referrerProfile, error: referrerProfileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('telegram_id', referredTelegramId.toString())
      .single()

    if (referrerProfileError || !referrerProfile) {
      console.error('Referrer profile not found:', referrerProfileError)
      return new Response(
        JSON.stringify({ error: 'Referrer not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check if user has already been referred
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', userProfile.id)
      .single()

    if (existingReferral) {
      return new Response(
        JSON.stringify({ error: 'User already has a referrer' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create referral record
    const { error: referralError } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerProfile.id,
        referred_id: userProfile.id
      })

    if (referralError) {
      console.error('Failed to create referral:', referralError)
      return new Response(
        JSON.stringify({ error: 'Failed to process referral' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Award 5 TONIX bonus to both users
    const bonusAmount = 5

    // Update user balance
    const { error: userUpdateError } = await supabase
      .from('profiles')
      .update({ 
        tonix_balance: userProfile.tonix_balance + bonusAmount,
        today_earnings: userProfile.today_earnings + bonusAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', userProfile.id)

    if (userUpdateError) {
      console.error('Failed to update user balance:', userUpdateError)
    }

    // Update referrer balance
    const { error: referrerUpdateError } = await supabase
      .from('profiles')
      .update({ 
        tonix_balance: referrerProfile.tonix_balance + bonusAmount,
        today_earnings: referrerProfile.today_earnings + bonusAmount,
        updated_at: new Date().toISOString()
      })
      .eq('id', referrerProfile.id)

    if (referrerUpdateError) {
      console.error('Failed to update referrer balance:', referrerUpdateError)
    }

    console.log('Referral processed successfully. Both users awarded 5 TONIX.')

    return new Response(
      JSON.stringify({ 
        success: true,
        bonusAmount,
        newUserBalance: userProfile.tonix_balance + bonusAmount,
        referrerName: referrerProfile.first_name || 'User'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Submit referral error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})