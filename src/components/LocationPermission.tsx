
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

interface LocationPermissionProps {
  onLocationGranted: () => void;
  onLocationDenied: (error: string) => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({
  onLocationGranted,
  onLocationDenied
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          onLocationGranted();
        },
        (error) => {
          setIsLoading(false);
          let errorMessage = 'Failed to get location';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.';
              break;
          }
          
          setError(errorMessage);
          onLocationDenied(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      onLocationDenied(errorMessage);
    }
  };

  return (
    <Card className="max-w-lg mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-neighborlly-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-neighborlly-purple" />
        </div>
        <CardTitle className="text-xl">Enable Location Access</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-gray-600">
          To show you jobs within 5km of your location, we need access to your current position.
        </p>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={requestLocation}
            disabled={isLoading}
            className="w-full bg-gradient-neighborlly hover:opacity-90 rounded-xl"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Getting Location...
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Allow Location Access
              </>
            )}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p>🔒 Your location data is only used locally and never stored on our servers.</p>
            <p>📍 We only track your general area to show nearby jobs.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationPermission;
