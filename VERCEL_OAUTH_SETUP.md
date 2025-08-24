# Google OAuth Setup for Vercel Deployment

This guide explains how to properly set up Google OAuth for the CHUTKI Image Tools application when deploying to Vercel.

## Prerequisites

1. A Google Cloud Platform account with OAuth 2.0 credentials
2. A Vercel account with your project imported

## Steps to Configure Google OAuth

### 1. Set Up Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set the application type to "Web application"
6. Add the following authorized redirect URIs:
   - For local development: `http://localhost:5001/api/auth/google/callback`
   - For Vercel deployment: `https://your-backend-url.vercel.app/api/auth/google/callback`
7. Click "Create" and note your Client ID and Client Secret

### 2. Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Navigate to "Settings" > "Environment Variables"
3. Add the following environment variables:

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend-url.vercel.app/api/auth/google/callback
```

4. Make sure to replace `your-backend-url.vercel.app` with your actual backend URL
5. Click "Save" to apply the changes

### 3. Redeploy Your Application

After setting up the environment variables, redeploy your application to apply the changes:

1. Push a new commit to your repository, or
2. Trigger a manual redeploy from the Vercel dashboard

## Troubleshooting

If you encounter issues with Google OAuth authentication:

1. Verify that your environment variables are correctly set in Vercel
2. Check that the redirect URI in your Google Cloud Console matches exactly with your backend URL
3. Ensure that your backend's `vercel.json` file includes the environment variables
4. Check the server logs for any authentication errors

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)