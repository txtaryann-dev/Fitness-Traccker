import React, { useEffect, useRef, useState } from 'react';
import {
  Activity as ActivityIcon,
  AlertCircle,
  Bike,
  Camera,
  CheckCircle2,
  Compass,
  Footprints,
  Heart,
  Layers,
  LocateFixed,
  MapPin,
  Mountain,
  Navigation,
  Pause,
  Play,
  RotateCcw,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Sparkles,
  Square,
  Timer,
  Zap,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Activity, LatLng, PacePoint, Split, SportType } from '../types';
import {
  calculateBearing,
  calculateHaversineDistanceKm,
  isGpsPointValid,
  reverseGeocodeLocation,
} from '../utils/geoUtils';
import { LeafletMap } from './LeafletMap';

interface WorkoutTrackerProps {
  onFinishWorkout: (newActivity: Activity) => void;
  onCancel: () => void;
}

type GpsSignalState = 'searching' | 'locked' | 'weak' | 'denied' | 'unsupported';

export const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({
  onFinishWorkout,
  onCancel,
}) => {
  const { currentUser, unitSystem, formatDistance, addActivity } = useApp();

  // State
  const [sportType, setSportType] = useState<SportType>('run');
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'finishing'>('idle');
  const [seconds, setSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [heartRate, setHeartRate] = useState(142);
  const [calories, setCalories] = useState(0);
  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [currentPosition, setCurrentPosition] = useState<LatLng>({
    lat: 40.758,
    lng: -73.9855,
  });
  const [accuracyRadius, setAccuracyRadius] = useState<number>(10);
  const [heading, setHeading] = useState<number | null>(null);
  const [gpsState, setGpsState] = useState<GpsSignalState>('searching');
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [resolvedLocationName, setResolvedLocationName] = useState<string>('Detecting location...');
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [workoutTitle, setWorkoutTitle] = useState('Morning Workout');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [splits, setSplits] = useState<Split[]>([]);
  const [paceHistory, setPaceHistory] = useState<PacePoint[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const lastRecordedPointRef = useRef<LatLng | null>(null);
  const lastRecordedTimeRef = useRef<number>(Date.now());
  const lastAltitudeRef = useRef<number | null>(null);
  const lastSplitDistanceRef = useRef<number>(0);
  const simStepRef = useRef(0);

  // Initialize and Acquire Real Hardware GPS on mount
  const requestGpsPosition = () => {
    if (!('geolocation' in navigator)) {
      setGpsState('unsupported');
      return;
    }

    setGpsState('searching');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy;
        const alt = pos.coords.altitude;
        const speed = pos.coords.speed;
        const head = pos.coords.heading;

        const posObj = { lat, lng };
        setCurrentPosition(posObj);
        setAccuracyRadius(accuracy);
        setGpsAccuracyMeters(Math.round(accuracy));
        setHeading(head !== null && !isNaN(head) ? head : null);

        if (alt !== null && !isNaN(alt)) {
          lastAltitudeRef.current = alt;
        }

        if (accuracy <= 15) {
          setGpsState('locked');
        } else if (accuracy <= 40) {
          setGpsState('weak');
        } else {
          setGpsState('weak');
        }

        // Reverse geocode user's real GPS position
        try {
          const loc = await reverseGeocodeLocation(lat, lng);
          setResolvedLocationName(loc.fullLocation);
          const sportLabel = sportType.charAt(0).toUpperCase() + sportType.slice(1);
          setWorkoutTitle(`${loc.neighborhood || loc.city || 'Morning'} ${sportLabel}`);
        } catch {
          setResolvedLocationName('Local Area');
        }
      },
      (err) => {
        console.warn('Geolocation initial acquire error:', err.message);
        if (err.code === 1) {
          setGpsState('denied');
        } else {
          setGpsState('weak');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    requestGpsPosition();
  }, []);

  // Update default title whenever sportType changes
  useEffect(() => {
    if (status === 'idle') {
      const sportLabel = sportType.charAt(0).toUpperCase() + sportType.slice(1);
      const locPrefix = resolvedLocationName.split(',')[0] || 'Outdoor';
      setWorkoutTitle(`${locPrefix} ${sportLabel}`);
    }
  }, [sportType, resolvedLocationName, status]);

  // Real Hardware GPS Watcher during recording
  useEffect(() => {
    if (status === 'recording' && !useSimulationMode && 'geolocation' in navigator) {
      geoWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;
          const alt = pos.coords.altitude;
          const speed = pos.coords.speed;
          const head = pos.coords.heading;
          const newPos: LatLng = { lat, lng };

          setAccuracyRadius(accuracy);
          setGpsAccuracyMeters(Math.round(accuracy));

          if (accuracy <= 18) {
            setGpsState('locked');
          } else if (accuracy <= 45) {
            setGpsState('weak');
          }

          // Calculate Bearing / Heading
          if (head !== null && !isNaN(head)) {
            setHeading(head);
          } else if (lastRecordedPointRef.current) {
            const calculatedBearing = calculateBearing(lastRecordedPointRef.current, newPos);
            setHeading(calculatedBearing);
          }

          // Anti-drift & jitter validation
          const isValid = isGpsPointValid(
            newPos,
            lastRecordedPointRef.current,
            accuracy,
            speed
          );

          if (isValid) {
            setCurrentPosition(newPos);

            if (lastRecordedPointRef.current) {
              const deltaKm = calculateHaversineDistanceKm(
                lastRecordedPointRef.current,
                newPos
              );

              // Calculate speed from hardware or time delta
              let speedKmh = 0;
              if (speed !== null && !isNaN(speed) && speed > 0) {
                speedKmh = speed * 3.6;
              } else {
                const now = Date.now();
                const deltaHours = (now - lastRecordedTimeRef.current) / (1000 * 3600);
                if (deltaHours > 0) {
                  speedKmh = Math.min(65, deltaKm / deltaHours);
                }
                lastRecordedTimeRef.current = now;
              }

              setCurrentSpeedKmh(Number(speedKmh.toFixed(1)));

              // Update Total Distance
              setDistanceKm((prev) => {
                const updated = Number((prev + deltaKm).toFixed(3));

                // Check for 1km / 1mi split trigger
                const splitUnitStep = unitSystem === 'imperial' ? 1.60934 : 1.0;
                if (updated - lastSplitDistanceRef.current >= splitUnitStep) {
                  const splitNum = splits.length + 1;
                  const currentPaceStr = getPaceDisplay(updated, seconds);
                  setSplits((prevSplits) => [
                    ...prevSplits,
                    {
                      split: splitNum,
                      pace: currentPaceStr,
                      elevationChange: `+${Math.max(1, Math.round(elevationGain / splitNum))}m`,
                      time: formatTime(seconds),
                    },
                  ]);
                  lastSplitDistanceRef.current = updated;
                }

                return updated;
              });

              // Elevation Gain computation
              if (alt !== null && !isNaN(alt)) {
                if (lastAltitudeRef.current !== null) {
                  const altDiff = alt - lastAltitudeRef.current;
                  // Only accumulate true ascents > 1.5 meters to ignore barometric/GPS jitter
                  if (altDiff > 1.5) {
                    setElevationGain((prev) => prev + Math.round(altDiff));
                  }
                }
                lastAltitudeRef.current = alt;
              }

              setCoordinates((prev) => [...prev, newPos]);
            } else {
              setCoordinates([newPos]);
            }

            lastRecordedPointRef.current = newPos;
          }
        },
        (err) => {
          console.warn('GPS watch error:', err.message);
          if (err.code === 1) {
            setGpsState('denied');
          } else {
            setGpsState('weak');
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    } else if (geoWatchIdRef.current) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }

    return () => {
      if (geoWatchIdRef.current) {
        navigator.geolocation.clearWatch(geoWatchIdRef.current);
        geoWatchIdRef.current = null;
      }
    };
  }, [status, useSimulationMode, unitSystem, seconds, elevationGain, splits.length]);

  // Main Timer & Pace / Simulation Interval Loop
  useEffect(() => {
    if (status === 'recording') {
      timerRef.current = setInterval(() => {
        setSeconds((prevSec) => {
          const newSec = prevSec + 1;

          // Calories calculation based on sport MET values
          const metRate = sportType === 'ride' ? 8.5 : sportType === 'run' ? 10.0 : 4.0;
          const calBurnPerSec = (metRate * 70 * 3.5) / 200 / 60;
          setCalories((prevCal) => prevCal + calBurnPerSec);

          // Heart Rate simulation based on sport intensity
          setHeartRate((prevHr) => {
            const targetBase = sportType === 'ride' ? 145 : sportType === 'run' ? 158 : 115;
            const variance = Math.floor(Math.random() * 5 - 2);
            return Math.min(188, Math.max(90, targetBase + variance));
          });

          // Sample pace point for graph every 30 seconds
          if (newSec % 30 === 0) {
            const currentPaceNum =
              distanceKm > 0.05
                ? Number(((newSec / 60) / distanceKm).toFixed(2))
                : sportType === 'ride'
                ? 22.0
                : 5.0;

            setPaceHistory((prev) => [
              ...prev,
              {
                time: Math.round(newSec / 60),
                pace: currentPaceNum,
                elevation: 100 + elevationGain,
              },
            ]);
          }

          // Simulation Mode Step Handler (if user enabled simulated test movement)
          if (useSimulationMode) {
            const speedFactor = sportType === 'ride' ? 6.8 : sportType === 'run' ? 3.2 : 1.5; // m/s
            const deltaDistKm = (speedFactor * (1 + (Math.random() * 0.1 - 0.05))) / 1000;

            setDistanceKm((prev) => Number((prev + deltaDistKm).toFixed(3)));
            setCurrentSpeedKmh(Number((speedFactor * 3.6 + (Math.random() * 1.0 - 0.5)).toFixed(1)));

            if (Math.random() > 0.65) {
              setElevationGain((prev) => prev + Math.floor(Math.random() * 2));
            }

            // Move coordinates in an organic outdoor arc from current position
            simStepRef.current += 1;
            const stepRad = (simStepRef.current * 0.06);
            const radius = 0.0035;
            const newLat = currentPosition.lat + Math.sin(stepRad) * radius * 0.005;
            const newLng = currentPosition.lng + Math.cos(stepRad) * radius * 0.005;
            const simPos: LatLng = { lat: newLat, lng: newLng };

            if (lastRecordedPointRef.current) {
              const b = calculateBearing(lastRecordedPointRef.current, simPos);
              setHeading(b);
            }
            lastRecordedPointRef.current = simPos;
            setCurrentPosition(simPos);
            setCoordinates((prev) => [...prev, simPos]);
            setGpsState('locked');
            setGpsAccuracyMeters(4);
          }

          return newSec;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, sportType, useSimulationMode, distanceKm, elevationGain, currentPosition]);

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPaceDisplay = (dist: number = distanceKm, sec: number = seconds) => {
    if (sportType === 'ride') {
      const speed = unitSystem === 'imperial' ? currentSpeedKmh * 0.621371 : currentSpeedKmh;
      return `${speed > 0 ? speed.toFixed(1) : '0.0'} ${unitSystem === 'imperial' ? 'mph' : 'km/h'}`;
    }
    // Min/km or Min/mi
    if (dist <= 0.01 || sec <= 4) return '0:00';
    const paceSecondsPerKm = sec / dist;
    const finalPaceSeconds = unitSystem === 'imperial' ? paceSecondsPerKm * 1.60934 : paceSecondsPerKm;
    const paceMin = Math.floor(finalPaceSeconds / 60);
    const paceSec = Math.floor(finalPaceSeconds % 60);
    return `${paceMin}:${paceSec.toString().padStart(2, '0')} /${unitSystem === 'imperial' ? 'mi' : 'km'}`;
  };

  const distFormatted = formatDistance(distanceKm);

  const handleStart = () => {
    setStatus('recording');
    lastRecordedTimeRef.current = Date.now();
    lastRecordedPointRef.current = currentPosition;
    if (coordinates.length === 0) {
      setCoordinates([currentPosition]);
    }
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('recording');
    lastRecordedTimeRef.current = Date.now();
  };

  const handleCapturePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483721074577-036159670d8f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&auto=format&fit=crop&q=80',
    ];
    const picked = samplePhotos[capturedPhotos.length % samplePhotos.length];
    setCapturedPhotos((prev) => [...prev, picked]);
  };

  const handleFinish = () => {
    setStatus('finishing');
  };

  const handleSaveAndExit = () => {
    // Generate splits if not enough splits recorded
    const finalSplits = [...splits];
    const totalKm = Math.max(0.2, distanceKm);
    if (finalSplits.length === 0) {
      const splitCount = Math.max(1, Math.min(5, Math.ceil(totalKm)));
      for (let i = 1; i <= splitCount; i++) {
        finalSplits.push({
          split: i,
          pace: getPaceDisplay(totalKm, seconds),
          elevationChange: `+${Math.max(2, Math.floor(elevationGain / splitCount))}m`,
          time: formatTime(Math.floor((seconds / splitCount) * i)),
        });
      }
    }

    // Generate smoothed pace points for graph
    const finalPacePoints: PacePoint[] =
      paceHistory.length >= 3
        ? paceHistory
        : [
            { time: 1, pace: 4.8, elevation: 110 },
            { time: Math.max(2, Math.round(seconds / 120)), pace: 4.6, elevation: 110 + Math.round(elevationGain * 0.4) },
            { time: Math.max(3, Math.round(seconds / 60)), pace: 4.5, elevation: 110 + elevationGain },
          ];

    const finalRoute = coordinates.length >= 2 ? coordinates : [
      currentPosition,
      { lat: currentPosition.lat + 0.002, lng: currentPosition.lng + 0.003 },
      { lat: currentPosition.lat + 0.004, lng: currentPosition.lng + 0.001 },
    ];

    const activity = addActivity({
      title: workoutTitle || `${sportType.toUpperCase()} Workout`,
      description:
        workoutNotes ||
        `Recorded ${sportType.toUpperCase()} with high-accuracy live GPS (${resolvedLocationName}).`,
      sportType,
      distance: Number(totalKm.toFixed(2)),
      duration: Math.max(10, seconds),
      avgPace: getPaceDisplay(totalKm, seconds),
      elevationGain: Math.max(2, elevationGain),
      calories: Math.max(30, Math.round(calories)),
      avgHeartRate: heartRate,
      routeCoordinates: finalRoute,
      pacePoints: finalPacePoints,
      splits: finalSplits,
      photos: capturedPhotos,
      location: resolvedLocationName || 'Local Outdoor Route',
    });

    onFinishWorkout(activity);
  };

  const renderGpsStatusBadge = () => {
    switch (gpsState) {
      case 'locked':
        return (
          <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-full py-1 px-2.5 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <SignalHigh className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              GPS ±{gpsAccuracyMeters || 8}m
            </span>
          </div>
        );
      case 'weak':
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 rounded-full py-1 px-2.5 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 shadow-xs">
            <SignalMedium className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              GPS ±{gpsAccuracyMeters || 30}m
            </span>
          </div>
        );
      case 'denied':
        return (
          <button
            onClick={requestGpsPosition}
            className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/60 hover:bg-red-100 rounded-full py-1 px-2.5 border border-red-200 dark:border-red-800 shadow-xs transition-colors text-red-700 dark:text-red-300"
            title="Click to grant location permission"
          >
            <AlertCircle className="w-3 h-3 text-red-600 dark:text-red-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              GPS Blocked • Retry
            </span>
          </button>
        );
      case 'unsupported':
        return (
          <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 rounded-full py-1 px-2.5 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              No GPS
            </span>
          </div>
        );
      case 'searching':
      default:
        return (
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#151D2A]/95 rounded-full py-1 px-2.5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0059b0] animate-ping" />
            <SignalLow className="w-3 h-3 text-[#0059b0] dark:text-blue-400" />
            <span className="text-[10px] font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
              Acquiring GPS...
            </span>
          </div>
        );
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] md:min-h-[82vh] flex flex-col justify-between overflow-hidden bg-slate-950 text-[#0F172A] dark:text-white rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-slate-900/10">
      {/* Background Interactive Live Map with Real GPS Layer & Controls */}
      <div className="absolute inset-0 z-0 opacity-90">
        <LeafletMap
          coordinates={coordinates.length > 0 ? coordinates : [currentPosition]}
          interactive={true}
          height="100%"
          showLiveMarker={true}
          liveCurrentPosition={currentPosition}
          accuracyRadius={accuracyRadius}
          heading={heading}
          enableLayerSwitcher={true}
          enableRecenterButton={true}
          mapId="tracker-live-map"
        />
        {/* Soft subtle gradient for high contrast UI readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9ff]/70 dark:from-[#0B0F17]/75 via-transparent to-[#f8f9ff]/80 dark:to-[#0B0F17]/85 pointer-events-none" />
      </div>

      {/* Top Navigation & Live GPS Status Header */}
      <header className="relative z-10 w-full flex flex-wrap justify-between items-center gap-2 px-4 sm:px-6 py-3 backdrop-blur-xl bg-white/75 dark:bg-[#0B0F17]/75 border-b border-slate-200/60 dark:border-white/10 shadow-xs">
        {/* GPS Status Indicator */}
        <div className="flex items-center gap-2">
          {renderGpsStatusBadge()}

          {/* Mode Switcher Pill (Live Hardware GPS vs Simulation Test) */}
          <button
            onClick={() => setUseSimulationMode(!useSimulationMode)}
            className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-all shadow-xs ${
              useSimulationMode
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-white/90 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] border-slate-200/60 dark:border-white/10 hover:text-[#0F172A] dark:hover:text-white'
            }`}
            title="Toggle simulated movement for indoor testing"
          >
            {useSimulationMode ? 'Indoor Test ON' : 'Live GPS'}
          </button>
        </div>

        {/* Sport Type Selector & App Brand */}
        <div className="flex items-center gap-2.5">
          {status === 'idle' ? (
            <div className="flex items-center bg-slate-100/80 dark:bg-white/5 p-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-xs">
              <button
                onClick={() => setSportType('run')}
                className={`px-3 py-1 text-[11px] font-bold rounded-full flex items-center gap-1.5 transition-all ${
                  sportType === 'run' ? 'bg-[#FF5600] text-white shadow-sm shadow-orange-500/30' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" /> Run
              </button>
              <button
                onClick={() => setSportType('ride')}
                className={`px-3 py-1 text-[11px] font-bold rounded-full flex items-center gap-1.5 transition-all ${
                  sportType === 'ride' ? 'bg-[#FF5600] text-white shadow-sm shadow-orange-500/30' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Bike className="w-3 h-3" /> Ride
              </button>
              <button
                onClick={() => setSportType('walk')}
                className={`px-3 py-1 text-[11px] font-bold rounded-full flex items-center gap-1.5 transition-all ${
                  sportType === 'walk' ? 'bg-[#FF5600] text-white shadow-sm shadow-orange-500/30' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Footprints className="w-3 h-3" /> Walk
              </button>
            </div>
          ) : (
            <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#FF5600] to-orange-500 text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-orange-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {sportType}
            </span>
          )}

          <span className="font-black text-base italic tracking-tight bg-gradient-to-r from-[#FF5600] to-orange-500 bg-clip-text text-transparent hidden sm:inline">
            VELOCITY
          </span>
        </div>
      </header>

      {/* Geolocation Permission Alert Prompt if Denied */}
      {gpsState === 'denied' && (
        <div className="relative z-10 mx-4 sm:mx-6 mt-3 bg-red-50/90 dark:bg-red-950/80 backdrop-blur-xl border border-red-200 dark:border-red-800/60 rounded-2xl p-3 flex items-center justify-between text-red-900 dark:text-red-200 text-xs shadow-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              <strong>Location Access Required:</strong> Please allow location permissions in your browser to record GPS accurately.
            </span>
          </div>
          <button
            onClick={requestGpsPosition}
            className="px-3 py-1.5 bg-red-600 text-white font-bold rounded-xl shrink-0 hover:bg-red-700 transition-colors text-xs ml-2 shadow-xs"
          >
            Allow GPS
          </button>
        </div>
      )}

      {/* Main Center Canvas: Primary Distance HUD */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-6 my-auto">
        <div className="text-center bg-white/75 dark:bg-[#0B0F17]/75 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-slate-900/10 max-w-sm w-full hover:scale-[1.01] transition-all">
          <span className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-1">
            GPS DISTANCE
          </span>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-black leading-none text-[#0059b0] dark:text-blue-400 tracking-tight font-mono">
              {distFormatted.value}
            </span>
            <span className="text-xl font-bold text-[#64748B] dark:text-[#94A3B8]">{distFormatted.unit}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-[#64748B] dark:text-[#94A3B8] mt-2 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#FF5600] shrink-0" />
            <span className="truncate max-w-[240px]">{resolvedLocationName}</span>
          </div>

          {status === 'idle' && (
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-3.5 border-t border-slate-200/50 dark:border-white/5 pt-3 leading-relaxed">
              Press <strong>Start</strong> below to begin live GPS route tracking.
            </p>
          )}
        </div>
      </main>

      {/* Secondary Metrics Card + Live Controls */}
      <footer className="relative z-10 px-4 sm:px-6 pb-6 pt-1 max-w-xl mx-auto w-full">
        {/* Secondary 3-Metric Glass Grid */}
        <div className="grid grid-cols-3 gap-2 bg-white/75 dark:bg-[#0B0F17]/75 backdrop-blur-2xl rounded-2xl p-3.5 sm:p-4 border border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-900/5 dark:shadow-black/20 mb-5">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-[#0059b0] dark:text-blue-400 mb-1">
              <Timer className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                TIME
              </span>
            </div>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white font-mono">
              {formatTime(seconds)}
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-slate-200/50 dark:border-white/5 px-2">
            <div className="flex items-center gap-1.5 text-[#0059b0] dark:text-blue-400 mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {sportType === 'ride' ? 'SPEED' : 'PACE'}
              </span>
            </div>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white font-mono">
              {getPaceDisplay()}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 text-red-500 mb-1">
              <Heart className="w-3.5 h-3.5 fill-red-500 animate-pulse" />
              <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                BPM
              </span>
            </div>
            <span className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white font-mono">
              {status === 'recording' ? heartRate : '--'}
            </span>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex justify-center items-center gap-5">
          {status === 'idle' ? (
            <div className="flex items-center gap-4">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#64748B] dark:text-[#94A3B8] font-bold text-xs hover:bg-white dark:hover:bg-white/10 hover:text-[#0F172A] dark:hover:text-white transition-all shadow-xs hover:scale-105 active:scale-95"
              >
                Exit
              </button>

              <button
                onClick={handleStart}
                className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#E04D00] to-[#FF5600] text-white flex items-center justify-center hover:from-[#C94400] hover:to-[#E04D00] transition-all shadow-xl shadow-orange-500/40 hover:scale-105 active:scale-95"
              >
                <div className="flex flex-col items-center">
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                  <span className="text-[9px] font-extrabold uppercase tracking-widest mt-0.5">START</span>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Stop & Finish Button */}
              <button
                onClick={handleFinish}
                className="w-13 h-13 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#0F172A] dark:text-white flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-all shadow-md hover:scale-105 active:scale-95"
                title="Finish workout"
              >
                <Square className="w-5 h-5 fill-current" />
              </button>

              {/* Pause / Resume Button */}
              {status === 'recording' ? (
                <button
                  onClick={handlePause}
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#00488f] to-[#0059b0] text-white flex items-center justify-center hover:from-[#00376d] hover:to-[#00488f] transition-all shadow-xl shadow-blue-600/40 hover:scale-105 active:scale-95"
                  title="Pause workout"
                >
                  <Pause className="w-7 h-7 fill-white" />
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="w-18 h-18 rounded-full bg-gradient-to-tr from-[#E04D00] to-[#FF5600] text-white flex items-center justify-center hover:from-[#C94400] hover:to-[#E04D00] transition-all shadow-xl shadow-orange-500/40 hover:scale-105 active:scale-95"
                  title="Resume workout"
                >
                  <Play className="w-7 h-7 fill-white ml-0.5" />
                </button>
              )}

              {/* Photo Capture Button */}
              <button
                onClick={handleCapturePhoto}
                className="w-13 h-13 rounded-full border border-slate-200/60 dark:border-white/10 bg-white/80 dark:bg-white/5 text-[#0F172A] dark:text-white flex items-center justify-center hover:bg-white dark:hover:bg-white/10 transition-all shadow-md hover:scale-105 active:scale-95 relative"
                title="Take photo"
              >
                <Camera className="w-5 h-5" />
                {capturedPhotos.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#FF5600] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {capturedPhotos.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Finish & Save Workout Modal with Glassmorphism */}
      {status === 'finishing' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/90 dark:bg-[#151D2A]/90 backdrop-blur-2xl rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-2xl p-6 sm:p-7 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-white tracking-tight">Complete Workout?</h2>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] mt-1 leading-relaxed">
                You tracked <span className="font-bold text-[#0F172A] dark:text-white">{distFormatted.full}</span> in{' '}
                <span className="font-bold text-[#0F172A] dark:text-white">{formatTime(seconds)}</span> across{' '}
                <span className="font-bold text-[#0F172A] dark:text-white">{resolvedLocationName}</span>.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="e.g. Morning River Trail Run"
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl px-3.5 py-2 text-[#0F172A] dark:text-white text-xs focus:outline-none focus:border-[#FF5600] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                  Workout Description / Notes
                </label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="How did your workout feel? Any personal bests?"
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-xl px-3.5 py-2 text-[#0F172A] dark:text-white text-xs focus:outline-none focus:border-[#FF5600] transition-colors"
                />
              </div>

              {/* Recorded Splits Snapshot */}
              {splits.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                    Recorded Splits ({splits.length})
                  </label>
                  <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl p-2.5 max-h-24 overflow-y-auto divide-y divide-slate-200/50 dark:divide-white/5">
                    {splits.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] py-1">
                        <span className="font-semibold text-[#0F172A] dark:text-white">KM {s.split}</span>
                        <span className="font-mono font-bold text-[#0059b0] dark:text-blue-400">{s.pace}</span>
                        <span className="text-[#64748B] dark:text-[#94A3B8]">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {capturedPhotos.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                    Captured Photos ({capturedPhotos.length})
                  </label>
                  <div className="flex gap-2 overflow-x-auto py-1">
                    {capturedPhotos.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Captured"
                        className="w-14 h-14 object-cover rounded-xl border border-slate-200/60 dark:border-white/10 shadow-xs"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setStatus('recording')}
                className="py-2.5 rounded-xl border border-slate-200/60 dark:border-white/10 font-bold text-xs text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleSaveAndExit}
                className="py-2.5 rounded-xl bg-gradient-to-r from-[#FF5600] to-orange-500 text-white font-bold text-xs hover:from-[#E04D00] hover:to-[#FF5600] shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" /> Save & Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
