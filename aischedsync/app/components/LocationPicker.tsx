"use client";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import LocateUser from "./LocateUser";
import LocationSelector from "./LocationSelector";
import L from "leaflet";

const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });

type Props = {
  onSelect: (latlng: L.LatLngLiteral, locationName?: string) => void;
};

export default function LocationPicker({ onSelect }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<L.LatLngLiteral | null>(null);
  const [locationDisplayName, setLocationDisplayName] = useState<string>("");

  const handleLocationSelect = (latlng: L.LatLngLiteral, name: string = "") => {
    console.log("Selected Location:", latlng, "Name:", name);
    setSelectedLocation(latlng);
    setLocationDisplayName(name);
    onSelect(latlng, name);
    // You can store it in form state or send it to backend here
  };

  return (
    <div style={{ height: "500px", width: "100%" }}>

      <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%" }} doubleClickZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateUser />
        <LocationSelector onSelect={handleLocationSelect} />
      </MapContainer>

      {selectedLocation && (
        <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>{locationDisplayName ? 'Selected location:' : 'Location selected at coordinates:'}</span>
          </div>
          {locationDisplayName ? (
            <div className="mt-1 pl-4 font-medium">{locationDisplayName}</div>
          ) : (
            <div className="mt-1 pl-4">
              <span className="font-medium">Lat:</span> {selectedLocation.lat.toFixed(6)}, <span className="font-medium">Lng:</span> {selectedLocation.lng.toFixed(6)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
