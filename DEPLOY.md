# Deploying Literaku

This guide outlines the steps to deploy Literaku to production.

## Prerequisites

1.  **Vercel Account**: Use Vercel for the best Next.js hosting experience.
2.  **Supabase Project**: Production database instance.
3.  **GitHub Repository**: Code pushed to a repo.

## Environment Variables

Ensure the following variables are set in your deployment environment (e.g., Vercel Project Settings):

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
```

## Deployment on Vercel (Recommended)

1.  Login to [Vercel](https://vercel.com).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your `literaku` GitHub repository.
4.  In **"Configure Project"**:
    - **Framework Preset**: Next.js
    - **Environment Variables**: Add the variables listed above.
5.  Click **Deploy**.

## Deployment on Docker (VPS)

1.  Build the image:
    ```bash
    docker build -t literaku .
    ```
2.  Run container:
    ```bash
    docker run -p 3000:3000 --env-file .env.local literaku
    ```

## Post-Deployment

1.  **Database**: Ensure your Supabase RLS policies are active.
2.  **Auth**: Update your NextAuth / Supabase Auth redirect URLs to match your production domain.
