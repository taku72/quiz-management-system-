# Supabase Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `quiz-management-system`
   - Database Password: (create a strong password)
   - Region: Choose closest to your location
5. Click "Create new project"

## 2. Get Your Credentials

After project creation:

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon/public key** (starts with `eyJ`)

## 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace the placeholder values with your actual Supabase credentials.

## 4. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy and paste the contents of `supabase-setup.sql`
3. Click "Run" to execute the SQL

This will create:
- `users` table for user profiles
- `quizzes` table for quiz data
- `quiz_attempts` table for quiz results
- Sample data for testing

## 5. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add: `http://localhost:3000`
3. Under **Redirect URLs**, add: `http://localhost:3000`

## 6. Test the Connection

After setting up:
1. Restart your development server: `npm run dev`
2. The app should now connect to Supabase
3. Try creating a new account to test registration
4. Try logging in with the sample accounts

## Sample Accounts (after running SQL setup)

- **Admin**: admin@quiz.com / (set password during auth setup)
- **Student**: student1@quiz.com / (set password during auth setup)

## Troubleshooting

- **"supabaseUrl is required"**: Check your `.env.local` file exists and has correct values
- **Authentication errors**: Verify your Site URL and Redirect URLs in Supabase settings
- **Database errors**: Ensure the SQL schema was executed successfully

## Production Deployment

For production, add the same environment variables to your hosting platform:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Railway: Variables tab in your project
