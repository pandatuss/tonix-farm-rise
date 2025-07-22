import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CollectTonixRequest {
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

    const { userId } = await req.json() as CollectTonixRequest

    console.log('Collecting TONIX for user:', userId)

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

    const now = new Date()
    const lastCollect = profile.last_collect ? new Date(profile.last_collect) : now
    const farmingRate = profile.farming_rate || 1.0
    
    // Calculate time difference in hours
    const timeDiffHours = (now.getTime() - lastCollect.getTime()) / (1000 * 60 * 60)
    
    // Calculate accumulated TONIX (max 2x farming rate)
    const maxAccumulation = farmingRate * 2
    const collectionAmount = Math.min(timeDiffHours * farmingRate, maxAccumulation)
    
    if (collectionAmount < 0.001) {
      return new Response(
        JSON.stringify({ error: 'Nothing to collect' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user balance and reset collection data
    const newBalance = profile.tonix_balance + collectionAmount
    const newTodayEarnings = profile.today_earnings + collectionAmount

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tonix_balance: newBalance,
        today_earnings: newTodayEarnings,
        ready_to_collect: 0,
        last_collect: now.toISOString(),
        updated_at: now.toISOString()
      })
      .eq('telegram_id', userId)

    if (updateError) {
      console.error('Failed to update profile:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to collect TONIX' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Process referral commission
    try {
      const { error: commissionError } = await supabase.functions.invoke('process-referral-commission', {
        body: { 
          userId: profile.id, 
          collectedAmount: collectionAmount 
        }
      })
      
      if (commissionError) {
        console.log('Commission processing failed:', commissionError)
      }
    } catch (commissionError) {
      console.log('Commission processing failed:', commissionError)
    }

    console.log('TONIX collected successfully:', collectionAmount)

    return new Response(
      JSON.stringify({ 
        collected: collectionAmount,
        newBalance,
        newTodayEarnings
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Collect TONIX error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})