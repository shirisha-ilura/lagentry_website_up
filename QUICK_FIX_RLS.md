# 🔧 Quick Fix for RLS Permission Denied Error

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
- Go to: https://app.supabase.com/project/zlcijmyouoasydkamyeb
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"**

### 2. Copy and Run the Complete Setup Script
- Open the file `fix_rls_policies.sql` in this project
- Copy **ALL** the SQL code from that file
- Paste it into the Supabase SQL Editor
- Click **"Run"** (or press `Ctrl+Enter`)

### 3. Verify the Setup
After running, you should see:
- ✅ Table created
- ✅ RLS enabled
- ✅ Policies created

### 4. Check Policies Manually
1. Go to **"Authentication"** → **"Policies"** in Supabase
2. Click on **"user_submissions"** table
3. You should see:
   - ✅ "Allow public insert" policy
   - ✅ "Allow authenticated read" policy

### 5. Test the Form
- Go back to your website
- Fill out and submit the form
- It should work now!

## 🔍 Troubleshooting

### If you still get "Permission denied":

**Option A: Temporarily Disable RLS (for testing only)**
```sql
ALTER TABLE user_submissions DISABLE ROW LEVEL SECURITY;
```
⚠️ **Warning**: Only use this for testing. Re-enable RLS for production.

**Option B: Check if table exists**
```sql
SELECT * FROM user_submissions LIMIT 1;
```
If this gives an error, the table doesn't exist. Run the full setup script.

**Option C: Verify policies are active**
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'user_submissions';
```
You should see the "Allow public insert" policy listed.

## 📝 Common Issues

1. **"Table doesn't exist"** → Run the complete setup script
2. **"Policy already exists"** → The script drops old policies first, so this is fine
3. **"RLS not enabled"** → The script enables it, so run it again

## ✅ Success Indicators

After running the script, you should be able to:
- ✅ Submit the form without errors
- ✅ See data in Supabase Table Editor
- ✅ View submissions in the admin panel (after login)


