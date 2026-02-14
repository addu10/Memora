# Production Deployment Guide

Follow these step-by-step instructions to get the Memora ecosystem live.

## 🏥 1. Portal (Next.js) on Vercel
1.  **Initialize**: Log in to [vercel.com](https://vercel.com) and click "Add New" → "Project".
2.  **Repo**: Import your `Memora` GitHub repository.
3.  **Root Directory**: Set this to `portal` during the Vercel project setup.
4.  **Environment Variables**:
    - Add `NEXT_PUBLIC_SUPABASE_URL`
    - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - Add `SUPABASE_SERVICE_ROLE_KEY`
    - Add `JWT_SECRET`
5.  **Deploy**: Click "Deploy". Vercel will provide a URL (e.g., `memora-portal.vercel.app`).

## 📱 2. Mobile App on Expo (EAS)
1.  **Install CLI**: `npm install -g eas-cli`.
2.  **Configure**: Run `eas build:configure`.
3.  **Set Prod API**: Update `mobile/lib/api.ts` or use environment variables to point to the production Supabase project.
4.  **Build**: 
    - Android: `eas build --platform android --profile production`
    - iOS: `eas build --platform ios --profile production`
5.  **Submit**: `eas submit --platform all`. Follow the prompts to upload builds to App Store Connect and Google Play Console.

## 🗄️ 3. Supabase Backend
1.  **Migrations**: Use the Supabase CLI to push your local database schema to a new production project:
    `supabase db push`
2.  **Edge Functions**: Deploy the AI functions to the production project:
    `supabase functions deploy generate-questions --project-ref YOUR_PROD_REF`
3.  **Secrets**: Set the Gemini key on the production function:
    `supabase secrets set GEMINI_API_KEY=your_key --project-ref YOUR_PROD_REF`

## 🧠 4. Inference Server (GPU)
We recommend **Modal.com** for cost-effective GPU hosting.

1.  **Dockerize**: Create a `Dockerfile` for `inference_v3`.
2.  **Deploy**: 
    - Create a Modal account.
    - Use their Python SDK to wrap `app_optimized.py`.
    - Run `modal deploy app.py`.
3.  **Endpoint**: Modal will provide a permanent URL. Update the Edge Function or Mobile App to point to this new URL.

---

## 🛠️ Post-Deployment Monitoring
- **Sentry**: Integrates with Next.js and React Native to track crashes.
- **Supabase Logs**: Monitor Edge Function usage to prevent hitting Gemini's free tier quotas.
- **Expo Stats**: Track how many users are active on each version of the mobile app.
