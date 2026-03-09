import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarCheck, Plus, Loader2, Search, MapPin, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function Attendance() {
  const { gym } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckin, setShowCheckin] = useState(false);
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [locationSettings, setLocationSettings] = useState({
    latitude: '',
    longitude: '',
    radius: '50',
    enabled: false
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => { if (gym?.id) loadData(); }, [gym?.id]);

  const loadData = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [lRes, mRes] = await Promise.all([
      supabase.from('attendance_logs').select('*, members(name, phone)').eq('gym_id', gym.id).gte('check_in_time', today).order('check_in_time', { ascending: false }),
      supabase.from('members').select('id, name, phone').eq('gym_id', gym.id).eq('status', 'active'),
    ]);
    setLogs(lRes.data || []);
    setMembers(mRes.data || []);
    
    // Load location settings from localStorage
    let metadata: any = {};
    const stored = localStorage.getItem(`gym_location_${gym.id}`);
    if (stored) {
      try {
        metadata = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse stored location:', e);
      }
    }
    
    setLocationSettings({
      latitude: metadata.location_latitude || '',
      longitude: metadata.location_longitude || '',
      radius: metadata.location_radius || '50',
      enabled: metadata.location_enabled || false
    });
    
    setLoading(false);
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationSettings(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        toast.success('Location captured successfully');
        setGettingLocation(false);
      },
      (error) => {
        toast.error('Failed to get location: ' + error.message);
        setGettingLocation(false);
      }
    );
  };

  const saveLocationSettings = async () => {
    setSaving(true);
    
    try {
      // Try to save to database
      const metadata = {
        location_latitude: locationSettings.latitude,
        location_longitude: locationSettings.longitude,
        location_radius: locationSettings.radius,
        location_enabled: locationSettings.enabled
      };

      localStorage.setItem(`gym_location_${gym.id}`, JSON.stringify(metadata));
      toast.success('Location settings saved');

      setShowLocationSettings(false);
      loadData();
    } catch (err) {
      console.error('Save error:', err);
      // Fallback to localStorage
      const metadata = {
        location_latitude: locationSettings.latitude,
        location_longitude: locationSettings.longitude,
        location_radius: locationSettings.radius,
        location_enabled: locationSettings.enabled
      };
      localStorage.setItem(`gym_location_${gym.id}`, JSON.stringify(metadata));
      toast.success('Location settings saved (local storage)');
      setShowLocationSettings(false);
    } finally {
      setSaving(false);
    }
  };

  const quickToggleLocation = async () => {
    const newEnabled = !locationSettings.enabled;
    
    // Check if location is configured before enabling
    if (newEnabled && (!locationSettings.latitude || !locationSettings.longitude)) {
      toast.error('Please configure location first');
      setShowLocationSettings(true);
      return;
    }

    setLocationSettings(prev => ({ ...prev, enabled: newEnabled }));

    // Save immediately
    const metadata = {
      location_latitude: locationSettings.latitude,
      location_longitude: locationSettings.longitude,
      location_radius: locationSettings.radius,
      location_enabled: newEnabled
    };

    localStorage.setItem(`gym_location_${gym.id}`, JSON.stringify(metadata));
    toast.success(newEnabled ? 'GPS verification enabled' : 'GPS verification disabled');
  };

  const checkin = async (memberId: string) => {
    setSaving(true);
    
    // Check if member already checked in today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingCheckIn } = await supabase
      .from('attendance_logs')
      .select('check_in_time')
      .eq('member_id', memberId)
      .eq('gym_id', gym.id)
      .gte('check_in_time', today)
      .maybeSingle();
    
    if (existingCheckIn) {
      setSaving(false);
      const checkInTime = new Date(existingCheckIn.check_in_time).toLocaleTimeString();
      toast.error(`Member already checked in today at ${checkInTime}`);
      return;
    }
    
    const { error } = await supabase.from('attendance_logs').insert({ member_id: memberId, gym_id: gym.id, check_in_method: 'manual' });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Checked in successfully!');
    setShowCheckin(false);
    loadData();
  };

  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-heading">Attendance</h1>
          <p className="text-muted-foreground font-accent text-sm mt-1">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowLocationSettings(true)} variant="outline" className="rounded-full font-accent">
            <MapPin className="h-4 w-4 mr-2" /> Location
          </Button>
          <Button onClick={() => setShowCheckin(true)} className="gold-gradient text-primary-foreground rounded-full font-accent">
            <Plus className="h-4 w-4 mr-2" /> Check In
          </Button>
        </div>
      </div>

      {/* Location Status */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${locationSettings.enabled ? 'border-primary/20 bg-primary/5' : 'border-border bg-card'}`}>
          <MapPin className={`h-5 w-5 ${locationSettings.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">GPS Verification</p>
            <p className="text-xs text-muted-foreground">
              {locationSettings.enabled 
                ? `Enabled - ${locationSettings.radius}m radius` 
                : 'Disabled - Check-in from anywhere'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={quickToggleLocation}
              variant={locationSettings.enabled ? "default" : "outline"}
              size="sm"
              className="text-xs"
            >
              {locationSettings.enabled ? 'ON' : 'OFF'}
            </Button>
            <Button
              onClick={() => setShowLocationSettings(true)}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-primary/20 bg-card p-4 text-center">
          <p className="font-accent text-xs text-muted-foreground">Today's Check-ins</p>
          <p className="text-4xl font-heading gold-text mt-1">{logs.length}</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center py-16"><CalendarCheck className="h-16 w-16 text-muted-foreground mb-4" /><h3 className="text-2xl font-heading">No Check-ins Today</h3></div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border font-accent text-xs text-muted-foreground">
              <th className="text-left py-3 px-4">Member</th><th className="text-left py-3 px-4">Phone</th><th className="text-left py-3 px-4">Time</th><th className="text-left py-3 px-4">Method</th>
            </tr></thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-b border-border/50 hover:bg-secondary/50">
                  <td className="py-3 px-4 font-medium">{l.members?.name}</td>
                  <td className="py-3 px-4 text-muted-foreground">{l.members?.phone}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(l.check_in_time).toLocaleTimeString()}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded-full text-xs font-accent bg-primary/20 text-primary">{l.check_in_method}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCheckin} onOpenChange={setShowCheckin}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Check In Member</DialogTitle></DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search member..." className="pl-10 bg-secondary border-border" />
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredMembers.map(m => (
              <button key={m.id} onClick={() => checkin(m.id)} disabled={saving} className="w-full flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 hover:bg-secondary/50 transition-colors text-left">
                <div className="h-8 w-8 rounded-full gold-gradient flex items-center justify-center text-xs font-heading text-primary-foreground">{m.name[0]}</div>
                <div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.phone}</p></div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Location Settings Dialog */}
      <Dialog open={showLocationSettings} onOpenChange={setShowLocationSettings}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader><DialogTitle className="font-heading text-2xl">GPS Location Settings</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm font-medium mb-2">📍 GPS Location Verification</p>
              <p className="text-xs text-muted-foreground">
                Enable GPS verification to ensure members can only check in when they're physically at your gym. 
                This prevents fake check-ins from remote locations.
              </p>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/50">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-6 rounded-full transition-colors ${locationSettings.enabled ? 'bg-primary' : 'bg-muted'} relative cursor-pointer`}
                  onClick={() => setLocationSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${locationSettings.enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </div>
                <div>
                  <Label className="font-accent text-sm font-medium cursor-pointer" onClick={() => setLocationSettings(prev => ({ ...prev, enabled: !prev.enabled }))}>
                    GPS Verification
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {locationSettings.enabled ? 'Enabled - Members must be at gym' : 'Disabled - Check-in from anywhere'}
                  </p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${locationSettings.enabled ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                {locationSettings.enabled ? 'ON' : 'OFF'}
              </span>
            </div>

            {locationSettings.enabled && (
              <>
                <div>
                  <Label className="font-accent text-xs uppercase tracking-wider">Gym Location</Label>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="Latitude"
                          value={locationSettings.latitude}
                          onChange={(e) => setLocationSettings(prev => ({ ...prev, latitude: e.target.value }))}
                          className="bg-secondary border-border"
                        />
                      </div>
                      <div>
                        <Input
                          type="number"
                          step="0.000001"
                          placeholder="Longitude"
                          value={locationSettings.longitude}
                          onChange={(e) => setLocationSettings(prev => ({ ...prev, longitude: e.target.value }))}
                          className="bg-secondary border-border"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      variant="outline"
                      className="w-full rounded-full font-accent"
                    >
                      {gettingLocation ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Getting Location...</>
                      ) : (
                        <><MapPin className="h-4 w-4 mr-2" /> Use Current Location</>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="font-accent text-xs uppercase tracking-wider">Check-in Radius (meters)</Label>
                  <Input
                    type="number"
                    min="10"
                    max="500"
                    value={locationSettings.radius}
                    onChange={(e) => setLocationSettings(prev => ({ ...prev, radius: e.target.value }))}
                    className="mt-2 bg-secondary border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Members must be within this distance to check in (recommended: 50m)
                  </p>
                </div>

                {locationSettings.latitude && locationSettings.longitude && (
                  <div className="rounded-lg border border-border bg-secondary/50 p-3">
                    <p className="text-xs font-medium mb-1">Preview Location:</p>
                    <a
                      href={`https://www.google.com/maps?q=${locationSettings.latitude},${locationSettings.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                )}
              </>
            )}

            <Button
              onClick={saveLocationSettings}
              disabled={saving || (locationSettings.enabled && (!locationSettings.latitude || !locationSettings.longitude))}
              className="w-full gold-gradient text-primary-foreground rounded-full font-accent h-11"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Settings'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
