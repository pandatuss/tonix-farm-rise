import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CompleteTaskRequest {
  userId: string;
  taskType: string;
  taskId: string;
  rewardAmount: number;
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

    const { userId, taskType, taskId, rewardAmount } = await req.json() as CompleteTaskRequest

    console.log('Completing task for user:', userId, 'Task:', taskType, taskId)

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

    // Check if task already completed
    const { data: existingCompletion } = await supabase
      .from('task_completions')
      .select('id')
      .eq('user_id', profile.id)
      .eq('task_type', taskType)
      .eq('task_id', taskId)
      .single()

    // For daily tasks, check if completed today
    if (taskType === 'daily' && existingCompletion) {
      const today = new Date().toISOString().split('T')[0]
      const { data: todayCompletion } = await supabase
        .from('task_completions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('task_type', taskType)
        .eq('task_id', taskId)
        .gte('completed_at', today + 'T00:00:00Z')
        .single()

      if (todayCompletion) {
        return new Response(
          JSON.stringify({ error: 'Task already completed today' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // For weekly tasks, check if completed this week
    if (taskType === 'weekly' && existingCompletion) {
      const now = new Date()
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())
      startOfWeek.setHours(0, 0, 0, 0)

      const { data: weekCompletion } = await supabase
        .from('task_completions')
        .select('id')
        .eq('user_id', profile.id)
        .eq('task_type', taskType)
        .eq('task_id', taskId)
        .gte('completed_at', startOfWeek.toISOString())
        .single()

      if (weekCompletion) {
        return new Response(
          JSON.stringify({ error: 'Task already completed this week' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // For special tasks, check if ever completed
    if (taskType === 'special' && existingCompletion) {
      return new Response(
        JSON.stringify({ error: 'Task already completed' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create task completion record
    const { error: completionError } = await supabase
      .from('task_completions')
      .insert({
        user_id: profile.id,
        task_type: taskType,
        task_id: taskId,
        reward_amount: rewardAmount
      })

    if (completionError) {
      console.error('Failed to create task completion:', completionError)
      return new Response(
        JSON.stringify({ error: 'Failed to complete task' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Update user balance
    const newBalance = profile.tonix_balance + rewardAmount
    const newTodayEarnings = profile.today_earnings + rewardAmount

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        tonix_balance: newBalance,
        today_earnings: newTodayEarnings,
        updated_at: new Date().toISOString()
      })
      .eq('telegram_id', userId)

    if (updateError) {
      console.error('Failed to update balance:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to update balance' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Task completed successfully:', taskType, taskId, 'Reward:', rewardAmount)

    return new Response(
      JSON.stringify({ 
        success: true,
        rewardAmount,
        newBalance,
        newTodayEarnings
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Complete task error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})