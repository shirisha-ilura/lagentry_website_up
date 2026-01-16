# Admin Login for Chat Management

The admin chat interface is protected with authentication. Only authorized admins can access the chat management panel.

## Access URL

- **Login Page**: `/admin/login`
- **Admin Panel**: `/admin/chats` (requires login)

## Default Credentials

**Username**: `admin`  
**Password**: `lagentry2024`

⚠️ **Important**: Change these credentials in production!

## Setting Custom Credentials

You can set custom admin credentials using environment variables:

1. Create a `.env` file in the root directory (if it doesn't exist)
2. Add the following variables:

```env
REACT_APP_ADMIN_USERNAME=your_username
REACT_APP_ADMIN_PASSWORD=your_secure_password
```

3. Restart your development server for changes to take effect

## Features

- **Session Management**: Login sessions last 24 hours
- **Auto-logout**: Sessions expire after 24 hours of inactivity
- **Protected Routes**: Unauthorized users are redirected to login
- **Logout Button**: Admins can logout manually from the header

## Security Notes

- For production, use strong passwords
- Consider implementing additional security measures (2FA, IP restrictions, etc.)
- The current implementation uses localStorage for session management
- For enhanced security, consider implementing server-side authentication

## Troubleshooting

If you can't login:
1. Check that you're using the correct credentials
2. Clear browser localStorage and try again
3. Check browser console for any errors
4. Verify environment variables are set correctly (if using custom credentials)

