"use client";
import { useState, useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  onLocationFound?: (latlng: L.LatLngLiteral, name: string) => void;
};

const LocationSearch = ({ onLocationFound }: Props) => {
  const map = useMap();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submission
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchTerm
        )}&limit=5`
      );
      const data = await response.json();
      setResults(data);
      setIsResultsVisible(true);
    } catch (error) {
      console.error("Error searching for location:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a search result
  const handleSelectResult = (result: SearchResult) => {
    const latlng = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    };

    // Move map to the selected location
    map.setView(latlng, 16);

    // Call the callback if provided
    if (onLocationFound) {
      onLocationFound(latlng, result.display_name);
    }

    // Clear search results
    setResults([]);
    setIsResultsVisible(false);
    setSearchTerm("");
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsResultsVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={searchContainerRef}
      className="leaflet-top leaflet-right"
      style={{ zIndex: 1000, margin: "10px" }}
    >
      <div className="leaflet-control leaflet-bar">
        <div className="bg-white p-2 rounded shadow-md w-64">
          <div className="flex">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              placeholder="Search for a location..."
              className="flex-grow px-2 py-1 border border-gray-300 rounded-l text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-500 text-white px-2 py-1 rounded-r hover:bg-blue-600 focus:outline-none"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
          </div>

          {isLoading && (
            <div className="mt-2 text-center text-sm text-gray-500">
              Searching...
            </div>
          )}

          {isResultsVisible && results.length > 0 && (
            <div className="mt-2 max-h-60 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {results.map((result, index) => (
                  <li
                    key={index}
                    className="py-2 px-1 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => handleSelectResult(result)}
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isResultsVisible && results.length === 0 && !isLoading && (
            <div className="mt-2 text-center text-sm text-gray-500">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationSearch;
