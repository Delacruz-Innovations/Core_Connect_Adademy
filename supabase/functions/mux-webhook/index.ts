import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { type, data } = body

    console.log(`Received Mux Webhook: ${type}`)

    if (type === 'video.asset.ready') {
      const muxAssetId = data.id
      const playbackId = data.playback_ids?.[0]?.id
      const lessonId = data.passthrough // We stored lesson_id here

      if (!lessonId || !playbackId) {
        console.error('Missing data in webhook:', { lessonId, playbackId })
        return new Response('Missing data', { status: 400 })
      }

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      const { error: updateError } = await supabaseClient
        .from('lessons')
        .update({ mux_playback_id: playbackId })
        .eq('id', lessonId)

      if (updateError) {
        throw updateError
      }

      console.log(`Updated lesson ${lessonId} with playback_id ${playbackId}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Webhook Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
