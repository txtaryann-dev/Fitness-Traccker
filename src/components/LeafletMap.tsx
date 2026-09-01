import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Compass, Layers, LocateFixed, Map as MapIcon } from 'lucide-react';
import { LatLng } from '../types';

export type MapTileStyle = 'streets' | 'satellite' | 'outdoors';

interface LeafletMapProps {
  coordinates: LatLng[];
  interactive?: boolean;
  height?: string;
  className?: string;
  showLiveMarker?: boolean;
  liveCurrentPosition?: LatLng | null;
  accuracyRadius?: number; // in meters
  heading?: number | null; // in degrees
  mapId?: string;
  enableLayerSwitcher?: boolean;
  enableRecenterButton?: boolean;
  onRecenter?: () => void;
}

const TILE_LAYERS: Record<MapTileStyle, { url: string; maxZoom: number; subdomains?: string; attribution?: string }> = {
  streets: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    maxZoom: 19,
    subdomains: 'abcd',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 19,
  },
  outdoors: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    maxZoom: 19,
  },
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  coordinates,
  interactive = false,
  height = '280px',
  className = '',
  showLiveMarker = false,
  liveCurrentPosition = null,
  accuracyRadius = 0,
  heading = null,
  mapId,
  enableLayerSwitcher = false,
  enableRecenterButton = false,
  onRecenter,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const liveMarkerRef = useRef<L.CircleMarker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const headingMarkerRef = useRef<L.Marker | null>(null);
  const startMarkerRef = useRef<L.CircleMarker | null>(null);
  const finishMarkerRef = useRef<L.CircleMarker | null>(null);

  const [activeStyle, setActiveStyle] = useState<MapTileStyle>('streets');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [isFollowingGps, setIsFollowingGps] = useState(true);

  const fallbackCenter: [number, number] =
    liveCurrentPosition
      ? [liveCurrentPosition.lat, liveCurrentPosition.lng]
      : coordinates.length > 0
      ? [coordinates[0].lat, coordinates[0].lng]
      : [27.7172, 85.324];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: fallbackCenter,
      zoom: 16,
      zoomControl: false,
      dragging: interactive,
      touchZoom: interactive,
      doubleClickZoom: interactive,
      scrollWheelZoom: interactive,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Set initial tile layer
    const layerConfig = TILE_LAYERS[activeStyle];
    const tileLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || 'abc',
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Detect user manual dragging to disable auto-pan follow mode
    if (interactive) {
      map.on('dragstart', () => {
        setIsFollowingGps(false);
      });
    }

    // Resize observer to ensure no tile grid clipping
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Style Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const layerConfig = TILE_LAYERS[activeStyle];
    const newLayer = L.tileLayer(layerConfig.url, {
      maxZoom: layerConfig.maxZoom,
      subdomains: layerConfig.subdomains || 'abc',
    }).addTo(map);
    tileLayerRef.current = newLayer;
  }, [activeStyle]);

  // Update Route Polyline & Start/End Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }
    if (startMarkerRef.current) {
      map.removeLayer(startMarkerRef.current);
      startMarkerRef.current = null;
    }
    if (finishMarkerRef.current) {
      map.removeLayer(finishMarkerRef.current);
      finishMarkerRef.current = null;
    }

    if (coordinates && coordinates.length > 1) {
      const latlngs: [number, number][] = coordinates.map((c) => [c.lat, c.lng]);

      const polyline = L.polyline(latlngs, {
        color: '#FF5600',
        weight: 5,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      polylineRef.current = polyline;

      // Start pin (green dot with outer halo)
      const start = latlngs[0];
      const startMarker = L.circleMarker(start, {
        radius: 7,
        fillColor: '#10B981',
        fillOpacity: 1,
        color: '#FFFFFF',
        weight: 2.5,
      }).addTo(map);
      startMarkerRef.current = startMarker;

      // Finish pin (orange dot with outer halo)
      if (!showLiveMarker) {
        const end = latlngs[latlngs.length - 1];
        const finishMarker = L.circleMarker(end, {
          radius: 7,
          fillColor: '#FF5600',
          fillOpacity: 1,
          color: '#FFFFFF',
          weight: 2.5,
        }).addTo(map);
        finishMarkerRef.current = finishMarker;

        try {
          map.fitBounds(polyline.getBounds(), {
            padding: [30, 30],
            maxZoom: 16,
          });
        } catch {
          // ignore bounds calc error during transitions
        }
      }
    } else if (coordinates && coordinates.length === 1 && !showLiveMarker) {
      map.setView([coordinates[0].lat, coordinates[0].lng], 16);
    }
  }, [coordinates, showLiveMarker]);

  // Update Live GPS Location Marker & Accuracy Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (showLiveMarker && liveCurrentPosition) {
      const pos: [number, number] = [liveCurrentPosition.lat, liveCurrentPosition.lng];

      // Accuracy circle
      if (accuracyRadius && accuracyRadius > 0) {
        if (!accuracyCircleRef.current) {
          accuracyCircleRef.current = L.circle(pos, {
            radius: Math.min(100, Math.max(accuracyRadius, 8)),
            color: '#0059b0',
            weight: 1,
            fillColor: '#0059b0',
            fillOpacity: 0.12,
          }).addTo(map);
        } else {
          accuracyCircleRef.current.setLatLng(pos);
          accuracyCircleRef.current.setRadius(Math.min(100, Math.max(accuracyRadius, 8)));
        }
      } else if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }

      // Live Center Marker
      if (!liveMarkerRef.current) {
        liveMarkerRef.current = L.circleMarker(pos, {
          radius: 9,
          fillColor: '#0059b0',
          fillOpacity: 1,
          color: '#FFFFFF',
          weight: 3,
        }).addTo(map);
      } else {
        liveMarkerRef.current.setLatLng(pos);
      }

      // Directional Heading Indicator
      if (heading !== null && heading !== undefined) {
        const headingIcon = L.divIcon({
          className: 'gps-heading-icon',
          html: `<div style="transform: rotate(${heading}deg); transform-origin: center;" class="w-8 h-8 flex items-center justify-center -ml-4 -mt-4 pointer-events-none">
            <svg viewBox="0 0 24 24" width="28" height="28" class="text-[#0059b0] drop-shadow-md">
              <path d="M12 2L4 20L12 16L20 20L12 2Z" fill="#0059b0" stroke="#ffffff" stroke-width="1.5"/>
            </svg>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        if (!headingMarkerRef.current) {
          headingMarkerRef.current = L.marker(pos, { icon: headingIcon, zIndexOffset: 1000 }).addTo(map);
        } else {
          headingMarkerRef.current.setLatLng(pos);
          headingMarkerRef.current.setIcon(headingIcon);
        }
      } else if (headingMarkerRef.current) {
        map.removeLayer(headingMarkerRef.current);
        headingMarkerRef.current = null;
      }

      // Auto-follow GPS position smoothly
      if (isFollowingGps) {
        map.panTo(pos, { animate: true, duration: 0.5 });
      }
    } else {
      if (liveMarkerRef.current) {
        map.removeLayer(liveMarkerRef.current);
        liveMarkerRef.current = null;
      }
      if (accuracyCircleRef.current) {
        map.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
      if (headingMarkerRef.current) {
        map.removeLayer(headingMarkerRef.current);
        headingMarkerRef.current = null;
      }
    }
  }, [showLiveMarker, liveCurrentPosition, accuracyRadius, heading, isFollowingGps]);

  const handleRecenter = () => {
    setIsFollowingGps(true);
    const map = mapInstanceRef.current;
    if (map && liveCurrentPosition) {
      map.setView([liveCurrentPosition.lat, liveCurrentPosition.lng], 16, { animate: true });
    } else if (map && coordinates.length > 0) {
      map.setView([coordinates[coordinates.length - 1].lat, coordinates[coordinates.length - 1].lng], 16, {
        animate: true,
      });
    }
    if (onRecenter) onRecenter();
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height, width: '100%' }}>
      <div
        ref={mapContainerRef}
        id={mapId}
        style={{ height: '100%', width: '100%' }}
        className="relative z-0 bg-[#eff4ff]"
      />

      {/* Floating Map Controls overlay when interactive or enabled */}
      {interactive && (
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 pointer-events-auto">
          {/* Layer Style Switcher */}
          {enableLayerSwitcher && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStyleMenu(!showStyleMenu)}
                className="w-9 h-9 rounded-lg bg-white/95 backdrop-blur-md border border-[#E2E8F0] shadow-md flex items-center justify-center text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
                title="Change Map Style"
              >
                <Layers className="w-4 h-4" />
              </button>

              {showStyleMenu && (
                <div className="absolute right-0 mt-1.5 w-36 bg-white rounded-xl border border-[#E2E8F0] shadow-xl p-1.5 flex flex-col gap-1 z-30 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStyle('streets');
                      setShowStyleMenu(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left transition-colors ${
                      activeStyle === 'streets' ? 'bg-[#FF5600] text-white' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    Street Map
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStyle('satellite');
                      setShowStyleMenu(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left transition-colors ${
                      activeStyle === 'satellite' ? 'bg-[#FF5600] text-white' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    Satellite View
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStyle('outdoors');
                      setShowStyleMenu(false);
                    }}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg text-left transition-colors ${
                      activeStyle === 'outdoors' ? 'bg-[#FF5600] text-white' : 'text-[#0F172A] hover:bg-[#F1F5F9]'
                    }`}
                  >
                    OpenStreet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Recenter & Follow GPS Button */}
          {enableRecenterButton && (
            <button
              type="button"
              onClick={handleRecenter}
              className={`w-9 h-9 rounded-lg border shadow-md flex items-center justify-center transition-all ${
                isFollowingGps
                  ? 'bg-[#0059b0] text-white border-[#0059b0]'
                  : 'bg-white/95 text-[#64748B] border-[#E2E8F0] hover:text-[#0F172A]'
              }`}
              title={isFollowingGps ? 'Locking on GPS Position' : 'Recenter on my GPS'}
            >
              <LocateFixed className="w-4 h-4" />
            </button>
          )}

          {/* Zoom In / Out */}
          <div className="flex flex-col rounded-lg overflow-hidden border border-[#E2E8F0] shadow-md bg-white/95 backdrop-blur-md">
            <button
              type="button"
              onClick={handleZoomIn}
              className="w-9 h-8 flex items-center justify-center text-[#0F172A] font-bold text-base hover:bg-[#F1F5F9] border-b border-[#E2E8F0]"
              title="Zoom in"
            >
              +
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="w-9 h-8 flex items-center justify-center text-[#0F172A] font-bold text-base hover:bg-[#F1F5F9]"
              title="Zoom out"
            >
              −
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
