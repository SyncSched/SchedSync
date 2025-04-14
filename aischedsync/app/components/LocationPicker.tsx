"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState, useEffect } from "react";
import LocateUser from "./LocateUser";
import LocationSelector from "./LocationSelector";
import L from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });

type Props = {
  onSelect: (latlng: L.LatLngLiteral, locationName?: string) => void;
  initialLocation?: L.LatLngLiteral;
  initialLocationName?: string;
};

export default function LocationPicker({ onSelect, initialLocation, initialLocationName }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<L.LatLngLiteral | null>(initialLocation || null);
  const [locationDisplayName, setLocationDisplayName] = useState<string>(initialLocationName || "");

  // Set global variable for LocationSelector to access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__LOCATION_PICKER_PROPS__ = {
        initialLocation,
        initialLocationName
      };
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__LOCATION_PICKER_PROPS__;
      }
    };
  }, [initialLocation, initialLocationName]);

  const handleLocationSelect = (latlng: L.LatLngLiteral, name: string = "") => {
    console.log("Selected Location:", latlng, "Name:", name);
    setSelectedLocation(latlng);
    setLocationDisplayName(name);
    onSelect(latlng, name);
    // You can store it in form state or send it to backend here
  };

  return (
    <div style={{ height: "500px", width: "100%" }}>

      <MapContainer
        center={initialLocation || [20, 78]}
        zoom={initialLocation ? 15 : 5}
        style={{ height: "100%", width: "100%" }}
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateUser showInitialLocation={!!initialLocation} />
        <LocationSelector onSelect={handleLocationSelect} />
      </MapContainer>

      {locationDisplayName && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="font-medium">{locationDisplayName}</div>
        </div>
      )}

      {selectedLocation && !locationDisplayName && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <span className="font-medium">Lat:</span> {selectedLocation.lat.toFixed(6)}, <span className="font-medium">Lng:</span> {selectedLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}
