# Resend Email Configuration Guide

## Overview
The enhanced enrollment workflow now uses Resend API for sending professional emails instead of Supabase's built-in email service.

## Why Resend?
- ✅ Professional email delivery
- ✅ Better deliverability rates
- ✅ Custom domain support
- ✅ Email analytics & tracking
- ✅ HTML email templates
- ✅ No daily sending limits (on paid plans)

## Setup Instructions

### 1. Get Resend API Key
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy the API key (starts with `re_`)

### 2. Configure Supabase Edge Functions
1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **Settings**
3. Add the following environment variables:

```
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=Core Connect Academy <noreply@yourdomain.com>
```

**Note:** 
- For testing, you can use `onboarding@resend.dev` as the FROM address
- For production, verify your own domain in Resend and use your domain email

### 3. Verify Domain (Production Only)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `coreconnectacademy.com`)
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually 5-10 minutes)
6. Update `EMAIL_FROM` to use your domain: `noreply@coreconnectacademy.com`

### 4. Test Email Sending
After configuration, test by:
1. Submitting a student application
2. Check the student's email inbox
3. Verify the confirmation email arrives

## Email Templates

The system uses 3 email templates stored in the database:

### 1. `application_submitted`
**Sent:** When student submits application
**Variables:** student_name, application_id, program_name

### 2. `application_approved`
**Sent:** When admin approves application
**Variables:** student_name, courses, payment_amount, payment_methods

### 3. `password_setup`
**Sent:** After approval (via invite-student function)
**Variables:** student_name, password_setup_link, username

## Email Design

All emails include:
- Professional header with gradient background
- Branded "Core Connect Academy" logo text
- Clean, readable body content
- Responsive HTML design
- Footer with copyright and recipient email

## Resend Dashboard Features

Once configured, you can:
- View all sent emails
- Track email opens and clicks
- Monitor delivery status
- Check bounce rates
- View email logs

## Pricing

**Free Tier:**
- 100 emails/day
- 3,000 emails/month
- Perfect for testing and small deployments

**Pro Tier ($20/month):**
- 50,000 emails/month
- Custom domains
- Email analytics
- Priority support

## Troubleshooting

### Email not sending?
1. Check `RESEND_API_KEY` is set correctly in Supabase Edge Functions
2. Verify API key is active in Resend dashboard
3. Check Edge Function logs in Supabase for errors

### Email going to spam?
1. Verify your domain in Resend
2. Add SPF, DKIM, and DMARC records
3. Use a professional FROM address (not @gmail.com)

### Rate limit errors?
1. Check your Resend plan limits
2. Upgrade to Pro if needed
3. Implement email queuing for bulk sends

## Environment Variables Summary

Required in Supabase Edge Functions:
```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM=Core Connect Academy <noreply@yourdomain.com>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Next Steps

1. ✅ Get Resend API key
2. ✅ Add environment variables to Supabase
3. ✅ Test email sending
4. ⏳ (Optional) Verify custom domain
5. ⏳ (Optional) Customize email templates

---

**Ready to send professional emails!** 📧


re_4HtvgtsS_KrksfiQGGygrZdT5r11dpkwd