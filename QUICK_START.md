# ⚡ Quick Start Guide

## 🎯 What Was Created

1. **`supabase_setup.sql`** - SQL script to create the database table
2. **`ENV_TEMPLATE.txt`** - Template for environment variables
3. **`src/lib/supabaseClient.ts`** - Supabase client initialization
4. **`src/lib/submitFormData.ts`** - Form submission function
5. **`public/admin.html`** - Admin dashboard page
6. **`SUPABASE_SETUP_INSTRUCTIONS.md`** - Complete setup guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Supabase Package
```bash
npm install @supabase/supabase-js
```

### 2. Set Up Supabase Database
- Go to [Supabase Dashboard](https://app.supabase.com)
- Open SQL Editor → New Query
- Copy/paste contents of `supabase_setup.sql`
- Click Run

### 3. Get API Keys
- Supabase Dashboard → Project Settings → API
- Copy **Project URL** and **anon key**

### 4. Create `.env` File
Create `.env` in project root:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Create Admin User
- Supabase Dashboard → Authentication → Users
- Add user → Create new user
- Use email + password (check "Auto Confirm User")

### 6. Configure Admin Panel
- Open `public/admin.html`
- Find lines with `YOUR_SUPABASE_URL_HERE` and `YOUR_SUPABASE_ANON_KEY_HERE`
- Replace with your actual values

### 7. Test It!
1. Start dev server: `npm start`
2. Fill out demo form → Submit
3. Check Supabase Dashboard → Table Editor → `user_submissions`
4. Visit `http://localhost:3000/admin.html` → Login → View submissions

## 📝 Form Integration

The form is already integrated! The `BookDemo.tsx` component now:
- ✅ Submits to Supabase automatically
- ✅ Shows success/error messages
- ✅ Validates all fields
- ✅ Still supports Firebase (optional, for backward compatibility)

## 🔐 Admin Access

- **URL**: `http://localhost:3000/admin.html` (dev) or `https://yourdomain.com/admin.html` (prod)
- **Login**: Use the admin user you created in Supabase
- **Features**: View all submissions, export CSV

## 📚 Full Documentation

See `SUPABASE_SETUP_INSTRUCTIONS.md` for detailed instructions and troubleshooting.

---

**Need help?** Check the setup instructions or Supabase documentation.


