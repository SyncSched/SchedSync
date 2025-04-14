"use client";
import { useState, useCallback, useEffect } from "react";
import { useMapEvents, useMap, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import LocationSearch from "./LocationSearch";

type Props = {
  onSelect: (latlng: L.LatLngLiteral, locationName?: string) => void;
};

const LocationSelector = ({ onSelect }: Props) => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLngLiteral | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  // Check if there's an initial location in the parent component
  useEffect(() => {
    // Get the parent LocationPicker component props
    if (typeof window !== 'undefined') {
      const parentProps = (window as any).__LOCATION_PICKER_PROPS__;
      if (parentProps?.initialLocation) {
        setPosition(parentProps.initialLocation);
        if (parentProps.initialLocationName) {
          setLocationName(parentProps.initialLocationName);
        }
        map.setView(parentProps.initialLocation, 15);
      }
    }
  }, [map]);

  useMapEvents({
    dblclick(e) {
      setPosition(e.latlng);
      // Get location name from reverse geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
          if (data.display_name) {
            setLocationName(data.display_name);
          } else {
            setLocationName(`Location at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
          }
        })
        .catch(() => {
          setLocationName(`Location at ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
        });
      // We don't call onSelect here anymore, user needs to confirm
    },
  });

  const handleLocationFound = useCallback((latlng: L.LatLngLiteral, name: string) => {
    setPosition(latlng);
    setLocationName(name);
    // We don't call onSelect here anymore, user needs to confirm
  }, []);

  const handleConfirmLocation = useCallback(() => {
    console.log("Confirmed Location:", position, "Name:", locationName);
    if (position) {
      onSelect(position, locationName);
    }
  }, [position, locationName, onSelect]);

  return (
    <>
      <LocationSearch onLocationFound={handleLocationFound} />
      {position && (
        <>
          <Marker position={position}>
            <Popup>{locationName}</Popup>
          </Marker>

          {/* Floating confirmation button */}
          <div className="leaflet-bottom leaflet-right" style={{ zIndex: 1000, margin: "10px" }}>
            <div className="leaflet-control">
              <button
                onClick={handleConfirmLocation}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded shadow-md transition-colors duration-200"
              >
                Set Location
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default LocationSelector;
