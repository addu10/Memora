# Production Deployment Checklist

Use this checklist to verify each component before going live.

## 🏥 Portal (Next.js)
- [ ] **Environment Variables**: Verify all `NEXT_PUBLIC_` and private keys are in Vercel.
- [ ] **Build Check**: Run `npm run build` locally to catch any TypeScript/Linting errors.
- [ ] **Error Boundaries**: Ensure the application doesn't crash on a failed API call.
- [ ] **Favicon & Metadata**: Update the default Next.js header with Memora branding.
- [ ] **Loading States**: Verify all buttons show a spinner during API requests.

## 📱 Mobile App (Expo)
- [ ] **App Store Assets**: Prepare icons (1024x1024) and splash screens (2732x2732).
- [ ] **Bundle ID**: Finalize `com.memora.app` in `app.json`.
- [ ] **Permission Descriptions**: Ensure camera/photo library usage strings are clear for Apple review.
- [ ] **Optimization**: Run `npx expo install --check` to sync dependencies.
- [ ] **OTA Updates**: Test `eas update` to ensure small fixes can be pushed instantly.

## 🗄️ Supabase
- [ ] **RLS Audit**: Confirm no table has "Enable RLS" unchecked.
- [ ] **PITR**: Enable Point-in-Time Recovery (Supabase Pro).
- [ ] **Auth Redirects**: Update auth callback URLs from `localhost:3000` to the production domain.
- [ ] **Secrets Management**: Move `GEMINI_API_KEY` and `HF_TOKEN` from dev environment to Supabase dashboard secrets.

## 🧠 Inference Model
- [ ] **Health Check**: Implement a `/health` endpoint for the API.
- [ ] **Concurrency**: Test how the model handles 5-10 users scanning faces at the same time.
- [ ] **Timeout Handling**: Ensure the mobile app doesn't hang if the GPU takes >10s to respond.
- [ ] **Logging**: Centralize logs (e.g., using LogTail or Sentry) to monitor recognition failures.
