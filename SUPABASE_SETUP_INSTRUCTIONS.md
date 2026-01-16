# 🚀 Supabase Setup Instructions

Complete guide to set up Supabase backend for your demo form submission system.

---

## 📋 Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

---

## Step 1: Create Database Table

1. Go to your Supabase Dashboard: [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click on **"SQL Editor"** in the left sidebar
4. Click **"New Query"**
5. Open the file `supabase_setup.sql` from this project
6. Copy **ALL** the SQL code from that file
7. Paste it into the SQL Editor
8. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)

✅ **Verification**: You should see "Success. No rows returned" or similar success message.

---

## Step 2: Get Your API Keys

1. In your Supabase Dashboard, go to **"Project Settings"** (gear icon in left sidebar)
2. Click on **"API"** in the settings menu
3. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (a long string starting with `eyJ...`)

📝 **Copy both of these values** - you'll need them in the next step.

---

## Step 3: Configure Environment Variables

1. In your project root directory, create a file named `.env` (if it doesn't exist)
2. Open `ENV_TEMPLATE.txt` from this project
3. Copy the template content
4. Paste it into your `.env` file
5. Replace the placeholder values:

```env
REACT_APP_SUPABASE_URL=https://your-actual-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

⚠️ **Important**: 
- Use the **anon/public key**, NOT the service_role key
- The anon key is safe to expose in frontend code
- Never commit your `.env` file to version control

---

## Step 4: Install Supabase Package

Run this command in your terminal:

```bash
npm install @supabase/supabase-js
```

---

## Step 5: Enable Supabase Auth (for Admin Login)

1. In Supabase Dashboard, go to **"Authentication"** in the left sidebar
2. Click on **"Providers"**
3. Make sure **"Email"** provider is enabled (it should be by default)
4. (Optional) Configure email templates if you want custom confirmation emails

### Create Admin User

1. Go to **"Authentication"** > **"Users"**
2. Click **"Add user"** > **"Create new user"**
3. Enter:
   - **Email**: Your admin email (e.g., `admin@yourcompany.com`)
   - **Password**: A strong password
   - **Auto Confirm User**: ✅ Check this box (so you don't need email verification)
4. Click **"Create user"**

📝 **Save these credentials** - you'll use them to log into the admin panel.

---

## Step 6: Test the Integration

1. **Start your development server**:
   ```bash
   npm start
   ```

2. **Fill out the demo form** on your website
3. **Submit the form**
4. **Check Supabase**:
   - Go to **"Table Editor"** in Supabase Dashboard
   - Click on **"user_submissions"** table
   - You should see your test submission!

---

## Step 7: Set Up Admin Panel

1. Open `public/admin.html` in your project
2. Find these lines near the top of the `<script>` section:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
4. **Access the admin panel**:
   - In development: `http://localhost:3000/admin.html`
   - In production: `https://yourdomain.com/admin.html`
5. **Login** with the admin credentials you created in Step 5

---

## 🔒 Security Notes

### Row Level Security (RLS)

The SQL setup includes RLS policies:
- ✅ **Anyone can submit forms** (insert allowed for anon users)
- ✅ **Only authenticated users can view submissions** (select requires authentication)

### Admin Access

- Only users with Supabase accounts can access the admin panel
- Make sure to create admin users through Supabase Dashboard
- Consider using strong passwords and enabling 2FA for admin accounts

---

## 🐛 Troubleshooting

### "Invalid API key" error
- ✅ Check that you're using the **anon key**, not service_role key
- ✅ Make sure there are no extra spaces in your `.env` file
- ✅ Restart your development server after changing `.env`

### "Table doesn't exist" error
- ✅ Make sure you ran the SQL setup script completely
- ✅ Check that the table name is exactly `user_submissions`
- ✅ Verify in Supabase Dashboard > Table Editor

### "Permission denied" error
- ✅ Check RLS policies are set up correctly
- ✅ For admin panel: Make sure you're logged in with a Supabase user account
- ✅ Verify the user has authentication enabled

### Form submissions not appearing
- ✅ Check browser console for errors
- ✅ Verify `.env` file has correct values
- ✅ Make sure `npm install @supabase/supabase-js` was run
- ✅ Check Supabase Dashboard > Table Editor to see if data is there

### Admin panel login not working
- ✅ Make sure you created the user in Supabase Dashboard
- ✅ Check that "Email" provider is enabled in Authentication > Providers
- ✅ Try creating a new user if the first one doesn't work

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

- [ ] SQL table created successfully
- [ ] API keys copied to `.env` file
- [ ] `@supabase/supabase-js` package installed
- [ ] Form submission tested and working
- [ ] Admin user created in Supabase
- [ ] Admin panel configured with API keys
- [ ] Admin login tested successfully
- [ ] CSV export tested

---

**Need help?** Check the Supabase documentation or create an issue in your project repository.


