"use client";
import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

interface LocateUserProps {
  showInitialLocation?: boolean;
}

const LocateUser = ({ showInitialLocation = true }: LocateUserProps) => {
  const map = useMap();

  useEffect(() => {
    // Only set view to user location if we're not showing an initial location
    const setViewOption = !showInitialLocation;

    map.locate({ setView: setViewOption, maxZoom: 16 });

    map.on("locationfound", (e: L.LocationEvent) => {
      const radius = e.accuracy;
      const userMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `<div style="background-color: #4285F4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);

      userMarker.bindPopup("Your current location");
      L.circle(e.latlng, radius).addTo(map);

      // Only open popup and set view if we're not showing an initial location
      if (!showInitialLocation) {
        userMarker.openPopup();
      }
    });

    map.on("locationerror", () => {
      console.error("Unable to retrieve your location");
    });

    return () => {
      map.off("locationfound");
      map.off("locationerror");
    };
  }, [map, showInitialLocation]);

  return null;
};

export default LocateUser;
