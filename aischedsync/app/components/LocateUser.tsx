"use client";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

const LocateUser = () => {
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });

    map.on("locationfound", (e: L.LocationEvent) => {
      const radius = e.accuracy;
      L.marker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
      L.circle(e.latlng, radius).addTo(map);
    });

    map.on("locationerror", () => {
      alert("Unable to retrieve your location");
    });
  }, [map]);

  return null;
};

export default LocateUser;
