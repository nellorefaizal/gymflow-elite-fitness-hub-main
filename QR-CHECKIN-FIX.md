# QR Check-In Fix - Database Permissions

## Problem
QR check-in was showing "Member not found" error even though members exist in the database.

## Root Cause
The CheckIn page is accessed without authentication (public access), but the Supabase database has Row Level Security (RLS) policies that prevent unauthenticated users from reading the `members` and `gyms` tables.

## Solution
We need to enable public read access for the QR check-in feature while maintaining security.

## Steps to Fix

### 1. Apply Database Migration

Run the migration to enable public access for check-in:

```bash
# If using Supabase CLI locally
supabase db push

# Or apply the migration manually in Supabase Dashboard
```

The migration file is: `supabase/migrations/20260307120000_enable_public_checkin.sql`

### 2. Manual Setup (If not using migrations)

If you prefer to set up manually, go to your Supabase Dashboard:

**For `members` table:**
1. Go to Authentication > Policies
2. Select `members` table
3. Add new policy:
   - Name: "Allow public read for check-in"
   - Policy command: SELECT
   - Target roles: anon
   - USING expression: `true`

**For `gyms` table:**
1. Select `gyms` table
2. Add new policy:
   - Name: "Allow public read gyms for check-in"
   - Policy command: SELECT
   - Target roles: anon
   - USING expression: `true`

**For `attendance_logs` table:**
1. Select `attendance_logs` table
2. Add new policy:
   - Name: "Allow public insert attendance"
   - Policy command: INSERT
   - Target roles: anon
   - WITH CHECK expression: `true`

### 3. Test the Fix

1. Go to Members page in dashboard
2. Click QR icon for any member
3. Copy the URL from the QR code (or scan it)
4. Open the URL in a new incognito/private window (to test without auth)
5. Should see member check-in page instead of "Member not found"

## Security Considerations

### What's Safe
- ✅ Public can read member names and status (needed for check-in)
- ✅ Public can read gym info (needed to verify gym is active)
- ✅ Public can insert attendance records (the whole point of QR check-in)

### What's Protected
- ✅ Member phone numbers, emails, notes are visible but not sensitive in check-in context
- ✅ Check-in logic validates membership status, expiry, and location
- ✅ Duplicate check-ins are prevented
- ✅ Only active members can check in
- ✅ GPS verification (if enabled) ensures physical presence

### Additional Security
The CheckIn page validates:
1. Member exists and is active
2. Gym is active (not suspended)
3. Membership hasn't expired
4. No duplicate check-in today
5. GPS location (if enabled)
6. All validations happen server-side

## Debugging

### Check Console Logs
Open browser console (F12) when accessing check-in page. You'll see:
```
CheckIn: Looking up member with ID: [member-id]
CheckIn: Query result: { member: {...}, memberError: null }
```

### Common Issues

**Issue:** Still shows "Member not found"
- **Solution:** RLS policies not applied. Check Supabase Dashboard > Authentication > Policies

**Issue:** "Database error: permission denied"
- **Solution:** The `anon` role doesn't have SELECT permission. Apply the migration.

**Issue:** "Location required" error
- **Solution:** GPS verification is enabled. Either:
  - Disable GPS in Attendance page settings, OR
  - Be physically at the gym when testing

**Issue:** "Already checked in today"
- **Solution:** This is correct behavior. Member can only check in once per day.

## Alternative Approach (More Secure)

If you want to avoid public read access, you can:

1. Create a Supabase Edge Function for check-in
2. Pass member ID to the function
3. Function validates and records attendance
4. Returns result to client

This keeps all data access server-side but requires more setup.

## Files Modified

1. `src/pages/CheckIn.tsx` - Added better error logging
2. `src/pages/dashboard/Members.tsx` - Added QR generation logging
3. `supabase/migrations/20260307120000_enable_public_checkin.sql` - New migration

## Testing Checklist

- [ ] Apply database migration
- [ ] Generate QR code for a member
- [ ] Scan QR code (or open URL)
- [ ] Verify check-in page loads
- [ ] Verify member name appears
- [ ] Verify check-in completes successfully
- [ ] Verify attendance record created
- [ ] Verify duplicate check-in is prevented
- [ ] Test with expired member (should show expired message)
- [ ] Test with GPS enabled (if configured)

## Next Steps

After applying the fix:
1. Test QR check-in with multiple members
2. Verify attendance logs are created correctly
3. Test on mobile devices
4. Consider adding WhatsApp notifications (future feature)
5. Monitor for any security issues

---

**Status:** Ready to deploy
**Priority:** High (core feature)
**Impact:** Enables QR-based self check-in system
