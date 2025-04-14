"use client";
import { useMap } from "react-leaflet";
import { useEffect, useRef } from "react";
import L from "leaflet";

interface LocateUserProps {
  showInitialLocation?: boolean;
}

const LocateUser = ({ showInitialLocation = true }: LocateUserProps) => {
  const map = useMap();

  // Reference to store user location layers
  const userLayersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    // Only set view to user location if we're not showing an initial location
    const setViewOption = !showInitialLocation;

    // Find user's location
    map.locate({ setView: setViewOption, maxZoom: 16 });

    // Handle when user location is found
    const handleLocationFound = (e: L.LocationEvent) => {
      // Clear any existing user location markers
      userLayersRef.current.forEach(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
      userLayersRef.current = [];

      const radius = e.accuracy;

      // Create user location marker with blue color
      const userMarker = L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: `<div style="background-color: #4285F4; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);

      // Add popup to user marker
      userMarker.bindPopup("Your current location");

      // Create accuracy circle
      const accuracyCircle = L.circle(e.latlng, radius).addTo(map);

      // Store references for cleanup
      userLayersRef.current.push(userMarker, accuracyCircle);

      // Only open popup and set view if we're not showing an initial location
      if (!showInitialLocation) {
        userMarker.openPopup();
      }
    };

    // Handle location errors
    const handleLocationError = () => {
      console.error("Unable to retrieve your location");
    };

    // Add event listeners
    map.on("locationfound", handleLocationFound);
    map.on("locationerror", handleLocationError);

    // Cleanup function to remove all created layers and event listeners
    return () => {
      userLayersRef.current.forEach(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
      map.off("locationfound", handleLocationFound);
      map.off("locationerror", handleLocationError);
    };
  }, [map, showInitialLocation]);

  return null;
};

export default LocateUser;
