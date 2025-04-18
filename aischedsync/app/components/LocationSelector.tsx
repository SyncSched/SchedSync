"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import LocationSearch from "./LocationSearch";

type Props = {
  onSelect: (latlng: L.LatLngLiteral, locationName?: string) => void;
};

const LocationSelector = ({ onSelect }: Props) => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLngLiteral | null>(null);
  const [locationName, setLocationName] = useState<string>("");

  // Reference to store the selected location marker
  const selectedMarkerRef = useRef<L.Marker | null>(null);

  // Function to create or update the selected location marker
  const updateSelectedMarker = useCallback((pos: L.LatLngLiteral, name: string = '') => {
    // Remove existing marker if any
    if (selectedMarkerRef.current) {
      map.removeLayer(selectedMarkerRef.current);
    }

    // Create a new marker with a distinctive style
    selectedMarkerRef.current = L.marker(pos, {
      icon: L.divIcon({
        className: 'selected-location-marker',
        html: `<div style="background-color: #FF4136; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9]
      })
    }).addTo(map);

    // Add a popup with the location name
    const popupContent = name || `Location at ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`;
    selectedMarkerRef.current.bindPopup(popupContent).openPopup();
  }, [map]);

  // Check if there's an initial location in the parent component
  useEffect(() => {
    // Get the parent LocationPicker component props
    if (typeof window !== 'undefined') {
      const parentProps = (window as Window & { __LOCATION_PICKER_PROPS__?: { initialLocation?: L.LatLngLiteral; initialLocationName?: string } }).__LOCATION_PICKER_PROPS__;
      if (parentProps?.initialLocation) {
        console.log('Found initial location:', parentProps.initialLocation);

        // Set the position and location name in our component state
        setPosition(parentProps.initialLocation);
        if (parentProps.initialLocationName) {
          setLocationName(parentProps.initialLocationName);
        }

        // Center the map on the initial location with appropriate zoom
        map.setView(parentProps.initialLocation, 15);

        // Create a marker for the initial location
        updateSelectedMarker(
          parentProps.initialLocation,
          parentProps.initialLocationName || ''
        );
      }
    }

    // Cleanup function to remove markers when component unmounts
    return () => {
      if (selectedMarkerRef.current) {
        map.removeLayer(selectedMarkerRef.current);
      }
    };
  }, [map, updateSelectedMarker]);

  // Update marker when position changes
  useEffect(() => {
    if (position && locationName) {
      updateSelectedMarker(position, locationName);
    } else if (position) {
      updateSelectedMarker(position);
    }
  }, [position, locationName, updateSelectedMarker]);

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
          {/* We're using direct Leaflet markers instead of react-leaflet components */}

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
