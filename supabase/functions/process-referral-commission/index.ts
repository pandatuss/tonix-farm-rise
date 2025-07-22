import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface CommissionRequest {
  userId: string;
  collectedAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, collectedAmount }: CommissionRequest = await req.json();

    console.log('Processing commission for user:', userId, 'amount:', collectedAmount);

    // Find who referred this user
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .single();

    if (referralError) {
      console.log('No referral found for user:', userId);
      return new Response(JSON.stringify({ success: true, message: 'No referral found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!referral) {
      console.log('User was not referred by anyone');
      return new Response(JSON.stringify({ success: true, message: 'User not referred' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate 10% commission
    const commissionAmount = collectedAmount * 0.1;

    console.log('Awarding commission:', commissionAmount, 'to referrer:', referral.referrer_id);

    // Get referrer's current balance
    const { data: referrerProfile, error: profileError } = await supabase
      .from('profiles')
      .select('tonix_balance')
      .eq('id', referral.referrer_id)
      .single();

    if (profileError) {
      console.error('Error fetching referrer profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to fetch referrer profile' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Update referrer's balance with commission
    const newBalance = (referrerProfile.tonix_balance || 0) + commissionAmount;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tonix_balance: newBalance })
      .eq('id', referral.referrer_id);

    if (updateError) {
      console.error('Error updating referrer balance:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update referrer balance' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Commission processed successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      commissionAmount,
      referrerId: referral.referrer_id 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in process-referral-commission function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);