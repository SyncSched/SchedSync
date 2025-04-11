"use client";
import { useEffect, useState } from "react";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import L from "leaflet";

type Props = {
  onSelect: (latlng: L.LatLngLiteral) => void;
};

const LocationSelector = ({ onSelect }: Props) => {
  const [position, setPosition] = useState<L.LatLngLiteral | null>(null);

  useMapEvents({
    dblclick(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Selected location</Popup>
    </Marker>
  ) : null;
};

export default LocationSelector;
