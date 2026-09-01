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
    <div className="relative min-h-[calc(100vh-6rem)] md:min-h-[80vh] flex flex-col justify-between overflow-hidden bg-slate-900 text-[#0F172A] dark:text-white rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-lg">
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
        {/* Soft gradient for high contrast UI readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8f9ff]/75 dark:from-[#0F172A]/80 via-transparent to-[#f8f9ff]/85 dark:to-[#0F172A]/90 pointer-events-none" />
      </div>

      {/* Top Navigation & Live GPS Status Header */}
      <header className="relative z-10 w-full flex flex-wrap justify-between items-center gap-2 px-3.5 md:px-5 py-2.5 backdrop-blur-md bg-white/85 dark:bg-[#151D2A]/85 border-b border-[#E2E8F0]/80 dark:border-[#1E293B]/80">
        {/* GPS Status Indicator */}
        <div className="flex items-center gap-1.5">
          {renderGpsStatusBadge()}

          {/* Mode Switcher Pill (Live Hardware GPS vs Simulation Test) */}
          <button
            onClick={() => setUseSimulationMode(!useSimulationMode)}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
              useSimulationMode
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-white/90 dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] border-[#E2E8F0] dark:border-[#334155] hover:text-[#0F172A] dark:hover:text-white'
            }`}
            title="Toggle simulated movement for indoor testing"
          >
            {useSimulationMode ? 'Indoor Test ON' : 'Live GPS'}
          </button>
        </div>

        {/* Sport Type Selector & App Brand */}
        <div className="flex items-center gap-2">
          {status === 'idle' ? (
            <div className="flex items-center bg-white/95 dark:bg-[#1E293B] p-0.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
              <button
                onClick={() => setSportType('run')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                  sportType === 'run' ? 'bg-[#FF5600] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Zap className="w-3 h-3" /> Run
              </button>
              <button
                onClick={() => setSportType('ride')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                  sportType === 'ride' ? 'bg-[#FF5600] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Bike className="w-3 h-3" /> Ride
              </button>
              <button
                onClick={() => setSportType('walk')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md flex items-center gap-1 transition-colors ${
                  sportType === 'walk' ? 'bg-[#FF5600] text-white shadow-xs' : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                <Footprints className="w-3 h-3" /> Walk
              </button>
            </div>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-[#FF5600] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {sportType}
            </span>
          )}

          <span className="font-black text-sm italic tracking-tight text-[#FF5600] hidden sm:inline">
            VELOCITY
          </span>
        </div>
      </header>

      {/* Geolocation Permission Alert Prompt if Denied */}
      {gpsState === 'denied' && (
        <div className="relative z-10 mx-3 md:mx-6 mt-2 bg-red-50/95 dark:bg-red-950/90 backdrop-blur-md border border-red-200 dark:border-red-800 rounded-lg p-2.5 flex items-center justify-between text-red-900 dark:text-red-200 text-xs shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>
              <strong>Location Access Required:</strong> Please allow location permissions in your browser to record GPS accurately.
            </span>
          </div>
          <button
            onClick={requestGpsPosition}
            className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-md shrink-0 hover:bg-red-700 transition-colors text-[11px] ml-2"
          >
            Allow GPS
          </button>
        </div>
      )}

      {/* Main Center Canvas: Primary Distance HUD */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-4 my-auto">
        <div className="text-center bg-white/90 dark:bg-[#151D2A]/90 backdrop-blur-xl rounded-2xl p-5 md:p-7 border border-[#E2E8F0] dark:border-[#1E293B] shadow-xl max-w-sm w-full">
          <span className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-widest mb-0.5">
            GPS DISTANCE
          </span>
          <div className="flex items-baseline justify-center gap-1.5">
            <span className="text-5xl md:text-6xl font-black leading-none text-[#0059b0] dark:text-blue-400 tracking-tight font-mono">
              {distFormatted.value}
            </span>
            <span className="text-lg font-bold text-[#64748B] dark:text-[#94A3B8]">{distFormatted.unit}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1.5 font-medium">
            <MapPin className="w-3 h-3 text-[#FF5600]" />
            <span className="truncate max-w-[240px]">{resolvedLocationName}</span>
          </div>

          {status === 'idle' && (
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] pt-2.5">
              Press <strong>Start</strong> below to begin real GPS route tracking.
            </p>
          )}
        </div>
      </main>

      {/* Secondary Metrics Card + Live Controls */}
      <footer className="relative z-10 px-3 md:px-6 pb-6 pt-1 max-w-xl mx-auto w-full">
        {/* Secondary 3-Metric Glass Grid */}
        <div className="grid grid-cols-3 gap-1.5 bg-white/95 dark:bg-[#151D2A]/95 backdrop-blur-xl rounded-xl p-3 md:p-3.5 border border-[#E2E8F0] dark:border-[#1E293B] shadow-md mb-4">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-[#0059b0] dark:text-blue-400 mb-0.5">
              <Timer className="w-3 h-3" />
              <span className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                TIME
              </span>
            </div>
            <span className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white font-mono">
              {formatTime(seconds)}
            </span>
          </div>

          <div className="flex flex-col items-center text-center border-x border-[#E2E8F0] dark:border-[#1E293B] px-1">
            <div className="flex items-center gap-1 text-[#0059b0] dark:text-blue-400 mb-0.5">
              <Zap className="w-3 h-3" />
              <span className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                {sportType === 'ride' ? 'SPEED' : 'PACE'}
              </span>
            </div>
            <span className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white font-mono">
              {getPaceDisplay()}
            </span>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1 text-red-500 mb-0.5">
              <Heart className="w-3 h-3 fill-red-500 animate-pulse" />
              <span className="text-[9px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                BPM
              </span>
            </div>
            <span className="text-base sm:text-lg font-black text-[#0F172A] dark:text-white font-mono">
              {status === 'recording' ? heartRate : '--'}
            </span>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex justify-center items-center gap-4">
          {status === 'idle' ? (
            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-full border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#151D2A] text-[#64748B] dark:text-[#94A3B8] font-bold text-xs hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-all shadow-xs"
              >
                Exit
              </button>

              <button
                onClick={handleStart}
                className="w-16 h-16 rounded-full bg-[#FF5600] text-white flex items-center justify-center hover:bg-[#E04D00] transition-all shadow-[0_4px_16px_rgba(255,86,0,0.35)] hover:scale-105 active:scale-95 duration-150"
              >
                <div className="flex flex-col items-center">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">START</span>
                </div>
              </button>
            </div>
          ) : (
            <>
              {/* Stop & Finish Button */}
              <button
                onClick={handleFinish}
                className="w-12 h-12 rounded-full border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#151D2A] text-[#0F172A] dark:text-white flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 transition-colors shadow-xs active:scale-95"
                title="Finish workout"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>

              {/* Pause / Resume Button */}
              {status === 'recording' ? (
                <button
                  onClick={handlePause}
                  className="w-16 h-16 rounded-full bg-[#0059b0] text-white flex items-center justify-center hover:bg-[#00488f] transition-all shadow-[0_4px_16px_rgba(0,89,176,0.35)] hover:scale-105 active:scale-95 duration-150"
                  title="Pause workout"
                >
                  <Pause className="w-6 h-6 fill-white" />
                </button>
              ) : (
                <button
                  onClick={handleResume}
                  className="w-16 h-16 rounded-full bg-[#FF5600] text-white flex items-center justify-center hover:bg-[#E04D00] transition-all shadow-[0_4px_16px_rgba(255,86,0,0.35)] hover:scale-105 active:scale-95 duration-150"
                  title="Resume workout"
                >
                  <Play className="w-6 h-6 fill-white ml-0.5" />
                </button>
              )}

              {/* Photo Capture Button */}
              <button
                onClick={handleCapturePhoto}
                className="w-12 h-12 rounded-full border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#151D2A] text-[#0F172A] dark:text-white flex items-center justify-center hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors shadow-xs active:scale-95 relative"
                title="Take photo"
              >
                <Camera className="w-4 h-4" />
                {capturedPhotos.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-[#FF5600] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {capturedPhotos.length}
                  </span>
                )}
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Finish & Save Workout Modal */}
      {status === 'finishing' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-[#151D2A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl p-5 md:p-6 max-w-md w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#0F172A] dark:text-white">Complete Workout?</h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                You tracked <span className="font-bold text-[#0F172A] dark:text-white">{distFormatted.full}</span> in{' '}
                <span className="font-bold text-[#0F172A] dark:text-white">{formatTime(seconds)}</span> across{' '}
                <span className="font-bold text-[#0F172A] dark:text-white">{resolvedLocationName}</span>.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                  Activity Title
                </label>
                <input
                  type="text"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  placeholder="e.g. Morning River Trail Run"
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-1.5 text-[#0F172A] dark:text-white text-xs focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                  Workout Description / Notes
                </label>
                <textarea
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="How did your workout feel? Any personal bests?"
                  rows={2}
                  className="w-full bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg px-3 py-1.5 text-[#0F172A] dark:text-white text-xs focus:outline-none focus:border-[#FF5600]"
                />
              </div>

              {/* Recorded Splits Snapshot */}
              {splits.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                    Recorded Splits ({splits.length})
                  </label>
                  <div className="bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#334155] rounded-lg p-2 max-h-24 overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#334155]">
                    {splits.map((s, idx) => (
                      <div key={idx} className="flex justify-between text-[11px] py-0.5">
                        <span className="font-semibold text-[#0F172A] dark:text-white">KM {s.split}</span>
                        <span className="font-mono text-[#0059b0] dark:text-blue-400">{s.pace}</span>
                        <span className="text-[#64748B] dark:text-[#94A3B8]">{s.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {capturedPhotos.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase mb-1">
                    Captured Photos ({capturedPhotos.length})
                  </label>
                  <div className="flex gap-1.5 overflow-x-auto py-1">
                    {capturedPhotos.map((p, idx) => (
                      <img
                        key={idx}
                        src={p}
                        alt="Captured"
                        className="w-12 h-12 object-cover rounded-lg border border-[#E2E8F0] dark:border-[#334155]"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => setStatus('recording')}
                className="py-2 rounded-lg border border-[#E2E8F0] dark:border-[#334155] font-bold text-xs text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleSaveAndExit}
                className="py-2 rounded-lg bg-[#FF5600] text-white font-bold text-xs hover:bg-[#E04D00] shadow-xs transition-colors flex items-center justify-center gap-1.5"
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
