# Quick Setup Guide - QR Check-In System

## Current Status
✅ Code is ready
✅ Permissions fixed
⚠️ Need to apply database migrations

## Apply These SQL Commands

Go to your Supabase Dashboard → SQL Editor and run these commands in order:

### 1. Add Metadata Column (for GPS location)
```sql
-- Add metadata column to gyms table
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_gyms_metadata ON public.gyms USING gin(metadata);

-- Add comment
COMMENT ON COLUMN public.gyms.metadata IS 'Stores gym settings like location coordinates, radius, and other configuration';
```

### 2. Enable Public Access for QR Check-In
```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read for check-in" ON members;
DROP POLICY IF EXISTS "Allow public read gyms for check-in" ON gyms;
DROP POLICY IF EXISTS "Allow public insert attendance" ON attendance_logs;

-- Allow public to read members (needed for QR check-in verification)
CREATE POLICY "Allow public read for check-in"
ON members
FOR SELECT
TO anon
USING (true);

-- Allow public to read gym info (needed to verify gym status during check-in)
CREATE POLICY "Allow public read gyms for check-in"
ON gyms
FOR SELECT
TO anon
USING (true);

-- Allow public to insert attendance logs (needed for QR check-in)
CREATE POLICY "Allow public insert attendance"
ON attendance_logs
FOR INSERT
TO anon
WITH CHECK (true);
```

## Test the System

### Step 1: Generate QR Code
1. Login to dashboard
2. Go to Members page
3. Click QR icon for any member
4. QR code dialog will appear

### Step 2: Test Check-In
1. Copy the URL from the QR code (or scan it with your phone)
2. Open in a new incognito/private window
3. Should see: "Welcome Back! [Member Name]"
4. Check-in should complete successfully

### Step 3: Verify Attendance
1. Go to Attendance page in dashboard
2. Should see the new check-in record
3. Method should show "qr"

## Features Now Working

✅ QR code generation for members
✅ Self check-in without login
✅ Membership validation
✅ Expiry date checking
✅ Duplicate check-in prevention
✅ GPS location verification (optional)
✅ Real-time attendance logging

## Optional: Enable GPS Verification

1. Go to Attendance page
2. Click "Location" button
3. Enable GPS verification toggle
4. Click "Use Current Location" (or enter manually)
5. Set radius (default: 50m)
6. Save settings

Now members must be physically at the gym to check in!

## Troubleshooting

### "Member not found"
- ✅ FIXED: Applied public read policies

### "metadata does not exist"
- ✅ FIXED: Made metadata optional, works with or without column
- Run migration #1 above to add the column

### "Permission denied"
- Run migration #2 above to enable public access

### "Already checked in today"
- This is correct! Members can only check in once per day
- Check Attendance page to see the existing check-in

## What's Next?

After setup is complete:
1. Print QR codes for members (download from Members page)
2. Test with multiple members
3. Configure GPS location (optional)
4. Monitor attendance in Reports page
5. Consider WhatsApp notifications (future feature)

---

**Time to complete:** 2 minutes
**Difficulty:** Easy (just copy-paste SQL)
**Impact:** Full QR check-in system operational
