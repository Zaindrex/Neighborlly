
export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface GeofenceOptions {
  radius: number; // in kilometers
  center: Location;
}

export interface Job {
  id: string;
  title: string;
  provider: string;
  latitude: number;
  longitude: number;
  description?: string;
  price?: string;
  rating?: string;
  reviews?: number;
  category?: string;
  tags?: string[];
  distance?: string;
  [key: string]: any;
}

// Declare global turf types
declare global {
  interface Window {
    turf: {
      point: (coordinates: [number, number]) => any;
      distance: (from: any, to: any, options: { units: string }) => number;
    };
  }
}

export class GeolocationService {
  private watchId: number | null = null;
  private currentLocation: Location | null = null;
  private geofence: GeofenceOptions | null = null;
  private locationUpdateCallbacks: ((location: Location) => void)[] = [];
  private errorCallbacks: ((error: GeolocationPositionError) => void)[] = [];

  constructor() {
    this.checkGeolocationSupport();
  }

  private checkGeolocationSupport(): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return false;
    }
    return true;
  }

  async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          this.currentLocation = location;
          this.updateGeofence(location);
          resolve(location);
        },
        (error) => {
          console.error('Error getting location:', error);
          this.notifyErrorCallbacks(error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  startWatchingLocation(): void {
    if (!navigator.geolocation || this.watchId !== null) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };

        // Check if location has changed significantly (more than 100 meters)
        if (this.hasLocationChangedSignificantly(newLocation)) {
          this.currentLocation = newLocation;
          this.updateGeofence(newLocation);
          this.notifyLocationCallbacks(newLocation);
        }
      },
      (error) => {
        console.error('Error watching location:', error);
        this.notifyErrorCallbacks(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute
      }
    );
  }

  stopWatchingLocation(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  private hasLocationChangedSignificantly(newLocation: Location): boolean {
    if (!this.currentLocation) return true;

    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    return distance > 0.1; // 100 meters
  }

  private updateGeofence(location: Location): void {
    this.geofence = {
      radius: 5, // 5km radius
      center: location
    };
  }

  filterJobsByGeofence(jobs: Job[]): { withinRange: Job[]; outOfRange: Job[] } {
    if (!this.geofence || !this.currentLocation) {
      return { withinRange: jobs, outOfRange: [] };
    }

    const withinRange: Job[] = [];
    const outOfRange: Job[] = [];

    jobs.forEach(job => {
      if (this.isJobWithinGeofence(job)) {
        withinRange.push({
          ...job,
          distance: this.calculateDistance(
            this.currentLocation!.latitude,
            this.currentLocation!.longitude,
            job.latitude,
            job.longitude
          ).toFixed(1) + 'km'
        });
      } else {
        outOfRange.push(job);
      }
    });

    // Sort by distance
    withinRange.sort((a, b) => {
      const distanceA = parseFloat(a.distance?.replace('km', '') || '0');
      const distanceB = parseFloat(b.distance?.replace('km', '') || '0');
      return distanceA - distanceB;
    });

    return { withinRange, outOfRange };
  }

  private isJobWithinGeofence(job: Job): boolean {
    if (!this.geofence || !this.currentLocation) return false;

    // Use Turf.js for accurate geospatial calculations if available
    if (typeof window !== 'undefined' && window.turf) {
      try {
        const center = window.turf.point([this.currentLocation.longitude, this.currentLocation.latitude]);
        const jobPoint = window.turf.point([job.longitude, job.latitude]);
        const distance = window.turf.distance(center, jobPoint, { units: 'kilometers' });
        return distance <= this.geofence.radius;
      } catch (error) {
        console.warn('Turf.js calculation failed, falling back to haversine formula:', error);
      }
    }

    // Fallback to haversine formula if Turf.js is not available
    const distance = this.calculateDistance(
      this.currentLocation.latitude,
      this.currentLocation.longitude,
      job.latitude,
      job.longitude
    );

    return distance <= this.geofence.radius;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  onLocationUpdate(callback: (location: Location) => void): void {
    this.locationUpdateCallbacks.push(callback);
  }

  onLocationError(callback: (error: GeolocationPositionError) => void): void {
    this.errorCallbacks.push(callback);
  }

  private notifyLocationCallbacks(location: Location): void {
    this.locationUpdateCallbacks.forEach(callback => callback(location));
  }

  private notifyErrorCallbacks(error: GeolocationPositionError): void {
    this.errorCallbacks.forEach(callback => callback(error));
  }

  getCurrentLocationData(): Location | null {
    return this.currentLocation;
  }

  getGeofence(): GeofenceOptions | null {
    return this.geofence;
  }
}

export const geolocationService = new GeolocationService();
