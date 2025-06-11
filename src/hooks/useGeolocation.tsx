
import { useState, useEffect } from 'react';
import { useGeolocated } from 'react-geolocated';

export const useGeolocation = () => {
  const [locationEnabled, setLocationEnabled] = useState(false);

  const {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
  } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: false,
    },
    watchPosition: true,
  });

  useEffect(() => {
    if (coords) {
      console.log("Latitude is:", coords.latitude);
      console.log("Longitude is:", coords.longitude);
      setLocationEnabled(true);
    }
  }, [coords]);

  return {
    coords,
    isGeolocationAvailable,
    isGeolocationEnabled,
    getPosition,
    locationEnabled,
  };
};
