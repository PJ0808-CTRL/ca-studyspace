# CA Orbit Email Setup Guide

To customize your emails so they appear professionally branded from **CA Orbit** instead of default "Supabase":

---

### Step 1: Update the Confirmation Email Template in Supabase

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: **`hzkkamgervlwepjehxdo`**.
3. In the left navigation, click **Authentication** &rarr; **Email Templates**.
4. Click on **Confirm signup**.
5. Set the **Subject** field to:
   ```text
   Welcome to CA Orbit — Confirm your email
   ```
6. Replace the existing HTML in the **Message body** box with the code inside:
   [`supabase/email-templates/confirm-signup.html`](./confirm-signup.html)
7. Click **Save Changes** at the bottom.

---

### Step 2: (Optional) Set Custom Sender Name

By default, Supabase's built-in testing service sends from `noreply@mail.app.supabase.io`.
To change the sender name to **CA Orbit**:

1. In Supabase Dashboard, go to **Authentication** &rarr; **Email Templates**.
2. Set **Sender Name** to:
   ```text
   CA Orbit
   ```
3. To send from your own domain (e.g. `castudyspacesupport@gmail.com` or custom address) without any Supabase references:
   - Go to **Project Settings** &rarr; **Authentication** &rarr; **SMTP Settings**.
   - Enable **Custom SMTP**.
   - Enter credentials from any free transactional email provider (such as [Resend](https://resend.com), [Brevo/Sendinblue](https://brevo.com), or [SendGrid]).
   - **Sender email**: `no-reply@castudyspace.vercel.app`
   - **Sender name**: `CA Orbit`

---

### Step 3: Password Reset & Magic Link (Optional)
If you also want branded password reset emails:
- In **Authentication** &rarr; **Email Templates** &rarr; **Reset Password**, paste the code from [`supabase/email-templates/reset-password.html`](./reset-password.html).
- Set subject to: `Reset your CA Orbit Password`.
