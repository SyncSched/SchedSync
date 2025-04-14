"use client";
import { useState, useCallback } from "react";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import LocationSearch from "./LocationSearch";

type Props = {
  onSelect: (latlng: L.LatLngLiteral) => void;
};

const LocationSelector = ({ onSelect }: Props) => {
  const [position, setPosition] = useState<L.LatLngLiteral | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  useMapEvents({
    dblclick(e) {
      setPosition(e.latlng);
      setLocationName("Selected location");
      // We don't call onSelect here anymore, user needs to confirm
    },
  });

  const handleLocationFound = useCallback((latlng: L.LatLngLiteral, name: string) => {
    setPosition(latlng);
    setLocationName(name);
    // We don't call onSelect here anymore, user needs to confirm
  }, []);

  const handleConfirmLocation = useCallback(() => {
    console.log("Confirmed Location:", position);
    if (position) {
      onSelect(position);
    }
  }, [position, onSelect]);

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
