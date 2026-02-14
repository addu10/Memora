# Production Audit Plan

A systematic guide to stress-testing the Memora ecosystem before launch.

## 🛡️ Security Audit

### 1. Data Isolation (RLS)
- **Test**: Attempt to fetch `Memory` records using a `patientId` that doesn't belong to the logged-in session.
- **Expected**: HTTP 403 or empty array.

### 2. API Hardening
- **Test**: Send malformed JSON or excessively large payloads to the `generate-questions` Edge Function.
- **Expected**: Elegant failure with 400 Bad Request.

### 3. Edge Case: Token Exhaustion
- **Test**: Script 100 consecutive AI question requests.
- **Expected**: Rate limiter kicks in at request 21+, returning 429 Too Many Requests.

---

## ⚡ Performance Audit

### 1. Cold Start Latency
- **Test**: Trigger the face recognition model after 1 hour of inactivity.
- **Expected**: Response within 15 seconds (Inference) or 5 seconds (Edge Function).

### 2. Payload Optimization
- **Test**: Check image upload sizes from the mobile app.
- **Expected**: Use compression to keep photos <500KB before transit to save user data.

---

## 🧪 Consistency Audit

### 1. Cross-Platform Sync
- **Test**: Add a family member in the Portal → Open Mobile App.
- **Expected**: Real-time update via Supabase Channel (verify the fix we implemented today!).

### 2. Transfer Resilience
- **Test**: Initiate a patient transfer → Break internet connection → Restore connection.
- **Expected**: Transaction atomic integrity (either succeeds fully or rolls back).
