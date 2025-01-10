import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  marginTop: '20px'
};

const defaultCenter = {
  lat: 51.5074,
  lng: -0.1278
};

const ScooterMap = ({ scooterLocation, userLocation }) => {
  if (!scooterLocation) return null;

  return (
    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={scooterLocation}
        zoom={15}
      >
        <Marker
          position={scooterLocation}
          icon={{
            url: '/scooter-icon.png',
            scaledSize: { width: 32, height: 32 }
          }}
        />
        
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: '/user-location.png',
              scaledSize: { width: 32, height: 32 }
            }}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};


export default ScooterMap