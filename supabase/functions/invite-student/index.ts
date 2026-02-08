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
        // 1. Create Supabase Client with Service Role Key (Admin Access)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Parse Request Body
        const {
            applicationId,
            adminId,
            courses = [],
            paymentAmount,
            paymentMethod = 'pending',
            paymentStatus = 'pending',
            paymentNotes,
            adminNotes,
            skipDbUpdates = false
        } = await req.json()

        if (!applicationId) throw new Error('Application ID is required')

        // 3. Fetch Application Details
        const { data: appData, error: appError } = await supabaseClient
            .from('applications')
            .select('*')
            .eq('id', applicationId)
            .single()

        if (appError || !appData) throw new Error('Application not found')

        // 4. Create/Get User and Generate Invite Link
        const { data: authData, error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(
            appData.email,
            {
                data: {
                    full_name: appData.full_name,
                    username: appData.username
                },
                redirectTo: `${Deno.env.get('STUDENT_PORTAL_URL') || 'http://localhost:5174'}/set-password`
            }
        )

        if (authError) throw authError

        const userId = authData.user.id

        // 5. Generate a setup link for Resend
        const { data: linkData, error: linkError } = await supabaseClient.auth.admin.generateLink({
            type: 'invite',
            email: appData.email,
            options: {
                redirectTo: `${Deno.env.get('STUDENT_PORTAL_URL') || 'http://localhost:5174'}/set-password`
            }
        })

        if (linkError) throw linkError
        const setupLink = linkData.properties.action_link

        // 6. Create/Update Profile Record
        await supabaseClient
            .from('profiles')
            .upsert({
                id: userId,
                username: appData.username,
                full_name: appData.full_name,
                email: appData.email,
                role: 'student'
            })

        // 7. Conditional DB Updates (Skip if already handled by RPC/Trigger)
        if (!skipDbUpdates) {
            // Create Enrollment Record
            await supabaseClient
                .from('enrollments')
                .insert({
                    application_id: applicationId,
                    student_id: userId,
                    courses: courses,
                    payment_amount: paymentAmount,
                    payment_method: paymentMethod,
                    payment_status: paymentStatus,
                    payment_notes: paymentNotes,
                    admin_id: adminId,
                    admin_notes: adminNotes,
                    status: 'active'
                })

            // Update Application Status
            await supabaseClient
                .from('applications')
                .update({
                    status: 'approved',
                    approved_at: new Date().toISOString(),
                    admin_id: adminId
                })
                .eq('id', applicationId)

            // Create Audit Log
            await supabaseClient.from('audit_logs').insert({
                event_type: 'application_approved',
                user_id: userId,
                admin_id: adminId,
                entity_type: 'application',
                entity_id: applicationId,
                details: {
                    student_name: appData.full_name,
                    courses: courses,
                    payment_amount: paymentAmount
                }
            })

            // Create Notification
            await supabaseClient.from('notifications').insert({
                recipient_id: userId,
                title: 'Welcome to Core Connect!',
                message: `Your application has been approved for ${courses.length} courses.`,
                type: 'success',
                link: '/student/dashboard'
            })
        } else {
            // If skipDbUpdates is true, we still want to update the student_id in the enrollment record
            await supabaseClient
                .from('enrollments')
                .update({ student_id: userId })
                .eq('application_id', applicationId)
                .eq('status', 'active');
        }

        // 8. Send Emails via Resend (send-email function)
        const courseNames = courses.join(', ')

        // A. Send Approval Success Email
        await supabaseClient.functions.invoke('send-email', {
            body: {
                templateName: 'application_approved',
                recipientEmail: appData.email,
                recipientName: appData.full_name,
                variables: {
                    student_name: appData.full_name,
                    courses: courseNames || 'Assigned Courses',
                    payment_amount: paymentAmount?.toString() || '0',
                    payment_methods: 'Transfer, Cash, or Crypto'
                }
            }
        })

        // B. Send Password Setup Email
        await supabaseClient.functions.invoke('send-email', {
            body: {
                templateName: 'password_setup',
                recipientEmail: appData.email,
                recipientName: appData.full_name,
                variables: {
                    student_name: appData.full_name,
                    password_setup_link: setupLink,
                    username: appData.username
                }
            }
        })

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Onboarding process completed.',
                userId
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error: any) {
        console.error('Invite student error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
