import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FarmingRequest {
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

    const { userId } = await req.json() as FarmingRequest

    console.log('Calculating accumulated farming for user:', userId)

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
    const farmingRate = profile.farming_rate || 1.0
    
    // Calculate accumulated TONIX since last collection
    let lastCollectTime = profile.last_collect ? new Date(profile.last_collect) : new Date(profile.created_at)
    
    // If user has never collected, start from profile creation
    if (!profile.last_collect) {
      lastCollectTime = new Date(profile.created_at)
    }
    
    // Calculate time difference in hours
    const timeDiffHours = (now.getTime() - lastCollectTime.getTime()) / (1000 * 60 * 60)
    
    // Calculate total accumulated TONIX (max 48 hours worth = 2x farming rate * 24)
    const maxAccumulationHours = 48 // 2 days max accumulation
    const cappedHours = Math.min(timeDiffHours, maxAccumulationHours)
    const totalAccumulated = cappedHours * farmingRate
    
    console.log(`Time since last collect: ${timeDiffHours.toFixed(2)} hours`)
    console.log(`Capped accumulation hours: ${cappedHours.toFixed(2)}`)
    console.log(`Total accumulated: ${totalAccumulated.toFixed(3)} TONIX`)
    
    // Update the ready_to_collect amount in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        ready_to_collect: totalAccumulated,
        updated_at: now.toISOString()
      })
      .eq('telegram_id', userId)

    if (updateError) {
      console.error('Failed to update ready_to_collect:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update farming data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Farming accumulation calculated successfully:', totalAccumulated)

    return new Response(
      JSON.stringify({ 
        readyToCollect: totalAccumulated,
        maxAccumulation: maxAccumulationHours * farmingRate,
        farmingRate,
        lastCollect: lastCollectTime.toISOString(),
        timeSinceLastCollect: timeDiffHours
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Farming accumulator error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})