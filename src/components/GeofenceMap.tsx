
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2 } from 'lucide-react';
import { geolocationService, Location, Job } from '@/services/geolocationService';

interface GeofenceMapProps {
  userLocation: Location | null;
  jobs: Job[];
  filteredJobs: Job[];
  className?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

const GeofenceMap: React.FC<GeofenceMapProps> = ({ 
  userLocation, 
  jobs, 
  filteredJobs,
  className = "" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Check if Leaflet is loaded
    if (typeof window !== 'undefined' && window.L) {
      setMapReady(true);
    }
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !userLocation) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapRef.current).setView(
        [userLocation.latitude, userLocation.longitude], 
        13
      );

      // Add OpenStreetMap tiles (free)
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing layers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Circle) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add user location marker
    const userIcon = window.L.divIcon({
      className: 'user-location-marker',
      html: '<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    window.L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
      .addTo(mapInstanceRef.current)
      .bindPopup('Your Location');

    // Add geofence circle (5km radius)
    window.L.circle([userLocation.latitude, userLocation.longitude], {
      color: '#8b5cf6',
      fillColor: '#8b5cf6',
      fillOpacity: 0.1,
      radius: 5000 // 5km in meters
    }).addTo(mapInstanceRef.current);

    // Add job markers
    jobs.forEach(job => {
      const isFiltered = filteredJobs.some(fJob => fJob.id === job.id);
      const icon = window.L.divIcon({
        className: 'job-marker',
        html: `<div style="background: ${isFiltered ? '#10b981' : '#ef4444'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6]
      });

      window.L.marker([job.latitude, job.longitude], { icon })
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `<strong>${job.title}</strong><br/>
           ${job.provider}<br/>
           ${job.price}/hour<br/>
           ${isFiltered ? 'Within range' : 'Out of range'}`
        );
    });

    // Update map view
    mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 13);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [mapReady, userLocation, jobs, filteredJobs]);

  if (!mapReady) {
    return (
      <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className}`}>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${className} ${
      isExpanded ? 'fixed inset-4 z-50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <MapPin className="w-5 h-5 mr-2 text-neighborlly-purple" />
            Geofence Map (5km radius)
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-xl"
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className={`w-full ${isExpanded ? 'h-96' : 'h-64'} rounded-b-lg`}
        />
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span>Your Location</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Jobs in Range ({filteredJobs.length})</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Out of Range ({jobs.length - filteredJobs.length})</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeofenceMap;
