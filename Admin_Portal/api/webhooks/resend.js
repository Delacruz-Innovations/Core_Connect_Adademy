// Resend Webhook Handler for Supabase Notifications
// This serverless function receives webhook calls from Supabase and sends emails via Resend

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Email template configurations
const EMAIL_TEMPLATES = {
    'admin-new-lead': {
        subject: '🎯 New Lead Registration',
        getHtml: (data) => `
            <h1>New Lead Captured</h1>
            <p>A new visitor has registered interest in Core Connect Academy.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>Name:</strong> ${data.metadata.full_name || 'N/A'}</li>
                <li><strong>Email:</strong> ${data.metadata.email || 'N/A'}</li>
                <li><strong>Time:</strong> ${new Date(data.created_at).toLocaleString()}</li>
            </ul>
            <p>View full details in your admin dashboard.</p>
        `
    },
    'visitor-welcome': {
        subject: 'Thank you for your interest in Core Connect Academy',
        getHtml: (data) => `
            <h1>Welcome to Core Connect Academy!</h1>
            <p>Thank you for registering your interest with us.</p>
            <p>Our admissions team has received your application and will review it shortly. You will be notified via email once your application has been processed.</p>
            <p>If you have any questions, please don't hesitate to contact us.</p>
            <p>Best regards,<br>The Core Connect Academy Team</p>
        `
    },
    'student-app-approved': {
        subject: '🎉 Your Application Has Been Approved!',
        getHtml: (data) => `
            <h1>Congratulations!</h1>
            <p>We're excited to inform you that your application to Core Connect Academy has been approved!</p>
            <p>You will receive a separate email with instructions on how to set up your password and access your student portal.</p>
            <p>Welcome to the Core Connect family!</p>
            <p>Best regards,<br>The Core Connect Academy Team</p>
        `
    },
    'admin-password-set': {
        subject: '✅ Student Account Activated',
        getHtml: (data) => `
            <h1>New Account Activated</h1>
            <p>A student has successfully set their password and activated their account.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>Email:</strong> ${data.metadata.student_email || 'N/A'}</li>
                <li><strong>Time:</strong> ${new Date(data.created_at).toLocaleString()}</li>
            </ul>
        `
    },
    'student-course-completed': {
        subject: '🎉 Congratulations on Completing Your Course!',
        getHtml: (data) => `
            <h1>Course Completed!</h1>
            <p>Congratulations on successfully completing your course at Core Connect Academy!</p>
            <p>This is a significant achievement and we're proud of your dedication and hard work.</p>
            <p>You can continue to access your course materials and resources through your student dashboard.</p>
            <p>Best regards,<br>The Core Connect Academy Team</p>
        `
    },
    'admin-course-completed': {
        subject: '🎓 Student Course Completion',
        getHtml: (data) => `
            <h1>Student Course Completion</h1>
            <p>A student has successfully completed their course.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>Student ID:</strong> ${data.metadata.student_id || 'N/A'}</li>
                <li><strong>Course ID:</strong> ${data.metadata.course_id || 'N/A'}</li>
                <li><strong>Completed:</strong> ${new Date(data.created_at).toLocaleString()}</li>
            </ul>
        `
    },
    'admin-new-submission': {
        subject: '📝 New Assignment Submission',
        getHtml: (data) => `
            <h1>New Assignment Submission</h1>
            <p>A student has submitted an assignment for review.</p>
            <h3>Details:</h3>
            <ul>
                <li><strong>Assignment ID:</strong> ${data.metadata.assignment_id || 'N/A'}</li>
                <li><strong>Student ID:</strong> ${data.metadata.student_id || 'N/A'}</li>
                <li><strong>Submitted:</strong> ${new Date(data.created_at).toLocaleString()}</li>
            </ul>
            <p>Review the submission in your admin portal.</p>
        `
    },
    'student-grade-posted': {
        subject: '📊 Your Assignment Has Been Graded',
        getHtml: (data) => `
            <h1>Assignment Graded</h1>
            <p>Your assignment submission has been reviewed and graded.</p>
            ${data.metadata.grade_score ? `<p><strong>Score:</strong> ${data.metadata.grade_score}</p>` : ''}
            <p>View the full feedback in your student dashboard.</p>
            <p>Keep up the great work!</p>
            <p>Best regards,<br>The Core Connect Academy Team</p>
        `
    },
    'student-qa-answered': {
        subject: '💬 Your Question Has Been Answered',
        getHtml: (data) => `
            <h1>Question Answered</h1>
            <p>An instructor has responded to your question.</p>
            <p>View the response in your student dashboard.</p>
            <p>Best regards,<br>The Core Connect Academy Team</p>
        `
    }
};

// Verify webhook signature
function verifySignature(payload, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

// Main handler
export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Verify webhook signature
        const signature = req.headers['x-supabase-signature'];
        const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;

        if (!webhookSecret) {
            console.error('SUPABASE_WEBHOOK_SECRET not configured');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        if (!signature || !verifySignature(req.body, signature, webhookSecret)) {
            console.error('Invalid webhook signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }

        const {
            notification_id,
            recipient_email,
            title,
            message,
            metadata
        } = req.body;

        // Skip if no template specified (dashboard-only notification)
        if (!metadata || !metadata.template) {
            return res.status(200).json({
                success: true,
                message: 'Notification is dashboard-only, no email sent'
            });
        }

        const template = EMAIL_TEMPLATES[metadata.template];

        if (!template) {
            console.error(`Unknown template: ${metadata.template}`);
            return res.status(400).json({ error: 'Unknown email template' });
        }

        // Send email via Resend
        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            console.error('RESEND_API_KEY not configured');
            return res.status(500).json({ error: 'Email service not configured' });
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || 'noreply@coreconnect.academy',
                to: recipient_email,
                subject: template.subject,
                html: template.getHtml(req.body)
            })
        });

        if (!emailResponse.ok) {
            const errorData = await emailResponse.json();
            console.error('Resend API error:', errorData);
            return res.status(500).json({
                error: 'Failed to send email',
                details: errorData
            });
        }

        const emailData = await emailResponse.json();

        // Log the email send to Supabase audit logs
        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        await supabase.from('audit_logs').insert({
            actor_id: null,
            actor_role: 'system',
            action: 'email_sent',
            entity_type: 'notification',
            entity_id: notification_id,
            metadata: {
                email_id: emailData.id,
                recipient: recipient_email,
                template: metadata.template
            }
        });

        return res.status(200).json({
            success: true,
            email_id: emailData.id,
            message: 'Email sent successfully'
        });

    } catch (error) {
        console.error('Webhook handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
