# Lead Form Setup Guide

This guide walks you through setting up the Cloudflare Worker + Resend email system for your fencing website template.

## Overview

- **One Cloudflare Worker** handles ALL your sites
- **Resend** sends emails to you AND your client
- **Cost**: ~$20/month for 50,000 emails (2,500 leads × 2 emails each × 10 months = plenty of buffer)

---

## Step 1: Set Up Resend (5 minutes)

1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email domain (or use their test domain to start)
3. Go to **API Keys** → **Create API Key**
4. Copy the API key (starts with `re_`)

### Domain Verification (Recommended)
To send from your own domain (e.g., `leads@youragency.com`):
1. In Resend dashboard, go to **Domains** → **Add Domain**
2. Add the DNS records they provide to your domain
3. Wait for verification (usually 5-30 minutes)

---

## Step 2: Deploy the Cloudflare Worker (10 minutes)

### Option A: Using Wrangler CLI (Recommended)

1. Install Wrangler if you haven't:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Navigate to the worker folder:
   ```bash
   cd form-worker
   ```

4. Add your secrets:
   ```bash
   wrangler secret put RESEND_API_KEY
   # Paste your Resend API key when prompted
   
   wrangler secret put AGENCY_EMAIL
   # Enter your email (e.g., leads@youragency.com)
   ```

5. Deploy:
   ```bash
   wrangler deploy
   ```

6. Note your worker URL (e.g., `https://lead-form-handler.your-subdomain.workers.dev`)

### Option B: Using Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click **Create Application** → **Create Worker**
3. Name it `lead-form-handler`
4. Replace the default code with the contents of `worker.js`
5. Click **Save and Deploy**
6. Go to **Settings** → **Variables** → **Environment Variables**
7. Add:
   - `RESEND_API_KEY` = your Resend API key (encrypt)
   - `AGENCY_EMAIL` = your email address
8. Note your worker URL

---

## Step 3: Update the Worker "From" Address

In `worker.js`, find this line:
```javascript
from: "Lead Notifications <leads@yourdomain.com>",
```

Change it to your verified Resend domain:
```javascript
from: "Lead Notifications <leads@youragency.com>",
```

Redeploy after making this change.

---

## Step 4: Update Your Site Template

In your `config.js`, update the forms section:

```javascript
forms: {
  // Your Cloudflare Worker URL
  action: "https://lead-form-handler.your-subdomain.workers.dev",
  
  // Client's email - UPDATE THIS FOR EACH NEW SITE
  clientEmail: "owner@clientbusiness.com",
  
  // ... rest of config
}
```

---

## How It Works

1. Visitor fills out form on any of your sites
2. Form submits to your single Cloudflare Worker
3. Worker reads the hidden fields:
   - `site_name` → Which site the lead came from
   - `client_email` → Where to send the client's copy
4. Worker sends two emails via Resend:
   - One to YOU (AGENCY_EMAIL)
   - One to the CLIENT (from the hidden field)
5. Visitor gets redirected to `/thank-you` page

---

## For Each New Client Site

When you duplicate the template for a new client, you only need to change TWO things in `config.js`:

1. `forms.clientEmail` → The client's email address
2. (Everything else is already configured)

The `businessName` is automatically used in the `site_name` hidden field.

---

## Testing

1. Deploy your site
2. Fill out a form with your own info
3. Check that you receive the email
4. Check that the client email receives it too (test with your own email first)

---

## Troubleshooting

### Emails not sending?
- Check Cloudflare Worker logs: Dashboard → Workers → Your Worker → Logs
- Verify RESEND_API_KEY is set correctly
- Verify your domain is verified in Resend (or use their test domain)

### Form not submitting?
- Check browser console for errors
- Verify the `action` URL in config.js matches your worker URL
- Make sure worker is deployed and accessible

### Getting CORS errors?
- The worker includes CORS headers, but check that OPTIONS requests are handled

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| Cloudflare Workers | 100,000 requests/day | Free for this use case |
| Resend | 3,000 emails/month | $20/month for 50,000 |

For 50 sites × 50 leads × 2 emails = 5,000 emails/month → **$20/month total**

---

## Questions?

The worker code is straightforward to modify if you need:
- Different email templates
- Additional notification channels (Slack, SMS)
- Lead storage in a database
- Integration with other CRMs

## Resend Form API Key
- re_9V3qiRv5_KQv76Ke1R56euqtkRTn64bXS
- lead-form-handler.zak-b7e.workers.dev
