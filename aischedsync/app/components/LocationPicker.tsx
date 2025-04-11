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
  onSelect: (latlng: L.LatLngLiteral) => void;
};

export default function LocationPicker({ onSelect }: Props) {
  const [selectedLocation, setSelectedLocation] = useState<L.LatLngLiteral | null>(null);

  const handleLocationSelect = (latlng: L.LatLngLiteral) => {
    console.log("Selected Location:", latlng);
    setSelectedLocation(latlng);
    onSelect(latlng)
    // You can store it in form state or send it to backend here
  };

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%" }}   doubleClickZoom={false} >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocateUser />
        <LocationSelector onSelect={handleLocationSelect} />
      </MapContainer>

      {selectedLocation && (
        <div className="mt-4">
          <strong>Latitude:</strong> {selectedLocation.lat} <br />
          <strong>Longitude:</strong> {selectedLocation.lng}
        </div>
      )}
    </div>
  );
}
