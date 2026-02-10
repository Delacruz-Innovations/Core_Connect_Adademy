import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { question, courseId, lessonId } = await req.json()
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get Course & Lesson Context
        const { data: course } = await supabaseClient
            .from('courses')
            .select('title, description')
            .eq('id', courseId)
            .single()

        const { data: moduleData } = await supabaseClient
            .from('modules')
            .select('title, description')
            .eq('course_id', courseId)

        // 2. Fetch Relevant Knowledge (Basic text match for now)
        const { data: knowledge } = await supabaseClient
            .from('ai_knowledge')
            .select('content')
            .limit(5)

        const context = `
      Course: ${course?.title || 'Unknown'}
      Description: ${course?.description || 'No description'}
      Modules: ${moduleData?.map(m => m.title).join(', ') || 'None'}
      General Knowledge: ${knowledge?.map(k => k.content).join('\n') || 'None'}
    `

        // 3. Call OpenAI
        const openAiKey = Deno.env.get('OPENAI_API_KEY')
        if (!openAiKey) {
            throw new Error('OPENAI_API_KEY not set')
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openAiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: `You are a helpful learning assistant for Core Connect Academy. Answer student questions based on the course context provided. Be professional, encouraging, and clear. Context: ${context}` },
                    { role: 'user', content: question }
                ],
            }),
        })

        const aiResult = await response.json()
        const answer = aiResult.choices[0].message.content

        // 4. Log Interaction
        const authHeader = req.headers.get('Authorization')
        const userClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader! } } }
        )
        const { data: { user } } = await userClient.auth.getUser()

        if (user) {
            await supabaseClient.from('ai_interactions').insert({
                user_id: user.id,
                prompt: question,
                response: answer,
                tokens_used: aiResult.usage?.total_tokens,
                context_metadata: { courseId, lessonId }
            })
        }

        return new Response(JSON.stringify({ answer }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
