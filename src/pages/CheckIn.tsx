import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, Dumbbell, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CheckIn() {
  const { memberId } = useParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'duplicate' | 'expired' | 'location_error'>('loading');
  const [memberName, setMemberName] = useState('');
  const [gymName, setGymName] = useState('');
  const [checkInTime, setCheckInTime] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!memberId) { 
      setStatus('error'); 
      setMessage('Invalid QR code');
      return; 
    }
    doCheckin();
  }, [memberId]);

  const doCheckin = async () => {
    try {
      console.log('CheckIn: Looking up member with ID:', memberId);
      
      // Create a public client (no auth required for check-in)
      const publicClient = supabase;
      
      // 1. Find member by ID (memberId from URL)
      // Note: Not selecting metadata from gyms as it may not exist yet
      const { data: member, error: memberError } = await publicClient
        .from('members')
        .select('id, name, gym_id, status, expiry_date, gyms(name, status)')
        .eq('id', memberId!)
        .maybeSingle();

      console.log('CheckIn: Query result:', { member, memberError });

      if (memberError) {
        console.error('CheckIn: Database error:', memberError);
        setStatus('error'); 
        setMessage(`Database error: ${memberError.message}. Please contact gym staff.`);
        return; 
      }

      if (!member) { 
        console.error('CheckIn: No member found with ID:', memberId);
        setStatus('error'); 
        setMessage('Member not found. Please verify the QR code is correct.');
        return; 
      }

      const gym = member.gyms as any;
      
      // 2. Verify gym is active
      if (gym?.status !== 'active') { 
        setStatus('error'); 
        setMessage('Gym is currently inactive. Please contact support.');
        return; 
      }

      // 3. Verify membership is active
      if (member.status === 'expired') {
        setStatus('expired');
        setMemberName(member.name);
        setGymName(gym?.name || '');
        setMessage('Your membership has expired. Please renew to continue.');
        return;
      }

      // 4. Check if membership is valid (not expired by date)
      if (member.expiry_date && new Date(member.expiry_date) < new Date()) {
        setStatus('expired');
        setMemberName(member.name);
        setGymName(gym?.name || '');
        setMessage('Your membership expired on ' + new Date(member.expiry_date).toLocaleDateString());
        return;
      }

      setMemberName(member.name);
      setGymName(gym?.name || '');

      // 5. GPS Location Verification (if enabled)
      // Try to get location settings from localStorage as fallback
      let locationSettings: any = {};
      
      // Location settings stored in localStorage by gym owner
      // (metadata column not available on gyms table)
      
      // Fallback to localStorage if metadata not in database
      if (!locationSettings.location_enabled) {
        const stored = localStorage.getItem(`gym_location_${member.gym_id}`);
        if (stored) {
          try {
            locationSettings = JSON.parse(stored);
          } catch (e) {
            console.error('Failed to parse stored location:', e);
          }
        }
      }
      
      if (locationSettings.location_enabled && locationSettings.location_latitude && locationSettings.location_longitude) {
        setMessage('Verifying your location...');
        
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            });
          });

          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          const gymLat = parseFloat(locationSettings.location_latitude);
          const gymLon = parseFloat(locationSettings.location_longitude);
          const allowedRadius = parseFloat(locationSettings.location_radius || '50');

          // Calculate distance using Haversine formula
          const distance = calculateDistance(userLat, userLon, gymLat, gymLon);

          if (distance > allowedRadius) {
            setStatus('location_error');
            setMessage(`You must be within ${allowedRadius}m of the gym to check in. You are ${Math.round(distance)}m away.`);
            return;
          }
        } catch (geoError: any) {
          setStatus('location_error');
          setMessage('Location access denied. Please enable location services and try again.');
          return;
        }
      }

      // 6. Check for duplicate check-in today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingCheckIn } = await supabase
        .from('attendance_logs')
        .select('check_in_time')
        .eq('member_id', member.id)
        .gte('check_in_time', today)
        .order('check_in_time', { ascending: false })
        .limit(1)
        .single();

      if (existingCheckIn) {
        setStatus('duplicate');
        setCheckInTime(new Date(existingCheckIn.check_in_time).toLocaleTimeString());
        setMessage('You already checked in today');
        return;
      }

      // 7. Record attendance
      const now = new Date();
      const { error: insertError } = await supabase
        .from('attendance_logs')
        .insert({
          member_id: member.id,
          gym_id: member.gym_id,
          check_in_method: 'qr',
          check_in_time: now.toISOString(),
        });

      if (insertError) {
        console.error('Check-in error:', insertError);
        setStatus('error');
        setMessage('Failed to record attendance. Please try again.');
        return;
      }

      setStatus('success');
      setCheckInTime(now.toLocaleTimeString());
      setMessage('Have a great workout! 💪');

      // TODO: Send WhatsApp confirmation (implement when WhatsApp integration is ready)
      // sendWhatsAppConfirmation(member.phone, member.name, gymName, checkInTime);

    } catch (error) {
      console.error('Check-in error:', error);
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
    }
  };

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Dumbbell className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="font-heading text-4xl gold-text">GymFlow</h1>
          <p className="text-sm text-muted-foreground mt-2">Self Check-In System</p>
        </motion.div>

        <div className="rounded-2xl border border-primary/20 bg-card p-8 card-glow">
          {status === 'loading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
              <p className="text-xl font-heading">Verifying membership...</p>
              <p className="text-sm text-muted-foreground mt-2">Please wait</p>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <div className="relative">
                <CheckCircle className="h-24 w-24 text-success mx-auto mb-4" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-32 h-32 rounded-full bg-success/20 blur-2xl" />
                </motion.div>
              </div>
              <h2 className="text-3xl font-heading mb-2 gold-text">Welcome Back!</h2>
              <p className="text-2xl font-medium mb-1">{memberName}</p>
              <p className="text-muted-foreground mb-4">{gymName}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                <Clock className="h-4 w-4" />
                <span>{checkInTime}</span>
              </div>
              <p className="text-primary font-medium">{message}</p>
            </motion.div>
          )}

          {status === 'duplicate' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <AlertTriangle className="h-20 w-20 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-heading mb-2">Already Checked In</h2>
              <p className="text-xl font-medium mb-1">{memberName}</p>
              <p className="text-muted-foreground mb-4">{gymName}</p>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>First check-in: {checkInTime}</span>
              </div>
              <p className="text-warning">{message}</p>
            </motion.div>
          )}

          {status === 'expired' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-heading mb-2">Membership Expired</h2>
              <p className="text-xl font-medium mb-1">{memberName}</p>
              <p className="text-muted-foreground mb-4">{gymName}</p>
              <p className="text-destructive">{message}</p>
              <p className="text-sm text-muted-foreground mt-4">Please contact the gym to renew your membership</p>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-heading mb-2">Check-in Failed</h2>
              <p className="text-destructive mb-4">{message}</p>
              <p className="text-sm text-muted-foreground">Please scan the QR code again or contact gym staff</p>
            </motion.div>
          )}

          {status === 'location_error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MapPin className="h-20 w-20 text-warning mx-auto mb-4" />
              <h2 className="text-2xl font-heading mb-2">Location Required</h2>
              <p className="text-warning mb-4">{message}</p>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>To check in, you must:</p>
                <ul className="list-disc list-inside text-left">
                  <li>Be physically at the gym</li>
                  <li>Enable location services</li>
                  <li>Allow location access in browser</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          Powered by GymFlow • Instant Check-In System
        </p>
      </div>
    </div>
  );
}
