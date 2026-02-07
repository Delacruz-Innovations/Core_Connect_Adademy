import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders,
            status: 200
        })
    }

    try {
        // Create Supabase Client with Service Role Key
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Parse Request Body
        const { templateName, recipientEmail, recipientName, variables } = await req.json()

        if (!templateName || !recipientEmail) {
            throw new Error('Template name and recipient email are required')
        }

        // Fetch email template from database
        const { data: template, error: templateError } = await supabaseClient
            .from('email_templates')
            .select('*')
            .eq('name', templateName)
            .single()

        if (templateError || !template) {
            throw new Error(`Email template '${templateName}' not found`)
        }

        // Replace variables in subject and body
        let subject = template.subject
        let body = template.body

        if (variables) {
            Object.keys(variables).forEach(key => {
                const placeholder = `{{${key}}}`
                subject = subject.replace(new RegExp(placeholder, 'g'), variables[key])
                body = body.replace(new RegExp(placeholder, 'g'), variables[key])
            })
        }

        // Convert plain text body to HTML with basic formatting
        const htmlBody = body
            .split('\n\n')
            .map(paragraph => `<p style="margin-bottom: 16px;">${paragraph.replace(/\n/g, '<br>')}</p>`)
            .join('')

        // Send email using Resend API
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY environment variable is not set')
        }

        const resendResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: Deno.env.get('EMAIL_FROM') || 'Core Connect Academy <onboarding@resend.dev>',
                to: [recipientEmail],
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>${subject}</title>
                    </head>
                    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: bold;">Core Connect Academy</h1>
                        </div>
                        <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                            <div style="color: #374151; font-size: 16px;">
                                ${htmlBody}
                            </div>
                        </div>
                        <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
                            <p>© ${new Date().getFullYear()} Core Connect Academy. All rights reserved.</p>
                            <p>This email was sent to ${recipientEmail}</p>
                        </div>
                    </body>
                    </html>
                `
            })
        })

        const resendData = await resendResponse.json()

        if (!resendResponse.ok) {
            console.error('Resend API error:', resendData)
            throw new Error(resendData.message || 'Failed to send email via Resend')
        }

        console.log('Email sent successfully via Resend:', resendData.id)

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Email sent successfully',
                templateUsed: templateName,
                emailId: resendData.id
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Send email error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
