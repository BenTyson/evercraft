# Resend Email Setup

This document explains how to set up Resend for transactional emails in Evercraft.

## What is Resend?

Resend is a modern email API designed for developers. It provides:

- Simple API for sending transactional emails
- Email templates and customization
- Delivery tracking and analytics
- Free tier with generous limits (3,000 emails/month)

## Features Implemented

✅ **Order Confirmation Emails** - Sent automatically when an order is placed
✅ **Order Status Update Emails** - Sent when order status changes (shipped, delivered, etc.)
✅ **Beautiful HTML Email Templates** - Professional, responsive email design
✅ **Graceful Degradation** - App works without email configured (emails are skipped)

## Setup Instructions

### 1. Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. In the Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Evercraft Production")
4. Select the appropriate permissions (usually "Sending access")
5. Copy the API key (it starts with `re_`)

### 3. Configure Domain (Recommended for Production)

For production, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `evercraft.com`)
4. Add the DNS records provided by Resend to your domain registrar
5. Wait for verification (usually a few minutes)

For development, you can skip this step and use Resend's sandbox mode.

### 4. Add Environment Variables

Add the following to your `.env` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL="Evercraft <noreply@yourdomain.com>"
```

**Important Notes:**

- Replace `re_your_api_key_here` with your actual Resend API key
- For development, you can use any email like `noreply@evercraft.com` (emails will still send but may go to spam)
- For production with a verified domain, use your verified email address

### 5. Restart Your Dev Server

After adding the environment variables, restart your development server:

```bash
npm run dev
```

## Email Templates

### Order Confirmation Email

Sent immediately after successful payment. Includes:

- Order number and total
- List of items ordered with quantities and prices
- Shipping address
- Environmental impact message (5% donation)
- Link to track order

### Order Status Update Email

Sent when sellers update order status. Includes:

- Current order status
- Order number
- Personalized message based on status
- Link to track order

### Email Status Messages

| Status     | Title            | Message                                   |
| ---------- | ---------------- | ----------------------------------------- |
| PROCESSING | Order Processing | Your order is being prepared for shipment |
| SHIPPED    | Order Shipped!   | Your order is on its way to you           |
| DELIVERED  | Order Delivered  | Your order has been delivered             |
| CANCELLED  | Order Cancelled  | Your order has been cancelled             |

## Testing Emails

### Development Testing

1. **Without Resend Configured:**
   - App will work normally
   - Email sending will be skipped with a console warning
   - Check server logs for: `Email service not configured - skipping...`

2. **With Resend Configured:**
   - Place a test order
   - Check your email inbox
   - Check Resend dashboard for delivery logs

### Test Order Flow

```bash
# 1. Create a test order
# 2. Check console for email logs
# 3. Check Resend dashboard > Logs
# 4. Check buyer's email inbox
```

## Email Customization

### Modifying Templates

Email templates are located in `/src/lib/email.ts`. To customize:

1. Open `src/lib/email.ts`
2. Find the `sendOrderConfirmationEmail` or `sendOrderStatusUpdateEmail` function
3. Modify the HTML template in the `html` variable
4. Restart your dev server

### Styling Guidelines

- Use inline CSS (email clients don't support external stylesheets)
- Use tables for layout (better email client support)
- Test in multiple email clients (Gmail, Outlook, Apple Mail)
- Keep images external (don't embed)
- Ensure responsive design with `max-width: 600px`

## Free Tier Limits

Resend's free tier includes:

- **3,000 emails per month**
- **100 emails per day**
- Full API access
- Email analytics and logs

This is more than enough for an MVP. For production, monitor usage and upgrade if needed.

## Troubleshooting

### Emails Not Sending

1. **Check Environment Variables:**

   ```bash
   # Verify variables are set
   echo $RESEND_API_KEY
   ```

2. **Check Server Logs:**
   - Look for "Email service not configured" warnings
   - Look for Resend API errors

3. **Verify API Key:**
   - Ensure it starts with `re_`
   - Make sure it's not expired
   - Check it has sending permissions

### Emails Going to Spam

For development:

- This is expected without a verified domain
- Check spam/junk folder

For production:

- Verify your domain in Resend
- Add SPF, DKIM, and DMARC records
- Use a professional "from" address
- Avoid spam trigger words in subject/body

### "Unauthorized" Error

- Double-check your API key is correct
- Ensure API key has sending permissions
- Try creating a new API key

### Rate Limiting

If you hit rate limits:

- Free tier: 100 emails/day, 3000 emails/month
- Upgrade to a paid plan for higher limits
- Implement email queuing for high volume

## Alternative Email Services

If you prefer a different email service:

1. **SendGrid** - Similar to Resend, free tier available
2. **Mailgun** - Good for high volume, free tier available
3. **AWS SES** - Very affordable, pay-as-you-go
4. **Postmark** - Focused on transactional emails

To switch services:

1. Update `/src/lib/email.ts` with new service SDK
2. Update environment variables
3. Test email sending

## Production Checklist

Before going live:

- [ ] Verify your domain in Resend
- [ ] Add all required DNS records (SPF, DKIM, DMARC)
- [ ] Update `RESEND_FROM_EMAIL` to use verified domain
- [ ] Test all email types (confirmation, status updates)
- [ ] Set up email monitoring/alerts
- [ ] Review email templates for brand consistency
- [ ] Add unsubscribe links (if sending marketing emails)
- [ ] Ensure GDPR/privacy compliance

## Support

- **Resend Documentation:** [https://resend.com/docs](https://resend.com/docs)
- **Resend Support:** support@resend.com
- **API Status:** [https://status.resend.com](https://status.resend.com)
