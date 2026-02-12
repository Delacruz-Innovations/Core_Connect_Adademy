import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MUX_API_BASE = 'https://api.mux.com/video/v1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { lesson_id, video_url } = await req.json()

    if (!lesson_id || !video_url) {
      throw new Error('lesson_id and video_url are required')
    }

    const muxTokenId = Deno.env.get('MUX_TOKEN_ID')
    const muxTokenSecret = Deno.env.get('MUX_TOKEN_SECRET')

    if (!muxTokenId || !muxTokenSecret) {
      throw new Error('MUX_TOKEN_ID or MUX_TOKEN_SECRET is not set')
    }

    // 1. Create Mux Asset
    const muxResponse = await fetch(`${MUX_API_BASE}/assets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${muxTokenId}:${muxTokenSecret}`)}`,
      },
      body: JSON.stringify({
        input: video_url,
        playback_policy: ['public'],
        // Pass lesson_id in passthrough so we can identify it in the webhook
        passthrough: lesson_id,
      }),
    })

    const muxData = await muxResponse.json()

    if (!muxResponse.ok) {
      console.error('Mux API Error:', muxData)
      throw new Error(`Mux API Error: ${muxData.error?.message || 'Unknown error'}`)
    }

    const muxAssetId = muxData.data.id

    // 2. Update Lesson with mux_asset_id
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseClient
      .from('lessons')
      .update({ mux_asset_id: muxAssetId })
      .eq('id', lesson_id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, mux_asset_id: muxAssetId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
